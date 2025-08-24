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
      response = `Great! I've logged your expense of $${expenseData.amount} for ${expenseData.description} in the ${expenseData.category} category.`;

    } else if (actionType === 'income') {
      // Extract income information
      const incomeData = extractIncomeData(message, userId);
      
      const { data, error } = await supabase
        .from('income')
        .insert([incomeData])
        .select();

      if (error) {
        console.error('Error creating income:', error);
        throw error;
      }

      console.log('Income created successfully:', data);
      response = `Excellent! I've logged your income of $${incomeData.amount} for ${incomeData.description} in the ${incomeData.category} category.`;

    } else if (actionType === 'fitness') {
      // Extract fitness information and save to database
      const fitnessData = extractFitnessData(message, userId);
      
      const { data, error } = await supabase
        .from('fitness_workouts')
        .insert([fitnessData])
        .select();

      if (error) {
        console.error('Error creating fitness workout:', error);
        throw error;
      }

      console.log('Fitness workout created successfully:', data);
      response = `Awesome! I've logged your workout: ${fitnessData.exercise_name}${fitnessData.duration_minutes ? ` for ${fitnessData.duration_minutes} minutes` : ''}. Great job staying active!`;

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

  // Extract description/category with better patterns
  let description = 'Expense';
  let category = 'Other';
  
  // Patterns to extract expense description
  const expensePatterns = [
    /(?:log|add|record|track).*?expense.*?(?:for|on)\s+([a-zA-Z\s]+?)(?:\s+\$|\s+for|\s*$)/i,
    /(?:spent|paid)\s+\$?\d+(?:\.\d{2})?\s+(?:for|on)\s+([a-zA-Z\s]+?)(?:\s|$)/i,
    /(?:bought|purchased)\s+([a-zA-Z\s]+?)(?:\s+for|\s+\$|\s*$)/i,
    /\$?\d+(?:\.\d{2})?\s+(?:for|on)\s+([a-zA-Z\s]+?)(?:\s|$)/i,
    /(?:expense|cost).*?(?:for|on)\s+([a-zA-Z\s]+?)(?:\s|$)/i
  ];
  
  for (const pattern of expensePatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      description = match[1].trim();
      break;
    }
  }
  
  // Map common descriptions to categories
  const categoryMap: { [key: string]: string } = {
    'gym': 'Fitness',
    'fitness': 'Fitness',
    'workout': 'Fitness',
    'food': 'Food',
    'lunch': 'Food',
    'dinner': 'Food',
    'breakfast': 'Food',
    'coffee': 'Food',
    'gas': 'Transportation',
    'uber': 'Transportation',
    'taxi': 'Transportation',
    'shopping': 'Shopping',
    'groceries': 'Groceries',
    'entertainment': 'Entertainment',
    'movie': 'Entertainment'
  };
  
  const lowerDesc = description.toLowerCase();
  for (const [key, value] of Object.entries(categoryMap)) {
    if (lowerDesc.includes(key)) {
      category = value;
      break;
    }
  }

  return {
    user_id: userId,
    amount: amount,
    category: category,
    description: description,
    date: new Date().toISOString()
  };
}

function extractIncomeData(message: string, userId: string) {
  // Extract amount
  const amountMatch = message.match(/\$?(\d+(?:\.\d{2})?)/);
  const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;

  // Extract description/category with better patterns
  let description = 'Income';
  let category = 'Other';
  
  // Patterns to extract income description
  const incomePatterns = [
    /(?:log|add|record|track).*?income.*?(?:from|for)\s+([a-zA-Z\s]+?)(?:\s+\$|\s+for|\s*$)/i,
    /(?:received|earned|got)\s+\$?\d+(?:\.\d{2})?\s+(?:from|for)\s+([a-zA-Z\s]+?)(?:\s|$)/i,
    /(?:payment|salary|wage|commission).*?(?:from|for)\s+([a-zA-Z\s]+?)(?:\s|$)/i,
    /\$?\d+(?:\.\d{2})?\s+(?:from|for)\s+([a-zA-Z\s]+?)(?:\s|$)/i,
    /(?:income|earnings).*?(?:from|for)\s+([a-zA-Z\s]+?)(?:\s|$)/i
  ];
  
  for (const pattern of incomePatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      description = match[1].trim();
      break;
    }
  }
  
  // Map common descriptions to categories
  const categoryMap: { [key: string]: string } = {
    'salary': 'Salary',
    'freelance': 'Freelance',
    'client': 'Client Work',
    'job': 'Employment',
    'work': 'Employment',
    'commission': 'Commission',
    'bonus': 'Bonus',
    'project': 'Project',
    'consulting': 'Consulting',
    'investment': 'Investment',
    'dividend': 'Investment',
    'rental': 'Rental Income',
    'side': 'Side Hustle'
  };
  
  const lowerDesc = description.toLowerCase();
  for (const [key, value] of Object.entries(categoryMap)) {
    if (lowerDesc.includes(key)) {
      category = value;
      break;
    }
  }

  return {
    user_id: userId,
    amount: amount,
    category: category,
    description: description,
    date: new Date().toISOString(),
    is_recurring: false
  };
}

function extractFitnessData(message: string, userId: string) {
  // Extract exercise name
  const exercisePatterns = [
    /(?:did|completed|finished|logged)\s+([a-zA-Z\s]+?)(?:\s+for|\s+\d+|\s*$)/i,
    /(?:workout|exercise).*?:\s*([a-zA-Z\s]+?)(?:\s+for|\s+\d+|\s*$)/i,
    /(?:went|did)\s+([a-zA-Z\s]+?)(?:\s+for|\s+\d+|\s*$)/i
  ];
  
  let exerciseName = 'Workout';
  for (const pattern of exercisePatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      exerciseName = match[1].trim();
      break;
    }
  }
  
  // Extract duration
  const durationMatch = message.match(/(\d+)\s*(?:minutes?|mins?|hours?|hrs?)/i);
  const duration = durationMatch ? parseInt(durationMatch[1]) : null;
  
  // Convert hours to minutes if needed
  const finalDuration = message.toLowerCase().includes('hour') && duration ? duration * 60 : duration;
  
  // Extract exercise type based on common activities
  const exerciseTypeMap: { [key: string]: string } = {
    'running': 'Cardio',
    'jogging': 'Cardio',
    'cycling': 'Cardio',
    'biking': 'Cardio',
    'swimming': 'Cardio',
    'walking': 'Cardio',
    'weights': 'Strength',
    'lifting': 'Strength',
    'pushups': 'Strength',
    'squats': 'Strength',
    'yoga': 'Flexibility',
    'stretching': 'Flexibility',
    'pilates': 'Flexibility',
    'gym': 'General',
    'workout': 'General'
  };
  
  let exerciseType = 'General';
  const lowerMessage = message.toLowerCase();
  for (const [key, value] of Object.entries(exerciseTypeMap)) {
    if (lowerMessage.includes(key)) {
      exerciseType = value;
      break;
    }
  }

  return {
    user_id: userId,
    exercise_name: exerciseName,
    exercise_type: exerciseType,
    duration_minutes: finalDuration,
    workout_date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    notes: message
  };
}