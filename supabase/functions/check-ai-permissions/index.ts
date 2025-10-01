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

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Get feature flags for this user
    const { data: flags, error: flagsError } = await supabaseClient
      .from('feature_flags')
      .select('*')
      .or(`user_id.eq.${user.id},user_id.is.null`)
      .in('feature_name', ['perplexity', 'gemini', 'lovable']);

    const featureMap = {
      perplexity: { enabled: true, max_qph: 20 },
      gemini: { enabled: true, max_qph: 30 },
      lovable: { enabled: true, max_qph: 50 }
    };

    // Apply feature flags
    if (flags && flags.length > 0) {
      flags.forEach(flag => {
        if (flag.feature_name in featureMap) {
          featureMap[flag.feature_name as keyof typeof featureMap].enabled = flag.is_enabled;
          if (flag.config && flag.config.max_qph) {
            featureMap[flag.feature_name as keyof typeof featureMap].max_qph = flag.config.max_qph;
          }
        }
      });
    }

    // Get current usage
    const { data: usage, error: usageError } = await supabaseClient
      .rpc('get_ai_usage', { p_user_id: user.id });

    const usageMap = {
      perplexity: { used: 0, limit: featureMap.perplexity.max_qph },
      gemini: { used: 0, limit: featureMap.gemini.max_qph },
      lovable: { used: 0, limit: featureMap.lovable.max_qph }
    };

    if (usage && usage.length > 0) {
      usage.forEach((u: any) => {
        if (u.engine in usageMap) {
          usageMap[u.engine as keyof typeof usageMap].used = u.used || 0;
          usageMap[u.engine as keyof typeof usageMap].limit = u.usage_limit || usageMap[u.engine as keyof typeof usageMap].limit;
        }
      });
    }

    return new Response(
      JSON.stringify({
        features: featureMap,
        usage: usageMap,
        allowed: {
          perplexity: featureMap.perplexity.enabled && usageMap.perplexity.used < usageMap.perplexity.limit,
          gemini: featureMap.gemini.enabled && usageMap.gemini.used < usageMap.gemini.limit,
          lovable: featureMap.lovable.enabled && usageMap.lovable.used < usageMap.lovable.limit
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in check-ai-permissions:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
