const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Static crypto data for reliable functionality
const cryptoData = [
  { id: 1, symbol: 'BTC', name: 'Bitcoin', current_price_cents: 9500000, price_change_24h: 2.5, market_cap_cents: 187000000000000 },
  { id: 1027, symbol: 'ETH', name: 'Ethereum', current_price_cents: 350000, price_change_24h: -1.2, market_cap_cents: 42000000000000 },
  { id: 52, symbol: 'XRP', name: 'XRP', current_price_cents: 60, price_change_24h: 5.8, market_cap_cents: 3400000000000 },
  { id: 2010, symbol: 'ADA', name: 'Cardano', current_price_cents: 45, price_change_24h: -2.1, market_cap_cents: 1600000000000 },
  { id: 5426, symbol: 'SOL', name: 'Solana', current_price_cents: 21000, price_change_24h: 8.3, market_cap_cents: 9800000000000 },
  { id: 74, symbol: 'DOGE', name: 'Dogecoin', current_price_cents: 8, price_change_24h: 12.4, market_cap_cents: 1200000000000 },
  { id: 3408, symbol: 'USDC', name: 'USD Coin', current_price_cents: 100, price_change_24h: 0.1, market_cap_cents: 3200000000000 },
  { id: 6636, symbol: 'DOT', name: 'Polkadot', current_price_cents: 700, price_change_24h: -3.5, market_cap_cents: 950000000000 },
  { id: 11841, symbol: 'MATIC', name: 'Polygon', current_price_cents: 85, price_change_24h: 4.2, market_cap_cents: 850000000000 },
  { id: 1839, symbol: 'BNB', name: 'BNB', current_price_cents: 31000, price_change_24h: 1.8, market_cap_cents: 4700000000000 },
  { id: 1975, symbol: 'LINK', name: 'Chainlink', current_price_cents: 1500, price_change_24h: 3.2, market_cap_cents: 900000000000 },
  { id: 825, symbol: 'USDT', name: 'Tether', current_price_cents: 100, price_change_24h: 0.0, market_cap_cents: 11000000000000 },
  { id: 512, symbol: 'XLM', name: 'Stellar', current_price_cents: 12, price_change_24h: -1.5, market_cap_cents: 350000000000 },
  { id: 1958, symbol: 'TRX', name: 'TRON', current_price_cents: 7, price_change_24h: 2.8, market_cap_cents: 640000000000 },
  { id: 1321, symbol: 'FTT', name: 'FTX Token', current_price_cents: 150, price_change_24h: -5.2, market_cap_cents: 220000000000 }
];

Deno.serve(async (req) => {
  console.log('crypto-list function started, method:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method === 'GET') {
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