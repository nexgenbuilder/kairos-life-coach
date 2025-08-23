import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context } = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Get user context from auth header
    const authHeader = req.headers.get('Authorization');
    let userId = null;
    
    if (authHeader) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false }
      });

      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id;
    }

    // Create system prompt based on context
    let systemPrompt = `You are Kairos, a helpful AI assistant designed to help users manage their life holistically. You can help with:

- Task management and productivity
- Financial planning and expense tracking  
- Health and wellness advice
- Fitness and exercise planning
- Calendar scheduling
- Life goals and personal development

When users ask you to create, update, or manage tasks, expenses, or other data, you should respond with a JSON object containing the action and data, followed by a user-friendly message.

For task creation, respond with:
{
  "action": "create_task",
  "data": {
    "title": "task title",
    "description": "task description",
    "priority": "high|medium|low",
    "status": "todo",
    "due_date": "YYYY-MM-DD" (optional)
  }
}

Then provide a friendly response about what you've done.

Be encouraging, practical, and provide actionable advice. Keep responses concise but helpful.`;

    if (context) {
      systemPrompt += `\n\nCurrent context: The user is in the ${context} section of the app.`;
    }

    console.log('Sending request to OpenAI with message:', message);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    let aiResponse = data.choices[0].message.content;

    // Check if the response contains an action to perform
    let actionPerformed = false;
    const jsonMatch = aiResponse.match(/\{[\s\S]*?"action"[\s\S]*?\}/);
    
    if (jsonMatch && userId) {
      try {
        const actionData = JSON.parse(jsonMatch[0]);
        
        if (actionData.action === 'create_task') {
          // Create task in database
          const supabase = createClient(supabaseUrl, supabaseKey);
          
          const { error: taskError } = await supabase
            .from('tasks')
            .insert([{
              user_id: userId,
              title: actionData.data.title,
              description: actionData.data.description || '',
              priority: actionData.data.priority || 'medium',
              status: actionData.data.status || 'todo',
              due_date: actionData.data.due_date || null
            }]);

          if (taskError) {
            console.error('Error creating task:', taskError);
            aiResponse = "I apologize, but I encountered an error while creating the task. Please try again.";
          } else {
            actionPerformed = true;
            // Remove the JSON from the response
            aiResponse = aiResponse.replace(jsonMatch[0], '').trim();
            console.log('Task created successfully');
          }
        }
      } catch (parseError) {
        console.error('Error parsing action JSON:', parseError);
      }
    }

    console.log('OpenAI response received:', aiResponse);

    return new Response(JSON.stringify({ 
      response: aiResponse,
      userId: userId 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});