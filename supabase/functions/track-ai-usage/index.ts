import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { engine, increment = 1 } = await req.json();
    
    if (!engine || !['perplexity', 'gemini', 'lovable'].includes(engine)) {
      throw new Error('Invalid engine specified');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Call the increment function
    const { data, error } = await supabaseClient
      .rpc('increment_ai_usage', {
        p_user_id: user.id,
        p_engine: engine,
        p_amount: increment
      });

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({
        success: data,
        message: data ? 'Usage tracked successfully' : 'Quota exceeded'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: data ? 200 : 429
      }
    );
  } catch (error) {
    console.error('Error in track-ai-usage:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
