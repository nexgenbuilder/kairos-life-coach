const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Popular S&P 500 stock symbols to fetch from Alpha Vantage
const stockSymbols = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'BRK.B', 
  'LLY', 'AVGO', 'JPM', 'UNH', 'XOM', 'V', 'PG', 'JNJ', 'MA', 'HD', 'NFLX', 'BAC'
];

async function fetchStockData(symbols: string[], apiKey: string) {
  const stockData = [];
  
  // Alpha Vantage allows up to 5 API calls per minute for free tier
  // We'll fetch data for the first 5 stocks to stay within limits
  for (let i = 0; i < Math.min(symbols.length, 5); i++) {
    const symbol = symbols[i];
    
    try {
      console.log(`Fetching data for ${symbol}...`);
      
      // Fetch real-time quote data
      const quoteResponse = await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`
      );
      
      if (!quoteResponse.ok) {
        console.error(`Failed to fetch quote for ${symbol}: ${quoteResponse.status}`);
        continue;
      }
      
      const quoteData = await quoteResponse.json();
      console.log(`Quote data for ${symbol}:`, quoteData);
      
      const quote = quoteData['Global Quote'];
      if (!quote || !quote['05. price']) {
        console.warn(`No quote data available for ${symbol}`);
        continue;
      }
      
      // Fetch company overview for additional data
      const overviewResponse = await fetch(
        `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${apiKey}`
      );
      
      let companyName = symbol;
      let sector = 'Unknown';
      let marketCap = 0;
      
      if (overviewResponse.ok) {
        const overviewData = await overviewResponse.json();
        if (overviewData.Name) {
          companyName = overviewData.Name;
          sector = overviewData.Sector || 'Unknown';
          marketCap = parseInt(overviewData.MarketCapitalization) || 0;
        }
      }
      
      const currentPrice = parseFloat(quote['05. price']);
      const change = parseFloat(quote['09. change']);
      const changePercent = parseFloat(quote['10. change percent'].replace('%', ''));
      
      stockData.push({
        id: i + 1,
        symbol: symbol,
        name: companyName,
        current_price_cents: Math.round(currentPrice * 100), // Convert to cents
        price_change_24h: changePercent,
        market_cap_cents: marketCap * 100, // Convert to cents
        sector: sector
      });
      
      // Add delay between requests to respect rate limits (12 seconds = 5 requests per minute)
      if (i < Math.min(symbols.length, 5) - 1) {
        await new Promise(resolve => setTimeout(resolve, 12000));
      }
      
    } catch (error) {
      console.error(`Error fetching data for ${symbol}:`, error);
    }
  }
  
  return stockData;
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
      const apiKey = Deno.env.get('ALPHA_VANTAGE_API_KEY');
      
      if (!apiKey) {
        console.error('Alpha Vantage API key not found');
        return new Response(JSON.stringify({ 
          error: 'API key not configured',
          message: 'Alpha Vantage API key is required'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      console.log('Fetching stock data from Alpha Vantage...');
      const stockData = await fetchStockData(stockSymbols, apiKey);
      
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