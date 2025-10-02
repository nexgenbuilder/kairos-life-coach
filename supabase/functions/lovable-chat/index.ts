// Gemini AI Chat Function - Pure Conversation & Image Generation v2.0
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
    console.log('[lovable-chat v2.0] Processing Gemini request');
    
    const contentType = req.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      logSecurityEvent('INVALID_CONTENT_TYPE', { contentType }, req);
      return new Response(
        JSON.stringify({ error: 'Invalid content type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const requestBody = await req.json();
    console.log('[lovable-chat] Request body keys:', Object.keys(requestBody));
    
    const { message, context, forceGPT5, messages, model } = requestBody;

    // Support both single message and messages array format
    let conversationMessages = messages || [];
    let sanitizedMessage = '';
    
    if (message && typeof message === 'string') {
      sanitizedMessage = sanitizeInput(message);
    } else if (!conversationMessages || conversationMessages.length === 0) {
      logSecurityEvent('INVALID_INPUT', { message, messages }, req);
      return new Response(
        JSON.stringify({ error: 'Invalid message format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('[lovable-chat] Processing with', conversationMessages.length, 'messages or single message:', !!sanitizedMessage);
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      console.error('[lovable-chat] LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('[lovable-chat] API key found');

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
      console.error('[lovable-chat] Auth failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('[lovable-chat] User authenticated:', user.id);

    // Rate limiting
    const { data: rateLimitOk, error: rateLimitError } = await supabase.rpc(
      'check_rate_limit',
      { 
        p_endpoint: 'lovable-chat', 
        p_limit: 100, 
        p_window_minutes: 60 
      }
    );

    if (rateLimitError) {
      console.error('[lovable-chat] Rate limit check error:', rateLimitError);
    }

    if (rateLimitOk === false) {
      logSecurityEvent('RATE_LIMIT_EXCEEDED', { user_id: user.id }, req);
      console.log('[lovable-chat] Rate limit exceeded for user:', user.id);
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again later.',
          response: 'I\'m receiving too many requests right now. Please try again in a moment.'
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('[lovable-chat] Rate limit check passed');

    // Build system prompt for pure Gemini experience
    const systemPrompt = `You are Gemini, Google's powerful AI assistant integrated with Kairos through Lovable AI.

**Your Capabilities:**

💬 **Conversation & Knowledge:**
- Answer questions on any topic with up-to-date knowledge
- Explain complex concepts in simple terms
- Help with creative writing, brainstorming, and problem-solving
- Provide research assistance and analysis

🎨 **Image Generation:**
- Generate beautiful images from text descriptions
- Create logos, illustrations, posters, and designs
- Design visual content for any purpose
- Transform ideas into visual reality

**When users ask "what can you do" or "how can you help", explain:**
- "I can answer questions and help with research on any topic"
- "I can generate images - just describe what you want to see"
- "I can help with creative writing, brainstorming, and problem-solving"
- "I can explain concepts, analyze information, and provide insights"

**For image generation, examples:**
- "Generate a futuristic city skyline at sunset"
- "Create a logo for a coffee shop"
- "Design a motivational poster with mountains"

Current context: ${context || 'home'}
Be helpful, conversational, and creative!`;

    // Detect if user is asking for image generation
    const lastMessage = conversationMessages.length > 0 
      ? conversationMessages[conversationMessages.length - 1]?.content 
      : sanitizedMessage;
    
    const isImageRequest = /generate|create|make|draw|design.*image|picture|photo|illustration|logo|poster|banner/i.test(lastMessage || '');
    
    // Use image generation model if needed
    const aiModel = isImageRequest 
      ? 'google/gemini-2.5-flash-image-preview'
      : (model || (forceGPT5 ? 'openai/gpt-5-mini' : 'google/gemini-2.5-flash'));
    
    console.log('[lovable-chat] Using AI model:', aiModel, isImageRequest ? '(IMAGE MODE)' : '');
    
    // Build messages array - support both formats
    const messagesToSend = conversationMessages.length > 0
      ? [{ role: 'system', content: systemPrompt }, ...conversationMessages]
      : [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: sanitizedMessage }
        ];
    
    console.log('[lovable-chat] Sending', messagesToSend.length, 'messages to AI Gateway');
    
    // Build request body for pure Gemini conversation and image generation
    const aiRequestBody: any = {
      model: aiModel,
      messages: messagesToSend,
      temperature: 0.7,
      max_tokens: 2000
    };
    
    // For image generation, enable image modality
    if (isImageRequest) {
      aiRequestBody.modalities = ['image', 'text'];
    }
    
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(aiRequestBody),
    });
    
    console.log('[lovable-chat] AI Gateway response status:', aiResponse.status);

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('[lovable-chat] Lovable AI error:', aiResponse.status, errorText);

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
    console.log('[lovable-chat] AI response data keys:', Object.keys(aiData));
    
    const choice = aiData.choices?.[0];
    const aiMessage = choice?.message?.content;
    const images = choice?.message?.images;
    
    console.log('[lovable-chat] Response has:', {
      message: !!aiMessage,
      images: images?.length || 0
    });

    console.log('[lovable-chat] Returning successful response');

    // Build response for pure Gemini experience
    const responseData: any = {
      choices: [{ 
        message: { 
          content: aiMessage || 'I processed your request.',
          images: images || undefined
        } 
      }],
      response: aiMessage || 'I processed your request.',
      source: aiModel,
      images: images || undefined
    };

    return new Response(
      JSON.stringify(responseData),
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
