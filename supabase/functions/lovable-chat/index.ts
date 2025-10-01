import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Security utilities
function sanitizeInput(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>]/g, '')
    .slice(0, 5000);
}

function logSecurityEvent(event: string, details: any, req: Request) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    event,
    details,
    ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
    userAgent: req.headers.get('user-agent')
  }));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const contentType = req.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      logSecurityEvent('INVALID_CONTENT_TYPE', { contentType }, req);
      return new Response(
        JSON.stringify({ error: 'Invalid content type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { message, context, forceGPT5 } = await req.json();

    if (!message || typeof message !== 'string') {
      logSecurityEvent('INVALID_INPUT', { message }, req);
      return new Response(
        JSON.stringify({ error: 'Invalid message format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const sanitizedMessage = sanitizeInput(message);
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      logSecurityEvent('AUTH_FAILURE', { error: authError }, req);
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting
    const { data: rateLimitOk, error: rateLimitError } = await supabase.rpc(
      'check_rate_limit',
      { p_endpoint: 'lovable-chat', p_limit: 100, p_window_minutes: 60 }
    );

    if (rateLimitError || !rateLimitOk) {
      logSecurityEvent('RATE_LIMIT_EXCEEDED', { user_id: user.id }, req);
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build system prompt with context
    const systemPrompt = `You are Kairos, an intelligent AI life assistant. You help users manage their daily life, including tasks, finances, fitness, health, and more.

Current context: ${context || 'home'}
User is authenticated and can perform actions.

Your capabilities:
- Create tasks and help with productivity
- Track expenses and income
- Log fitness activities and workouts
- Provide health tracking guidance
- Offer advice on time management
- Help with goal setting and planning

Be helpful, concise, and actionable in your responses. When users mention creating tasks, logging expenses, tracking workouts, etc., acknowledge that they can do so directly through the chat.`;

    // Call Lovable AI Gateway
    const aiModel = forceGPT5 ? 'openai/gpt-5-mini' : 'google/gemini-2.5-flash';
    
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: aiModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: sanitizedMessage }
        ],
        temperature: 0.7,
        max_tokens: 500
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Lovable AI error:', aiResponse.status, errorText);

      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: 'Rate limit exceeded. Please try again in a moment.',
            response: 'I\'m experiencing high demand right now. Please try again in a moment.'
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: 'Service credits depleted. Please contact support.',
            response: 'The AI service needs additional credits. Please contact support.'
          }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: 'AI service error', response: 'I\'m having trouble processing that request. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const aiMessage = aiData.choices[0].message.content;

    // Check if user is trying to create a task
    const taskIntent = /create.*task|add.*task|new.*task|make.*task/i.test(sanitizedMessage);
    
    if (taskIntent) {
      const taskTitle = extractTaskTitle(sanitizedMessage);
      const priority = extractPriority(sanitizedMessage);
      
      if (taskTitle) {
        const { error: insertError } = await supabase
          .from('tasks')
          .insert({
            title: taskTitle,
            user_id: user.id,
            priority: priority,
            status: 'todo'
          });
        
        if (insertError) {
          console.error('Error creating task:', insertError);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        response: aiMessage,
        source: forceGPT5 ? 'gpt-5-mini' : 'gemini-flash'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in lovable-chat:', error);
    logSecurityEvent('ERROR', { error: error.message }, req);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        response: 'I encountered an error. Please try again.'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper functions
function extractTaskTitle(message: string): string | null {
  const patterns = [
    /(?:create|add|make|new)\s+(?:a\s+)?task\s+(?:called|named|titled|for)?\s*[:"']?([^"'\n]+)[:"']?/i,
    /task:\s*([^.\n]+)/i,
    /(?:create|add|make)\s+['""]([^'""]+)['""](?:\s+task)?/i,
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return null;
}

function extractPriority(message: string): string {
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('high priority') || lowerMessage.includes('urgent') || lowerMessage.includes('important')) {
    return 'high';
  }
  if (lowerMessage.includes('low priority') || lowerMessage.includes('whenever') || lowerMessage.includes('not urgent')) {
    return 'low';
  }
  return 'medium';
}
