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
    const { message, actionType, context } = await req.json();

    if (!message || !actionType) {
      throw new Error('Message and actionType are required');
    }

    console.log('Processing smart action:', { actionType, message });

    // Get user context from auth header
    const authHeader = req.headers.get('Authorization');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    let userId = null;
    
    if (authHeader) {
      const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false },
        global: {
          headers: {
            Authorization: authHeader
          }
        }
      });

      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id;
    }

    if (!userId) {
      throw new Error('Authentication required');
    }

    // Create authenticated Supabase client for database operations
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
      global: {
        headers: {
          Authorization: authHeader
        }
      }
    });

    let response = '';

    if (actionType === 'task') {
      // Extract task information
      const taskData = extractTaskData(message, userId);
      
      const { data, error } = await supabase
        .from('tasks')
        .insert([taskData])
        .select();

      if (error) {
        console.error('Error creating task:', error);
        throw error;
      }

      console.log('Task created successfully:', data);
      response = `Perfect! I've created the task "${taskData.title}" with ${taskData.priority} priority. You can view it in your tasks list and update it as needed.`;

    } else if (actionType === 'expense') {
      // Extract expense information
      const expenseData = extractExpenseData(message, userId);
      
      const { data, error } = await supabase
        .from('expenses')
        .insert([expenseData])
        .select();

      if (error) {
        console.error('Error creating expense:', error);
        throw error;
      }

      console.log('Expense created successfully:', data);
      response = `Great! I've logged your expense of $${expenseData.amount} in the ${expenseData.category} category.`;

    } else if (actionType === 'fitness') {
      // For fitness, we'll create a simple response since there's no fitness table yet
      // You can extend this when you add fitness tracking
      const fitnessData = extractFitnessData(message);
      response = `Awesome! I've noted your workout: ${fitnessData.exercise}${fitnessData.duration ? ` for ${fitnessData.duration} minutes` : ''}. Great job staying active!`;

    } else {
      throw new Error(`Unknown action type: ${actionType}`);
    }

    return new Response(JSON.stringify({ 
      response: response,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in smart-action function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error',
      response: `I'm sorry, I encountered an error while processing your ${actionType || 'request'}. Please try again.`
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Helper functions to extract structured data from natural language
function extractTaskData(message: string, userId: string) {
  // Look for patterns like "create task [title]", "add task [title]", etc.
  const patterns = [
    /create (?:a )?(?:new )?task (?:called |named )?["']?([^"']+?)["']?(?:\s|$)/i,
    /add (?:a )?(?:new )?task (?:called |named )?["']?([^"']+?)["']?(?:\s|$)/i,
    /new task (?:called |named )?["']?([^"']+?)["']?(?:\s|$)/i,
    /make (?:a )?(?:new )?task (?:called |named )?["']?([^"']+?)["']?(?:\s|$)/i,
    /task (?:called |named )?["']?([^"']+?)["']?(?:\s|$)/i
  ];
  
  let title = 'New Task';
  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      title = match[1].trim();
      break;
    }
  }

  // Extract priority
  const lowerMessage = message.toLowerCase();
  let priority = 'medium';
  if (lowerMessage.includes('high priority') || lowerMessage.includes('urgent')) {
    priority = 'high';
  } else if (lowerMessage.includes('low priority')) {
    priority = 'low';
  }

  return {
    user_id: userId,
    title: title,
    description: '',
    priority: priority,
    status: 'todo'
  };
}

function extractExpenseData(message: string, userId: string) {
  // Extract amount
  const amountMatch = message.match(/\$?(\d+(?:\.\d{2})?)/);
  const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;

  // Extract category
  const categoryPatterns = [
    /(?:for|on|category)\s+([a-zA-Z\s]+)/i,
    /(?:spent|paid)\s+.*?\s+(?:for|on)\s+([a-zA-Z\s]+)/i
  ];
  
  let category = 'Other';
  for (const pattern of categoryPatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      category = match[1].trim();
      break;
    }
  }

  return {
    user_id: userId,
    amount: amount,
    category: category,
    description: message,
    date: new Date().toISOString()
  };
}

function extractFitnessData(message: string) {
  const exerciseMatch = message.match(/(?:did|completed|finished)\s+([^,]+)/i);
  const durationMatch = message.match(/(\d+)\s+(?:minutes?|mins?|hours?|hrs?)/i);
  
  return {
    exercise: exerciseMatch ? exerciseMatch[1].trim() : message,
    duration: durationMatch ? parseInt(durationMatch[1]) : null
  };
}