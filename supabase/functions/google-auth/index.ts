import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Handle OAuth callback from Google (GET request with code parameter)
    const url = new URL(req.url)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state') // This contains the user ID
    
    if (req.method === 'GET' && code && state) {
      // This is the OAuth callback from Google
      const clientId = Deno.env.get('GOOGLE_CLIENT_ID')
      const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')
      const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/google-auth`

      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId!,
          client_secret: clientSecret!,
          code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        }),
      })

      const tokens = await tokenResponse.json()

      if (tokens.error) {
        throw new Error(tokens.error_description || tokens.error)
      }

      // Store tokens in database using service role key for admin access
      const adminClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )
      
      const expiresAt = new Date(Date.now() + tokens.expires_in * 1000)
      
      const { error } = await adminClient
        .from('user_google_tokens')
        .upsert({
          user_id: state, // The user ID from the state parameter
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: expiresAt.toISOString(),
          scope: 'https://www.googleapis.com/auth/calendar',
        })

      if (error) {
        throw error
      }

      // Redirect back to the app with success
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          'Location': `${Deno.env.get('SUPABASE_URL').replace('.supabase.co', '')}.lovable.app/calendar?google_auth=success`
        }
      })
    }

    // For POST requests, we need authentication
    const { data: { user } } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { action, code: requestCode } = await req.json()

    if (action === 'getAuthUrl') {
      // Try different possible environment variable names
      let clientId = Deno.env.get('GOOGLE_CLIENT_ID') || 
                     Deno.env.get('GOOGLE_CLIENT_SECRET') || // In case you mixed them up
                     Deno.env.get('google_client_id') ||
                     Deno.env.get('google_client_secret');
      
      const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/google-auth`
      
      console.log('All env vars:', JSON.stringify(Object.keys(Deno.env.toObject()).sort()));
      console.log('Looking for Google Client ID...');
      console.log('GOOGLE_CLIENT_ID:', Deno.env.get('GOOGLE_CLIENT_ID') ? 'EXISTS' : 'MISSING');
      console.log('GOOGLE_CLIENT_SECRET:', Deno.env.get('GOOGLE_CLIENT_SECRET') ? 'EXISTS' : 'MISSING');
      console.log('Final clientId used:', clientId ? 'EXISTS' : 'MISSING');
      console.log('Supabase URL:', Deno.env.get('SUPABASE_URL'));
      
      if (!clientId) {
        return new Response(
          JSON.stringify({ 
            error: 'Google Client ID not configured',
            debug: {
              availableEnvVars: Object.keys(Deno.env.toObject()).filter(k => k.toLowerCase().includes('google')),
              allEnvKeys: Object.keys(Deno.env.toObject()).length
            }
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent('https://www.googleapis.com/auth/calendar')}&` +
        `access_type=offline&` +
        `prompt=consent&` +
        `state=${user.id}`

      return new Response(
        JSON.stringify({ authUrl }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'exchangeCode') {
      const clientId = Deno.env.get('GOOGLE_CLIENT_ID')
      const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')
      const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/google-auth`

      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId!,
          client_secret: clientSecret!,
          code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        }),
      })

      const tokens = await tokenResponse.json()

      if (tokens.error) {
        throw new Error(tokens.error_description || tokens.error)
      }

      // Store tokens in database
      const expiresAt = new Date(Date.now() + tokens.expires_in * 1000)
      
      const { error } = await supabaseClient
        .from('user_google_tokens')
        .upsert({
          user_id: user.id,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: expiresAt.toISOString(),
          scope: 'https://www.googleapis.com/auth/calendar',
        })

      if (error) {
        throw error
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})