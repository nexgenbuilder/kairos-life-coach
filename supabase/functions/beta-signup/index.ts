import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Input validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const sanitizeString = (str: string): string => {
  return str.trim().replace(/[<>'"]/g, '');
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name } = await req.json();
    
    // Validate inputs
    if (!email || !name) {
      return new Response(
        JSON.stringify({ 
          error: 'Name and email are required' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Validate email format
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid email format' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Validate string lengths
    if (name.length > 100 || email.length > 255) {
      return new Response(
        JSON.stringify({ 
          error: 'Input exceeds maximum length' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Sanitize inputs
    const sanitizedName = sanitizeString(name);
    const sanitizedEmail = sanitizeString(email);

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Insert beta signup request with sanitized inputs
    const { data, error } = await supabase
      .from('beta_signups')
      .insert([{ email: sanitizedEmail, name: sanitizedName }]);

    if (error) {
      // Check if it's a duplicate email error
      if (error.code === '23505') {
        return new Response(
          JSON.stringify({ 
            error: 'This email is already on our beta waitlist' 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 409 
          }
        );
      }
      
      console.error('Database error:', error);
      throw error;
    }

    console.log('Beta signup request received from:', sanitizedEmail);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Thank you! We\'ll contact you when beta access is available.'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201 
      }
    );

  } catch (error) {
    console.error('Error processing beta signup:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process beta signup request' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
})