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
    console.log('[lovable-chat] Request received');
    
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

    // Rate limiting - use correct function signature
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

    // Build comprehensive system prompt
    const systemPrompt = `You are Gemini, a powerful AI assistant integrated with Kairos through Lovable AI.

**Your Full Capabilities:**

📋 **Task Management:**
- Create, update, and track tasks
- Set priorities (high/medium/low) and due dates
- Organize tasks by categories

💰 **Financial Management:**
- Log expenses with categories and amounts
- Track income sources
- Monitor spending patterns

🏃 **Fitness & Health:**
- Log workouts (cardio, strength, flexibility)
- Track health metrics (weight, blood pressure, etc.)
- Manage medications and health goals

📅 **Calendar & Events:**
- Schedule events and meetings
- Set reminders and deadlines
- Manage your calendar

📝 **Notes & Organization:**
- Create and organize notes
- Save important information
- Quick note-taking

👥 **Social & Spaces:**
- Post to shared spaces
- Manage contacts and people
- Track relationships

📍 **Locations:**
- Save favorite locations
- Bookmark important places
- Track location-based information

🎨 **Image Generation:**
- Generate images from text descriptions
- Create visual content and designs
- Edit and enhance images

When users ask "what can you do" or "help me", provide specific examples like:
- "Create a task to finish the report by Friday"
- "Log a $50 grocery expense"
- "Generate an image of a sunset over mountains"
- "Schedule a meeting tomorrow at 2pm"
- "Log my 30-minute run"

You can execute these actions using the available tools. Always use tools when possible rather than just describing what to do.

Current context: ${context || 'home'}
Be helpful, conversational, and proactive. Execute actions when requested.`;

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
    
    // Define comprehensive tools for all module operations
    const tools = [
      {
        type: 'function',
        function: {
          name: 'create_task',
          description: 'Create a new task with title, priority, due date, and description',
          parameters: {
            type: 'object',
            properties: {
              title: { type: 'string', description: 'The task title' },
              priority: { type: 'string', enum: ['low', 'medium', 'high'], description: 'Task priority' },
              due_date: { type: 'string', description: 'Due date in ISO format (optional)' },
              description: { type: 'string', description: 'Task description (optional)' }
            },
            required: ['title']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'log_expense',
          description: 'Log an expense with amount, category, and description',
          parameters: {
            type: 'object',
            properties: {
              amount: { type: 'number', description: 'Expense amount' },
              description: { type: 'string', description: 'What the expense was for' },
              category: { type: 'string', description: 'Expense category (food, transport, shopping, etc.)' },
              date: { type: 'string', description: 'Date in ISO format (optional)' }
            },
            required: ['amount', 'description']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'log_income',
          description: 'Log income with amount, source, and description',
          parameters: {
            type: 'object',
            properties: {
              amount: { type: 'number', description: 'Income amount' },
              description: { type: 'string', description: 'Source of income' },
              date: { type: 'string', description: 'Date in ISO format (optional)' }
            },
            required: ['amount', 'description']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'log_workout',
          description: 'Log a fitness workout',
          parameters: {
            type: 'object',
            properties: {
              exercise_name: { type: 'string', description: 'Name of the exercise' },
              exercise_type: { type: 'string', enum: ['cardio', 'strength', 'flexibility', 'sports'], description: 'Type of exercise' },
              duration_minutes: { type: 'number', description: 'Duration in minutes' },
              calories_burned: { type: 'number', description: 'Estimated calories burned (optional)' },
              notes: { type: 'string', description: 'Additional notes (optional)' }
            },
            required: ['exercise_name', 'exercise_type']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'create_event',
          description: 'Create a calendar event',
          parameters: {
            type: 'object',
            properties: {
              title: { type: 'string', description: 'Event title' },
              start_time: { type: 'string', description: 'Start time in ISO format' },
              end_time: { type: 'string', description: 'End time in ISO format (optional)' },
              description: { type: 'string', description: 'Event description (optional)' },
              location: { type: 'string', description: 'Event location (optional)' }
            },
            required: ['title', 'start_time']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'create_note',
          description: 'Create a note',
          parameters: {
            type: 'object',
            properties: {
              title: { type: 'string', description: 'Note title' },
              content: { type: 'string', description: 'Note content' },
              category: { type: 'string', description: 'Note category (optional)' }
            },
            required: ['title', 'content']
          }
        }
      }
    ];
    
    // Build messages array - support both formats
    const messagesToSend = conversationMessages.length > 0
      ? [{ role: 'system', content: systemPrompt }, ...conversationMessages]
      : [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: sanitizedMessage }
        ];
    
    console.log('[lovable-chat] Sending', messagesToSend.length, 'messages to AI Gateway');
    
    // Build request body
    const requestBody: any = {
      model: aiModel,
      messages: messagesToSend,
      temperature: 0.7,
      max_tokens: 1000
    };
    
    // Add tools for non-image models
    if (!isImageRequest) {
      requestBody.tools = tools;
      requestBody.tool_choice = 'auto';
    } else {
      // For image generation, enable image modality
      requestBody.modalities = ['image', 'text'];
    }
    
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
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
    const toolCalls = choice?.message?.tool_calls;
    const images = choice?.message?.images;
    
    console.log('[lovable-chat] Response has:', {
      message: !!aiMessage,
      toolCalls: toolCalls?.length || 0,
      images: images?.length || 0
    });
    
    // Handle tool calls
    let actionResults: any[] = [];
    if (toolCalls && toolCalls.length > 0) {
      console.log('[lovable-chat] Processing', toolCalls.length, 'tool calls');
      
      for (const toolCall of toolCalls) {
        const functionName = toolCall.function?.name;
        const args = JSON.parse(toolCall.function?.arguments || '{}');
        
        console.log('[lovable-chat] Executing tool:', functionName, 'with args:', args);
        
        try {
          switch (functionName) {
            case 'create_task':
              const { error: taskError } = await supabase.from('tasks').insert({
                title: args.title,
                user_id: user.id,
                priority: args.priority || 'medium',
                due_date: args.due_date || null,
                description: args.description || null,
                status: 'inactive'
              });
              if (taskError) throw taskError;
              actionResults.push({ action: 'task_created', title: args.title });
              break;
              
            case 'log_expense':
              const { error: expenseError } = await supabase.from('expenses').insert({
                user_id: user.id,
                amount: args.amount,
                description: args.description,
                category: args.category || 'other',
                date: args.date || new Date().toISOString()
              });
              if (expenseError) throw expenseError;
              actionResults.push({ action: 'expense_logged', amount: args.amount });
              break;
              
            case 'log_income':
              const { error: incomeError } = await supabase.from('income').insert({
                user_id: user.id,
                amount: args.amount,
                description: args.description,
                category: 'other',
                date: args.date || new Date().toISOString()
              });
              if (incomeError) throw incomeError;
              actionResults.push({ action: 'income_logged', amount: args.amount });
              break;
              
            case 'log_workout':
              const { error: workoutError } = await supabase.from('fitness_workouts').insert({
                user_id: user.id,
                exercise_name: args.exercise_name,
                exercise_type: args.exercise_type,
                duration_minutes: args.duration_minutes || null,
                calories_burned: args.calories_burned || null,
                notes: args.notes || null,
                workout_date: new Date().toISOString().split('T')[0]
              });
              if (workoutError) throw workoutError;
              actionResults.push({ action: 'workout_logged', exercise: args.exercise_name });
              break;
              
            case 'create_event':
              const { error: eventError } = await supabase.from('events').insert({
                user_id: user.id,
                title: args.title,
                start_time: args.start_time,
                end_time: args.end_time || null,
                description: args.description || null,
                location: args.location || null
              });
              if (eventError) throw eventError;
              actionResults.push({ action: 'event_created', title: args.title });
              break;
              
            case 'create_note':
              const { error: noteError } = await supabase.from('notes').insert({
                user_id: user.id,
                title: args.title,
                content: args.content,
                category: args.category || null
              });
              if (noteError) throw noteError;
              actionResults.push({ action: 'note_created', title: args.title });
              break;
          }
        } catch (error) {
          console.error('[lovable-chat] Tool execution error:', error);
          actionResults.push({ action: 'error', tool: functionName, error: error.message });
        }
      }
    }

    console.log('[lovable-chat] Action results:', actionResults);
    console.log('[lovable-chat] Returning successful response');

    // Build response
    const responseData: any = {
      choices: [{ 
        message: { 
          content: aiMessage || 'I processed your request.',
          images: images || undefined
        } 
      }],
      response: aiMessage || 'I processed your request.',
      source: aiModel,
      actions: actionResults.length > 0 ? actionResults : undefined,
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
