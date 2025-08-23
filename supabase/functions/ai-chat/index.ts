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

When users ask you to create tasks, respond naturally and mention what task you're creating. Be encouraging, practical, and provide actionable advice. Keep responses concise but helpful.`;

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
        model: 'gpt-5-2025-08-07',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_completion_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    let aiResponse = data.choices[0].message.content;

    // Check if the user is asking to create a task and we have a user ID
    const createTaskKeywords = ['create task', 'add task', 'new task', 'make task', 'create a task'];
    const isCreatingTask = createTaskKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );
    
    if (isCreatingTask && userId) {
      try {
        // Extract task information from the user's message
        const taskTitle = extractTaskTitle(message);
        const taskPriority = extractPriority(message);
        
        if (taskTitle) {
          const supabase = createClient(supabaseUrl, supabaseKey);
          
          const { error: taskError } = await supabase
            .from('tasks')
            .insert([{
              user_id: userId,
              title: taskTitle,
              description: '',
              priority: taskPriority,
              status: 'todo'
            }]);

          if (taskError) {
            console.error('Error creating task:', taskError);
            aiResponse = "I apologize, but I encountered an error while creating the task. Please try again.";
          } else {
            console.log('Task created successfully:', taskTitle);
            // Update the AI response to confirm the task was actually created
            aiResponse = `Perfect! I've successfully created the task "${taskTitle}" with ${taskPriority} priority. You can view it in your tasks list and update it as needed.`;
          }
        }
      } catch (error) {
        console.error('Error processing task creation:', error);
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
    /create (?:task|a task) (?:called |named )?["']?([^"']+)["']?/i,
    /add (?:task|a task) (?:called |named )?["']?([^"']+)["']?/i,
    /new task (?:called |named )?["']?([^"']+)["']?/i,
    /make (?:task|a task) (?:called |named )?["']?([^"']+)["']?/i,
    /task (?:called |named )?["']?([^"']+)["']?/i
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