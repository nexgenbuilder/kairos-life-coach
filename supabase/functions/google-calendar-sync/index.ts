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

    const { action, eventData } = await req.json()

    // Get user's Google tokens
    const { data: tokenData, error: tokenError } = await supabaseClient
      .from('user_google_tokens')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (tokenError || !tokenData) {
      return new Response(
        JSON.stringify({ error: 'Google Calendar not connected' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if token needs refresh
    let accessToken = tokenData.access_token
    if (new Date(tokenData.expires_at) <= new Date()) {
      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: Deno.env.get('GOOGLE_CLIENT_ID')!,
          client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET')!,
          refresh_token: tokenData.refresh_token!,
          grant_type: 'refresh_token',
        }),
      })

      const refreshTokens = await refreshResponse.json()
      accessToken = refreshTokens.access_token

      // Update stored token
      await supabaseClient
        .from('user_google_tokens')
        .update({
          access_token: accessToken,
          expires_at: new Date(Date.now() + refreshTokens.expires_in * 1000).toISOString(),
        })
        .eq('user_id', user.id)
    }

    if (action === 'syncFromGoogle') {
      // Fetch events from Google Calendar
      const response = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=250',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )

      const googleEvents = await response.json()

      if (googleEvents.error) {
        throw new Error(googleEvents.error.message)
      }

      // Sync events to local database
      for (const event of googleEvents.items || []) {
        if (!event.start?.dateTime || !event.end?.dateTime) continue

        await supabaseClient
          .from('events')
          .upsert({
            user_id: user.id,
            google_event_id: event.id,
            google_calendar_id: event.organizer?.email || 'primary',
            title: event.summary || 'Untitled Event',
            description: event.description || null,
            location: event.location || null,
            start_time: event.start.dateTime,
            end_time: event.end.dateTime,
            is_synced_with_google: true,
          })
      }

      return new Response(
        JSON.stringify({ success: true, synced: googleEvents.items?.length || 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'createEvent') {
      // Create event in Google Calendar
      const googleEvent = {
        summary: eventData.title,
        description: eventData.description,
        location: eventData.location,
        start: {
          dateTime: eventData.start_time,
          timeZone: 'UTC',
        },
        end: {
          dateTime: eventData.end_time,
          timeZone: 'UTC',
        },
      }

      const response = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(googleEvent),
        }
      )

      const createdEvent = await response.json()

      if (createdEvent.error) {
        throw new Error(createdEvent.error.message)
      }

      // Save to local database
      const { data, error } = await supabaseClient
        .from('events')
        .insert({
          user_id: user.id,
          google_event_id: createdEvent.id,
          google_calendar_id: 'primary',
          title: eventData.title,
          description: eventData.description,
          location: eventData.location,
          start_time: eventData.start_time,
          end_time: eventData.end_time,
          is_synced_with_google: true,
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      return new Response(
        JSON.stringify({ success: true, event: data }),
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