import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Rate limiting helper
async function checkRateLimit(supabase: any, identifier: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('failed_auth_attempts')
    .select('created_at')
    .eq('identifier', identifier)
    .gte('created_at', new Date(Date.now() - 15 * 60 * 1000).toISOString());

  if (error) {
    console.error('Rate limit check error:', error);
    return true; // Allow if check fails
  }

  // More than 5 attempts in 15 minutes
  return (data?.length || 0) < 5;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { betaPassword } = await req.json();
    
    // Input validation
    if (!betaPassword || typeof betaPassword !== 'string') {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Invalid request' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Length validation (prevent DOS with huge inputs)
    if (betaPassword.length > 100) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Invalid password' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }
    
    // Get client IP for rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    
    // Create Supabase client for rate limiting
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check rate limit
    const rateLimitPassed = await checkRateLimit(supabase, clientIP);
    if (!rateLimitPassed) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Too many attempts. Please try again later.' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 429 
        }
      );
    }

    // Get the beta password from environment
    const validBetaPassword = Deno.env.get('BETA_PASSWORD');
    
    if (!validBetaPassword) {
      console.error('BETA_PASSWORD environment variable not set');
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Service configuration error' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    // Simple validation - check if provided password matches
    const isValid = betaPassword === validBetaPassword;
    
    // Log failed attempts
    if (!isValid) {
      await supabase
        .from('failed_auth_attempts')
        .insert({
          identifier: clientIP,
          ip_address: clientIP,
          user_agent: req.headers.get('user-agent')
        });
      
      console.log('Failed beta password validation:', { 
        ip: clientIP,
        timestamp: new Date().toISOString()
      });
    }

    return new Response(
      JSON.stringify({ 
        valid: isValid,
        message: isValid ? 'Valid beta password' : 'Invalid beta password'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error validating beta password:', error);
    return new Response(
      JSON.stringify({ 
        valid: false, 
        error: 'Validation error' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
})