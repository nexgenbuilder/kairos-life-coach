const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Using Financial Modeling Prep API (free tier: 250 requests/day)
async function fetchStockData() {
  try {
    console.log('Fetching stock data from Financial Modeling Prep...');
    
    // Free API endpoint for most active stocks
    const response = await fetch(
      'https://financialmodelingprep.com/api/v3/stock-screener?marketCapMoreThan=1000000000&limit=20&apikey=demo'
    );

    if (!response.ok) {
      console.error('Financial Modeling Prep API error:', response.status);
      return [];
    }

    const data = await response.json();
    console.log('API response received, count:', data.length);

    if (!Array.isArray(data)) {
      console.error('Invalid response format');
      return [];
    }

    return data.map((stock: any, index: number) => ({
      id: index + 1,
      symbol: stock.symbol,
      name: stock.companyName || stock.symbol,
      current_price_cents: Math.round((stock.price || 0) * 100),
      price_change_24h: stock.changesPercentage || 0,
      market_cap_cents: Math.round((stock.marketCap || 0) * 100),
      sector: stock.sector || 'Unknown'
    }));
  } catch (error) {
    console.error('Error fetching stock data:', error);
    return [];
  }
}

Deno.serve(async (req) => {
  console.log('stocks-list function started, method:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method === 'GET') {
      const stockData = await fetchStockData();
      console.log('Returning stock data, count:', stockData.length);
      
      return new Response(JSON.stringify({ 
        success: true,
        data: stockData 
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
    console.error('Error in stocks-list function:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});