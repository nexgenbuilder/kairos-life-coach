import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { betaPassword } = await req.json();
    
    // Get the beta password from environment
    const validBetaPassword = Deno.env.get('BETA_PASSWORD');
    
    if (!validBetaPassword) {
      console.error('BETA_PASSWORD environment variable not set');
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Beta password configuration error' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    // Simple validation - check if provided password matches
    const isValid = betaPassword === validBetaPassword;
    
    console.log('Beta password validation attempt:', { 
      provided: betaPassword ? '[REDACTED]' : 'empty',
      result: isValid 
    });

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