import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CoinMarketCapResponse {
  data: {
    [key: string]: {
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
    }
  }
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

    // Get auth user
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabase.auth.getUser(token)

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (req.method === 'GET') {
      // Get user's crypto portfolio
      const { data: portfolio, error: portfolioError } = await supabase
        .from('crypto_portfolio')
        .select('symbol')
        .eq('user_id', user.id)

      if (portfolioError) {
        throw new Error('Failed to fetch portfolio')
      }

      if (!portfolio || portfolio.length === 0) {
        return new Response(JSON.stringify({ data: [] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const symbols = portfolio.map(p => p.symbol).join(',')

      // Fetch prices from CoinMarketCap
      const response = await fetch(
        `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbols}`,
        {
          headers: {
            'X-CMC_PRO_API_KEY': coinMarketCapApiKey,
            'Accept': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch crypto prices')
      }

      const data: CoinMarketCapResponse = await response.json()

      // Update portfolio with current prices
      const updates = Object.values(data.data).map(async (coin) => {
        const priceInCents = Math.round(coin.quote.USD.price * 100)
        
        await supabase
          .from('crypto_portfolio')
          .update({ current_price_cents: priceInCents })
          .eq('user_id', user.id)
          .eq('symbol', coin.symbol)
      })

      await Promise.all(updates)

      console.log('Updated crypto prices for user:', user.id)

      return new Response(JSON.stringify({ success: true, data: data.data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in crypto-prices function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})