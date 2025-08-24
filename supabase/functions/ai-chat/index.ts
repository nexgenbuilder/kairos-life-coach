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
    console.log('OpenAI API Key status:', openAIApiKey ? 'Present' : 'Missing');
    if (!openAIApiKey) {
      console.error('OpenAI API key not found in environment variables');
      throw new Error('OpenAI API key not configured');
    }

    // Get user context from auth header
    const authHeader = req.headers.get('Authorization');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    let userId = null;
    
    if (authHeader) {
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

When users ask you to create tasks, respond naturally and mention what task you're creating. Be encouraging, practical, and provide actionable advice. Keep responses concise but helpful.

IMPORTANT: You do not have access to real-time information like current movie showtimes, weather, news, or live data. When users ask for such information, politely explain that you cannot access real-time data and suggest they check the relevant websites or apps directly. You can still help them plan around such activities or create tasks related to them.`;

    if (context) {
      systemPrompt += `\n\nCurrent context: The user is in the ${context} section of the app.`;
    }

    console.log('Sending request to OpenAI with message:', message);
    console.log('Using model: gpt-5-2025-08-07');

    const requestBody = {
      model: 'gpt-5-2025-08-07',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      max_completion_tokens: 1000,
    };
    
    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('OpenAI response status:', response.status);
    console.log('OpenAI response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error status:', response.status);
      console.error('OpenAI API error response:', errorData);
      throw new Error(`OpenAI API error (${response.status}): ${errorData}`);
    }

    const data = await response.json();
    console.log('OpenAI response received:', JSON.stringify(data, null, 2));
    let aiResponse = data.choices?.[0]?.message?.content || '';
    
    if (!aiResponse) {
      console.error('Empty response from OpenAI. Full data:', data);
      console.error('Choices array:', data.choices);
      console.error('Available data keys:', Object.keys(data));
      aiResponse = "I'm having trouble generating a response right now. Please try again.";
    }

    // Check if the user is asking to create a task and we have a user ID
    const createTaskKeywords = ['create task', 'add task', 'new task', 'make task', 'create a task'];
    const isCreatingTask = createTaskKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );
    
    if (isCreatingTask && userId) {
      try {
        console.log('Attempting to create task for user:', userId);
        // Extract task information from the user's message
        const taskTitle = extractTaskTitle(message);
        const taskPriority = extractPriority(message);
        
        console.log('Extracted task title:', taskTitle);
        console.log('Extracted task priority:', taskPriority);
        
        if (taskTitle) {
          // Create Supabase client with user's auth token
          const taskSupabase = createClient(supabaseUrl, supabaseKey, {
            auth: { persistSession: false },
            global: {
              headers: {
                Authorization: authHeader
              }
            }
          });
          
          const taskData = {
            user_id: userId,
            title: taskTitle,
            description: '',
            priority: taskPriority,
            status: 'todo'
          };
          
          console.log('Inserting task data:', taskData);
          
          const { data, error: taskError } = await taskSupabase
            .from('tasks')
            .insert([taskData])
            .select();

          if (taskError) {
            console.error('Error creating task:', taskError);
            aiResponse = `I apologize, but I encountered an error while creating the task: ${taskError.message}`;
          } else {
            console.log('Task created successfully:', data);
            // Update the AI response to confirm the task was actually created
            aiResponse = `Perfect! I've successfully created the task "${taskTitle}" with ${taskPriority} priority. You can view it in your tasks list and update it as needed.`;
          }
        } else {
          console.log('No task title extracted from message');
        }
      } catch (error) {
        console.error('Error processing task creation:', error);
        aiResponse = `I encountered an error while creating the task: ${error.message}`;
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

// Helper functions to extract task information from natural language
function extractTaskTitle(message: string): string | null {
  // Look for patterns like "create task [title]", "add task [title]", etc.
  const patterns = [
    /create (?:a )?(?:new )?task (?:called |named )?["']?([^"']+?)["']?(?:\s|$)/i,
    /add (?:a )?(?:new )?task (?:called |named )?["']?([^"']+?)["']?(?:\s|$)/i,
    /new task (?:called |named )?["']?([^"']+?)["']?(?:\s|$)/i,
    /make (?:a )?(?:new )?task (?:called |named )?["']?([^"']+?)["']?(?:\s|$)/i,
    /task (?:called |named )?["']?([^"']+?)["']?(?:\s|$)/i
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
  if (lowerMessage.includes('high priority') || lowerMessage.includes('urgent')) {
    return 'high';
  }
  if (lowerMessage.includes('low priority')) {
    return 'low';
  }
  return 'medium';
}