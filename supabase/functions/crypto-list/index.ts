import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Fallback crypto data for testing
const fallbackCryptos = [
  { id: 1, symbol: 'BTC', name: 'Bitcoin', current_price_cents: 9500000, price_change_24h: 2.5, market_cap_cents: 187000000000000 },
  { id: 1027, symbol: 'ETH', name: 'Ethereum', current_price_cents: 350000, price_change_24h: -1.2, market_cap_cents: 42000000000000 },
  { id: 52, symbol: 'XRP', name: 'XRP', current_price_cents: 60, price_change_24h: 5.8, market_cap_cents: 3400000000000 },
  { id: 2010, symbol: 'ADA', name: 'Cardano', current_price_cents: 45, price_change_24h: -2.1, market_cap_cents: 1600000000000 },
  { id: 5426, symbol: 'SOL', name: 'Solana', current_price_cents: 21000, price_change_24h: 8.3, market_cap_cents: 9800000000000 },
  { id: 74, symbol: 'DOGE', name: 'Dogecoin', current_price_cents: 8, price_change_24h: 12.4, market_cap_cents: 1200000000000 },
  { id: 3408, symbol: 'USDC', name: 'USD Coin', current_price_cents: 100, price_change_24h: 0.1, market_cap_cents: 3200000000000 },
  { id: 6636, symbol: 'DOT', name: 'Polkadot', current_price_cents: 700, price_change_24h: -3.5, market_cap_cents: 950000000000 },
  { id: 11841, symbol: 'MATIC', name: 'Polygon', current_price_cents: 85, price_change_24h: 4.2, market_cap_cents: 850000000000 },
  { id: 1839, symbol: 'BNB', name: 'BNB', current_price_cents: 31000, price_change_24h: 1.8, market_cap_cents: 4700000000000 }
];

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
  console.log('crypto-list function called, method:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    if (req.method === 'GET') {
      console.log('Processing GET request for crypto list');
      
      const coinMarketCapApiKey = Deno.env.get('COINMARKETCAP_API_KEY');
      console.log('CoinMarketCap API key exists:', !!coinMarketCapApiKey);

      let formattedCryptos = fallbackCryptos;

      // Try to fetch from CoinMarketCap if API key is available
      if (coinMarketCapApiKey) {
        try {
          console.log('Making request to CoinMarketCap API...');
          const response = await fetch(
            'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?limit=50',
            {
              headers: {
                'X-CMC_PRO_API_KEY': coinMarketCapApiKey,
                'Accept': 'application/json',
              },
            }
          )

          console.log('CoinMarketCap API response status:', response.status);
          
          if (response.ok) {
            console.log('Parsing API response...');
            const data: CoinMarketCapListResponse = await response.json()

            // Format the data for the frontend
            formattedCryptos = data.data.map(coin => ({
              id: coin.id,
              symbol: coin.symbol,
              name: coin.name,
              current_price_cents: Math.round(coin.quote.USD.price * 100),
              price_change_24h: coin.quote.USD.percent_change_24h,
              market_cap_cents: Math.round(coin.quote.USD.market_cap * 100),
            }))
            console.log('Successfully fetched', formattedCryptos.length, 'cryptocurrencies from API');
          } else {
            console.warn('CoinMarketCap API request failed, using fallback data. Status:', response.status);
          }
        } catch (apiError) {
          console.error('CoinMarketCap API error, using fallback data:', apiError);
        }
      } else {
        console.log('No CoinMarketCap API key found, using fallback data');
      }

      console.log('Returning', formattedCryptos.length, 'cryptocurrencies');

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