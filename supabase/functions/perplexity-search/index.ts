import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
    console.log('Perplexity API Key status:', perplexityApiKey ? 'Present' : 'Missing');
    if (!perplexityApiKey) {
      console.error('Perplexity API key not found in environment variables');
      throw new Error('Perplexity API key not configured');
    }

    // Create system prompt based on context
    let systemPrompt = `You are Kairos, a helpful AI assistant with real-time web search capabilities. You can help users with:

- Current information like addresses, phone numbers, business hours
- Recent news and events
- Live data like weather, stock prices, sports scores
- Movie showtimes and entertainment listings
- Restaurant menus and reviews
- Real-time travel information

When providing current information, be specific and include details like addresses, phone numbers, and hours when available. Always mention when information was last updated.`;

    if (context) {
      systemPrompt += `\n\nCurrent context: The user is in the ${context} section of the app.`;
    }

    console.log('Sending request to Perplexity with message:', message);
    console.log('Using model: llama-3.1-sonar-large-128k-online');

    const requestBody = {
      model: 'llama-3.1-sonar-large-128k-online',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.2,
      top_p: 0.9,
      max_tokens: 1000,
      return_images: false,
      return_related_questions: false,
      search_recency_filter: 'month',
      frequency_penalty: 1,
      presence_penalty: 0
    };
    
    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Perplexity response status:', response.status);
    console.log('Perplexity response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Perplexity API error status:', response.status);
      console.error('Perplexity API error response:', errorData);
      throw new Error(`Perplexity API error (${response.status}): ${errorData}`);
    }

    const data = await response.json();
    console.log('Perplexity response received:', JSON.stringify(data, null, 2));
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid Perplexity response structure:', data);
      throw new Error('Invalid response from Perplexity API');
    }
    
    const aiResponse = data.choices[0].message.content || '';
    
    if (!aiResponse || aiResponse.trim() === '') {
      console.error('Empty response from Perplexity. Full data:', data);
      throw new Error('Perplexity returned an empty response');
    }

    console.log('Perplexity response received:', aiResponse);

    return new Response(JSON.stringify({ 
      response: aiResponse,
      source: 'perplexity'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in perplexity-search function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});