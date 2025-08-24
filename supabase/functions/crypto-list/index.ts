import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CoinMarketCapListResponse {
  data: Array<{
    id: number
    name: string
    symbol: string
    quote: {
      USD: {
        price: number
        percent_change_24h: number
        market_cap: number
      }
    }
  }>
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const coinMarketCapApiKey = Deno.env.get('COINMARKETCAP_API_KEY')!

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    if (req.method === 'GET') {
      // Get top 100 cryptocurrencies from CoinMarketCap
      const response = await fetch(
        'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?limit=100',
        {
          headers: {
            'X-CMC_PRO_API_KEY': coinMarketCapApiKey,
            'Accept': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch cryptocurrency list')
      }

      const data: CoinMarketCapListResponse = await response.json()

      // Format the data for the frontend
      const formattedCryptos = data.data.map(coin => ({
        id: coin.id,
        symbol: coin.symbol,
        name: coin.name,
        current_price_cents: Math.round(coin.quote.USD.price * 100),
        price_change_24h: coin.quote.USD.percent_change_24h,
        market_cap_cents: Math.round(coin.quote.USD.market_cap * 100),
      }))

      console.log('Fetched', formattedCryptos.length, 'cryptocurrencies')

      return new Response(JSON.stringify({ data: formattedCryptos }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in crypto-list function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})