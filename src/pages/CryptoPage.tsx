import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Plus, TrendingUp, TrendingDown, DollarSign, Edit, Trash2, Bitcoin, RefreshCw, Eye, Search, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';

interface CryptoHolding {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  average_buy_price_cents: number;
  total_invested_cents: number;
  current_price_cents: number;
  exchange: string;
  wallet_address: string;
  notes: string;
  currency: string;
  created_at: string;
}

interface CryptoWatchlistItem {
  id: string;
  symbol: string;
  name: string;
  current_price_cents: number;
  price_change_24h: number;
  market_cap_cents: number;
  currency: string;
  created_at: string;
}

interface AvailableCrypto {
  id: number;
  symbol: string;
  name: string;
  current_price_cents: number;
  price_change_24h: number;
  market_cap_cents: number;
}

const CryptoPage = () => {
  const { user } = useAuth();
  const [holdings, setHoldings] = useState<CryptoHolding[]>([]);
  const [watchlist, setWatchlist] = useState<CryptoWatchlistItem[]>([]);
  const [availableCryptos, setAvailableCryptos] = useState<AvailableCrypto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHolding, setEditingHolding] = useState<CryptoHolding | null>(null);

  const [formData, setFormData] = useState({
    symbol: '',
    name: '',
    quantity: '',
    average_buy_price_cents: '',
    total_invested_cents: '',
    current_price_cents: '',
    exchange: '',
    wallet_address: '',
    notes: '',
    currency: 'USD'
  });

  useEffect(() => {
    console.log('CryptoPage useEffect triggered, user:', user);
    if (user) {
      loadHoldings();
      loadWatchlist();
      loadAvailableCryptos();
    }
  }, [user]);

  const loadHoldings = async () => {
    try {
      const { data, error } = await supabase
        .from('crypto_portfolio')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHoldings(data || []);
      // Only update prices if we have holdings
      if (data && data.length > 0) {
        updatePrices();
      }
    } catch (error) {
      console.error('Error loading crypto holdings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load crypto holdings',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadWatchlist = async () => {
    try {
      const { data, error } = await supabase
        .from('crypto_watchlist')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWatchlist(data || []);
    } catch (error) {
      console.error('Error loading watchlist:', error);
    }
  };

  const loadAvailableCryptos = async () => {
    try {
      console.log('Loading available cryptos...');
      const { data, error } = await supabase.functions.invoke('crypto-list');
      
      console.log('Function response:', { data, error });
      
      if (error) {
        console.error('Supabase function error:', error);
        // Don't throw error, just show toast and continue
        toast({
          title: 'Warning',
          description: 'Unable to load live crypto data. Using sample data.',
          variant: 'destructive',
        });
        return;
      }
      
      console.log('Received crypto data:', data);
      setAvailableCryptos(data?.data || []);
      console.log('Set availableCryptos count:', data?.data?.length || 0);
    } catch (error) {
      console.error('Error loading available cryptos:', error);
      toast({
        title: 'Warning',
        description: 'Unable to load cryptocurrency data',
        variant: 'destructive',
      });
    }
  };

  const addToWatchlist = async (crypto: AvailableCrypto) => {
    try {
      const { error } = await supabase
        .from('crypto_watchlist')
        .insert([{
          user_id: user!.id,
          symbol: crypto.symbol,
          name: crypto.name,
          current_price_cents: crypto.current_price_cents,
          price_change_24h: crypto.price_change_24h,
          market_cap_cents: crypto.market_cap_cents,
          currency: 'USD'
        }]);

      if (error) throw error;
      toast({
        title: 'Success',
        description: `${crypto.symbol} added to watchlist`,
      });
      loadWatchlist();
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      toast({
        title: 'Error',
        description: 'Failed to add to watchlist',
        variant: 'destructive',
      });
    }
  };

  const removeFromWatchlist = async (id: string) => {
    try {
      const { error } = await supabase
        .from('crypto_watchlist')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({
        title: 'Success',
        description: 'Removed from watchlist',
      });
      loadWatchlist();
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove from watchlist',
        variant: 'destructive',
      });
    }
  };

  const updatePrices = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('crypto-prices', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) {
        console.error('Error updating prices:', error);
        toast({
          title: 'Error',
          description: 'Failed to update crypto prices',
          variant: 'destructive',
        });
      } else {
        // Reload holdings to get updated prices
        const { data: updatedHoldings, error: reloadError } = await supabase
          .from('crypto_portfolio')
          .select('*')
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false });

        if (!reloadError) {
          setHoldings(updatedHoldings || []);
          toast({
            title: 'Success',
            description: 'Crypto prices updated',
          });
        }
      }
    } catch (error) {
      console.error('Error updating prices:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const holdingData = {
        user_id: user.id,
        symbol: formData.symbol.toUpperCase(),
        name: formData.name,
        quantity: parseFloat(formData.quantity),
        average_buy_price_cents: parseInt(formData.average_buy_price_cents) * 100,
        total_invested_cents: parseInt(formData.total_invested_cents) * 100,
        current_price_cents: formData.current_price_cents ? parseInt(formData.current_price_cents) * 100 : 0,
        exchange: formData.exchange || null,
        wallet_address: formData.wallet_address || null,
        notes: formData.notes || null,
        currency: formData.currency
      };

      if (editingHolding) {
        const { error } = await supabase
          .from('crypto_portfolio')
          .update(holdingData)
          .eq('id', editingHolding.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('crypto_portfolio')
          .insert([holdingData]);
        if (error) throw error;
      }

      toast({
        title: 'Success',
        description: `Crypto holding ${editingHolding ? 'updated' : 'added'} successfully`,
      });

      setIsDialogOpen(false);
      setEditingHolding(null);
      resetForm();
      loadHoldings();
    } catch (error) {
      console.error('Error saving crypto holding:', error);
      toast({
        title: 'Error',
        description: 'Failed to save crypto holding',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      symbol: '',
      name: '',
      quantity: '',
      average_buy_price_cents: '',
      total_invested_cents: '',
      current_price_cents: '',
      exchange: '',
      wallet_address: '',
      notes: '',
      currency: 'USD'
    });
  };

  const handleEdit = (holding: CryptoHolding) => {
    setEditingHolding(holding);
    setFormData({
      symbol: holding.symbol,
      name: holding.name,
      quantity: holding.quantity.toString(),
      average_buy_price_cents: (holding.average_buy_price_cents / 100).toString(),
      total_invested_cents: (holding.total_invested_cents / 100).toString(),
      current_price_cents: (holding.current_price_cents / 100).toString(),
      exchange: holding.exchange || '',
      wallet_address: holding.wallet_address || '',
      notes: holding.notes || '',
      currency: holding.currency
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (holdingId: string) => {
    try {
      const { error } = await supabase
        .from('crypto_portfolio')
        .delete()
        .eq('id', holdingId);

      if (error) throw error;
      toast({ title: 'Success', description: 'Crypto holding deleted successfully' });
      loadHoldings();
    } catch (error) {
      console.error('Error deleting crypto holding:', error);
      toast({ title: 'Error', description: 'Failed to delete crypto holding', variant: 'destructive' });
    }
  };

  const totalInvested = holdings.reduce((sum, holding) => sum + holding.total_invested_cents, 0);
  const totalCurrentValue = holdings.reduce((sum, holding) => sum + (holding.current_price_cents * holding.quantity), 0);
  const totalGainLoss = totalCurrentValue - totalInvested;
  const gainLossPercentage = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

  const filteredCryptos = availableCryptos.filter(crypto => 
    crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isInWatchlist = (symbol: string) => {
    return watchlist.some(item => item.symbol === symbol);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto p-6">
          <div className="text-center">Loading...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Crypto Portfolio
          </h1>
          <p className="text-muted-foreground mt-2">
            Track your cryptocurrency investments and watchlist
          </p>
        </div>

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalInvested / 100)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Value</CardTitle>
              <Bitcoin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalCurrentValue / 100)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
              {totalGainLoss >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(totalGainLoss / 100)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">P&L %</CardTitle>
              {gainLossPercentage >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${gainLossPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {gainLossPercentage.toFixed(2)}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Portfolio and Market */}
        <Tabs defaultValue="portfolio" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="portfolio">My Portfolio</TabsTrigger>
            <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
            <TabsTrigger value="market">Explore Market</TabsTrigger>
          </TabsList>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Your Holdings</CardTitle>
                  <div className="flex gap-2">
                    <Button onClick={updatePrices} variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Update Prices
                    </Button>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button onClick={() => { resetForm(); setEditingHolding(null); }}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Holding
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{editingHolding ? 'Edit' : 'Add'} Crypto Holding</DialogTitle>
                          <DialogDescription>
                            {editingHolding ? 'Update your crypto holding information' : 'Add a new cryptocurrency to your portfolio'}
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="symbol">Symbol</Label>
                              <Input
                                id="symbol"
                                value={formData.symbol}
                                onChange={(e) => setFormData(prev => ({ ...prev, symbol: e.target.value }))}
                                placeholder="BTC, ETH, etc."
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="name">Name</Label>
                              <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Bitcoin, Ethereum, etc."
                                required
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="quantity">Quantity</Label>
                              <Input
                                id="quantity"
                                type="number"
                                step="0.00000001"
                                value={formData.quantity}
                                onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="average_buy_price_cents">Avg Buy Price ($)</Label>
                              <Input
                                id="average_buy_price_cents"
                                type="number"
                                step="0.01"
                                value={formData.average_buy_price_cents}
                                onChange={(e) => setFormData(prev => ({ ...prev, average_buy_price_cents: e.target.value }))}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="total_invested_cents">Total Invested ($)</Label>
                              <Input
                                id="total_invested_cents"
                                type="number"
                                step="0.01"
                                value={formData.total_invested_cents}
                                onChange={(e) => setFormData(prev => ({ ...prev, total_invested_cents: e.target.value }))}
                                required
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="current_price_cents">Current Price ($)</Label>
                              <Input
                                id="current_price_cents"
                                type="number"
                                step="0.01"
                                value={formData.current_price_cents}
                                onChange={(e) => setFormData(prev => ({ ...prev, current_price_cents: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="exchange">Exchange</Label>
                              <Input
                                id="exchange"
                                value={formData.exchange}
                                onChange={(e) => setFormData(prev => ({ ...prev, exchange: e.target.value }))}
                                placeholder="Coinbase, Binance, etc."
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="wallet_address">Wallet Address</Label>
                            <Input
                              id="wallet_address"
                              value={formData.wallet_address}
                              onChange={(e) => setFormData(prev => ({ ...prev, wallet_address: e.target.value }))}
                              placeholder="Optional wallet address"
                            />
                          </div>

                          <div>
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                              id="notes"
                              value={formData.notes}
                              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                              placeholder="Additional notes..."
                            />
                          </div>

                          <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button type="submit">
                              {editingHolding ? 'Update' : 'Add'} Holding
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Avg Price</TableHead>
                      <TableHead>Current Price</TableHead>
                      <TableHead>Total Value</TableHead>
                      <TableHead>P&L</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {holdings.map((holding) => {
                      const currentValue = holding.current_price_cents * holding.quantity;
                      const gainLoss = currentValue - holding.total_invested_cents;
                      const gainLossPercent = holding.total_invested_cents > 0 ? (gainLoss / holding.total_invested_cents) * 100 : 0;
                      
                      return (
                        <TableRow key={holding.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{holding.symbol}</div>
                              <div className="text-sm text-muted-foreground">{holding.name}</div>
                            </div>
                          </TableCell>
                          <TableCell>{holding.quantity}</TableCell>
                          <TableCell>{formatCurrency(holding.average_buy_price_cents / 100)}</TableCell>
                          <TableCell>{formatCurrency(holding.current_price_cents / 100)}</TableCell>
                          <TableCell>{formatCurrency(currentValue / 100)}</TableCell>
                          <TableCell>
                            <div className={gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {formatCurrency(gainLoss / 100)}
                              <div className="text-xs">
                                ({gainLossPercent >= 0 ? '+' : ''}{gainLossPercent.toFixed(2)}%)
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" onClick={() => handleEdit(holding)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleDelete(holding.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Watchlist Tab */}
          <TabsContent value="watchlist">
            <Card>
              <CardHeader>
                <CardTitle>Your Watchlist</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>24h Change</TableHead>
                      <TableHead>Market Cap</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {watchlist.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.symbol}</div>
                            <div className="text-sm text-muted-foreground">{item.name}</div>
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(item.current_price_cents / 100)}</TableCell>
                        <TableCell>
                          <div className={item.price_change_24h >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {item.price_change_24h >= 0 ? '+' : ''}{item.price_change_24h.toFixed(2)}%
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(item.market_cap_cents / 100)}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" onClick={() => removeFromWatchlist(item.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Market Tab */}
          <TabsContent value="market">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Explore Cryptocurrencies</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search cryptocurrencies..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>24h Change</TableHead>
                      <TableHead>Market Cap</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCryptos.length === 0 && availableCryptos.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          Loading cryptocurrencies...
                        </TableCell>
                      </TableRow>
                    ) : filteredCryptos.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No cryptocurrencies found matching "{searchTerm}"
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCryptos.map((crypto) => (
                      <TableRow key={crypto.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{crypto.symbol}</div>
                            <div className="text-sm text-muted-foreground">{crypto.name}</div>
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(crypto.current_price_cents / 100)}</TableCell>
                        <TableCell>
                          <div className={crypto.price_change_24h >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {crypto.price_change_24h >= 0 ? '+' : ''}{crypto.price_change_24h.toFixed(2)}%
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(crypto.market_cap_cents / 100)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {isInWatchlist(crypto.symbol) ? (
                              <Button variant="outline" size="sm" disabled>
                                <Star className="h-4 w-4 text-yellow-500" />
                                Watching
                              </Button>
                            ) : (
                              <Button variant="outline" size="sm" onClick={() => addToWatchlist(crypto)}>
                                <Eye className="h-4 w-4" />
                                Watch
                              </Button>
                            )}
                          </div>
                        </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default CryptoPage;