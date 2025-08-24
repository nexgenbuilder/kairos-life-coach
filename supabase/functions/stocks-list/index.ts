const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Static stock data for reliable functionality (S&P 500 popular stocks)
const stocksData = [
  { id: 1, symbol: 'AAPL', name: 'Apple Inc.', current_price_cents: 22500, price_change_24h: 1.2, market_cap_cents: 340000000000000, sector: 'Technology' },
  { id: 2, symbol: 'MSFT', name: 'Microsoft Corporation', current_price_cents: 42000, price_change_24h: -0.8, market_cap_cents: 310000000000000, sector: 'Technology' },
  { id: 3, symbol: 'GOOGL', name: 'Alphabet Inc.', current_price_cents: 18500, price_change_24h: 2.1, market_cap_cents: 230000000000000, sector: 'Technology' },
  { id: 4, symbol: 'AMZN', name: 'Amazon.com Inc.', current_price_cents: 19800, price_change_24h: 1.5, market_cap_cents: 210000000000000, sector: 'Consumer Discretionary' },
  { id: 5, symbol: 'TSLA', name: 'Tesla Inc.', current_price_cents: 41000, price_change_24h: 3.8, market_cap_cents: 130000000000000, sector: 'Automotive' },
  { id: 6, symbol: 'NVDA', name: 'NVIDIA Corporation', current_price_cents: 14200, price_change_24h: 2.9, market_cap_cents: 350000000000000, sector: 'Technology' },
  { id: 7, symbol: 'META', name: 'Meta Platforms Inc.', current_price_cents: 58000, price_change_24h: -1.3, market_cap_cents: 150000000000000, sector: 'Technology' },
  { id: 8, symbol: 'BRK.B', name: 'Berkshire Hathaway Inc.', current_price_cents: 47500, price_change_24h: 0.5, market_cap_cents: 98000000000000, sector: 'Financial Services' },
  { id: 9, symbol: 'LLY', name: 'Eli Lilly and Company', current_price_cents: 78000, price_change_24h: -0.2, market_cap_cents: 74000000000000, sector: 'Healthcare' },
  { id: 10, symbol: 'AVGO', name: 'Broadcom Inc.', current_price_cents: 22800, price_change_24h: 1.7, market_cap_cents: 107000000000000, sector: 'Technology' },
  { id: 11, symbol: 'JPM', name: 'JPMorgan Chase & Co.', current_price_cents: 23500, price_change_24h: 0.8, market_cap_cents: 69000000000000, sector: 'Financial Services' },
  { id: 12, symbol: 'UNH', name: 'UnitedHealth Group Inc.', current_price_cents: 52000, price_change_24h: -0.4, market_cap_cents: 48000000000000, sector: 'Healthcare' },
  { id: 13, symbol: 'XOM', name: 'Exxon Mobil Corporation', current_price_cents: 11500, price_change_24h: 2.3, market_cap_cents: 48000000000000, sector: 'Energy' },
  { id: 14, symbol: 'V', name: 'Visa Inc.', current_price_cents: 30500, price_change_24h: 0.9, market_cap_cents: 64000000000000, sector: 'Financial Services' },
  { id: 15, symbol: 'PG', name: 'Procter & Gamble Co.', current_price_cents: 16800, price_change_24h: -0.1, market_cap_cents: 39000000000000, sector: 'Consumer Staples' },
  { id: 16, symbol: 'JNJ', name: 'Johnson & Johnson', current_price_cents: 15200, price_change_24h: 0.3, market_cap_cents: 36000000000000, sector: 'Healthcare' },
  { id: 17, symbol: 'MA', name: 'Mastercard Inc.', current_price_cents: 48500, price_change_24h: 1.1, market_cap_cents: 45000000000000, sector: 'Financial Services' },
  { id: 18, symbol: 'HD', name: 'The Home Depot Inc.', current_price_cents: 41000, price_change_24h: -0.6, market_cap_cents: 42000000000000, sector: 'Consumer Discretionary' },
  { id: 19, symbol: 'NFLX', name: 'Netflix Inc.', current_price_cents: 89000, price_change_24h: 4.2, market_cap_cents: 38000000000000, sector: 'Communication Services' },
  { id: 20, symbol: 'BAC', name: 'Bank of America Corp.', current_price_cents: 4200, price_change_24h: 1.4, market_cap_cents: 32000000000000, sector: 'Financial Services' }
];

Deno.serve(async (req) => {
  console.log('stocks-list function started, method:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method === 'GET') {
      console.log('Returning stock data, count:', stocksData.length);
      
      return new Response(JSON.stringify({ 
        success: true,
        data: stocksData 
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