const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function fetchCryptoData(apiKey: string) {
  try {
    console.log('Fetching crypto data from CoinMarketCap...');
    
    const response = await fetch(
      'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?start=1&limit=20&convert=USD',
      {
        headers: {
          'X-CMC_PRO_API_KEY': apiKey,
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      console.error('CoinMarketCap API error:', response.status, response.statusText);
      return [];
    }

    const data = await response.json();
    console.log('CoinMarketCap response status:', data.status);

    if (!data.data || !Array.isArray(data.data)) {
      console.error('Invalid response format from CoinMarketCap');
      return [];
    }

    return data.data.map((crypto: any, index: number) => ({
      id: crypto.id,
      symbol: crypto.symbol,
      name: crypto.name,
      current_price_cents: Math.round(crypto.quote.USD.price * 100),
      price_change_24h: crypto.quote.USD.percent_change_24h || 0,
      market_cap_cents: Math.round((crypto.quote.USD.market_cap || 0) * 100)
    }));
  } catch (error) {
    console.error('Error fetching crypto data:', error);
    return [];
  }
}

Deno.serve(async (req) => {
  console.log('crypto-list function started, method:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method === 'GET') {
      const apiKey = Deno.env.get('COINMARKETCAP_API_KEY');
      
      if (!apiKey) {
        console.error('CoinMarketCap API key not found');
        return new Response(JSON.stringify({ 
          error: 'API key not configured',
          message: 'CoinMarketCap API key is required'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const cryptoData = await fetchCryptoData(apiKey);
      console.log('Returning crypto data, count:', cryptoData.length);
      
      return new Response(JSON.stringify({ 
        success: true,
        data: cryptoData 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Method not allowed:', req.method);
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in crypto-list function:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});