const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Static fallback data for when APIs fail
const fallbackStockData = [
  { id: 1, symbol: 'AAPL', name: 'Apple Inc.', current_price_cents: 19000, price_change_24h: 1.2, market_cap_cents: 298000000000000, sector: 'Technology' },
  { id: 2, symbol: 'MSFT', name: 'Microsoft Corporation', current_price_cents: 41500, price_change_24h: 0.8, market_cap_cents: 308000000000000, sector: 'Technology' },
  { id: 3, symbol: 'GOOGL', name: 'Alphabet Inc.', current_price_cents: 17200, price_change_24h: -0.5, market_cap_cents: 212000000000000, sector: 'Technology' },
  { id: 4, symbol: 'AMZN', name: 'Amazon.com Inc.', current_price_cents: 18600, price_change_24h: 2.1, market_cap_cents: 193000000000000, sector: 'Consumer Discretionary' },
  { id: 5, symbol: 'TSLA', name: 'Tesla Inc.', current_price_cents: 24800, price_change_24h: 3.4, market_cap_cents: 78000000000000, sector: 'Consumer Discretionary' },
  { id: 6, symbol: 'NVDA', name: 'NVIDIA Corporation', current_price_cents: 87500, price_change_24h: 4.2, market_cap_cents: 216000000000000, sector: 'Technology' },
  { id: 7, symbol: 'META', name: 'Meta Platforms Inc.', current_price_cents: 51200, price_change_24h: 1.8, market_cap_cents: 130000000000000, sector: 'Technology' },
  { id: 8, symbol: 'BRK.B', name: 'Berkshire Hathaway Inc.', current_price_cents: 45600, price_change_24h: 0.3, market_cap_cents: 98000000000000, sector: 'Financial Services' },
  { id: 9, symbol: 'LLY', name: 'Eli Lilly and Company', current_price_cents: 78900, price_change_24h: -1.2, market_cap_cents: 75000000000000, sector: 'Healthcare' },
  { id: 10, symbol: 'AVGO', name: 'Broadcom Inc.', current_price_cents: 172500, price_change_24h: 2.7, market_cap_cents: 81000000000000, sector: 'Technology' },
  { id: 11, symbol: 'JPM', name: 'JPMorgan Chase & Co.', current_price_cents: 22800, price_change_24h: 0.9, market_cap_cents: 67000000000000, sector: 'Financial Services' },
  { id: 12, symbol: 'UNH', name: 'UnitedHealth Group Inc.', current_price_cents: 52400, price_change_24h: 1.1, market_cap_cents: 49000000000000, sector: 'Healthcare' },
  { id: 13, symbol: 'XOM', name: 'Exxon Mobil Corporation', current_price_cents: 11800, price_change_24h: -0.8, market_cap_cents: 50000000000000, sector: 'Energy' },
  { id: 14, symbol: 'V', name: 'Visa Inc.', current_price_cents: 29600, price_change_24h: 0.7, market_cap_cents: 63000000000000, sector: 'Financial Services' },
  { id: 15, symbol: 'PG', name: 'Procter & Gamble Co.', current_price_cents: 16900, price_change_24h: 0.2, market_cap_cents: 40000000000000, sector: 'Consumer Staples' },
  { id: 16, symbol: 'JNJ', name: 'Johnson & Johnson', current_price_cents: 15700, price_change_24h: -0.3, market_cap_cents: 38000000000000, sector: 'Healthcare' },
  { id: 17, symbol: 'MA', name: 'Mastercard Inc.', current_price_cents: 49800, price_change_24h: 1.4, market_cap_cents: 47000000000000, sector: 'Financial Services' },
  { id: 18, symbol: 'HD', name: 'Home Depot Inc.', current_price_cents: 40500, price_change_24h: 0.6, market_cap_cents: 42000000000000, sector: 'Consumer Discretionary' },
  { id: 19, symbol: 'NFLX', name: 'Netflix Inc.', current_price_cents: 69200, price_change_24h: 2.9, market_cap_cents: 30000000000000, sector: 'Communication Services' },
  { id: 20, symbol: 'BAC', name: 'Bank of America Corp.', current_price_cents: 4350, price_change_24h: 1.5, market_cap_cents: 35000000000000, sector: 'Financial Services' }
];

// Use Yahoo Finance alternative (free, no API key required)
async function fetchStockData() {
  try {
    console.log('Fetching stock data from Yahoo Finance alternative...');
    
    // Free API that doesn't require keys - yfinance proxy
    const symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'BRK-B', 'LLY', 'AVGO', 'JPM', 'UNH', 'XOM', 'V', 'PG', 'JNJ', 'MA', 'HD', 'NFLX', 'BAC'];
    const symbolString = symbols.join(',');
    
    const response = await fetch(
      `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbolString}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    );

    if (!response.ok) {
      console.error('Yahoo Finance API error:', response.status);
      throw new Error('Yahoo Finance API failed');
    }

    const data = await response.json();
    console.log('Yahoo Finance API response received');

    if (!data.quoteResponse || !data.quoteResponse.result) {
      console.error('Invalid response format from Yahoo Finance');
      throw new Error('Invalid response format');
    }

    return data.quoteResponse.result.map((stock: any, index: number) => ({
      id: index + 1,
      symbol: stock.symbol,
      name: stock.longName || stock.shortName || stock.symbol,
      current_price_cents: Math.round((stock.regularMarketPrice || 0) * 100),
      price_change_24h: stock.regularMarketChangePercent || 0,
      market_cap_cents: Math.round((stock.marketCap || 0) * 100),
      sector: stock.sector || 'Unknown'
    }));
  } catch (error) {
    console.error('Error fetching stock data, using fallback:', error);
    return fallbackStockData;
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