import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, TrendingUp, TrendingDown, DollarSign, Edit, Trash2, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';

interface StockHolding {
  id: string;
  symbol: string;
  company_name: string;
  quantity: number;
  average_buy_price_cents: number;
  total_invested_cents: number;
  current_price_cents: number;
  sector: string;
  market: string;
  dividend_yield: number;
  notes: string;
  currency: string;
  created_at: string;
}

const StocksPage = () => {
  const { user } = useAuth();
  const [holdings, setHoldings] = useState<StockHolding[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHolding, setEditingHolding] = useState<StockHolding | null>(null);

  const [formData, setFormData] = useState({
    symbol: '',
    company_name: '',
    quantity: '',
    average_buy_price_cents: '',
    total_invested_cents: '',
    current_price_cents: '',
    sector: '',
    market: 'NYSE',
    dividend_yield: '',
    notes: '',
    currency: 'USD'
  });

  useEffect(() => {
    if (user) {
      loadHoldings();
    }
  }, [user]);

  const loadHoldings = async () => {
    try {
      const { data, error } = await supabase
        .from('stocks_portfolio')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHoldings(data || []);
    } catch (error) {
      console.error('Error loading stock holdings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load stock holdings',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const holdingData = {
        user_id: user.id,
        symbol: formData.symbol.toUpperCase(),
        company_name: formData.company_name,
        quantity: parseInt(formData.quantity),
        average_buy_price_cents: parseInt(formData.average_buy_price_cents) * 100,
        total_invested_cents: parseInt(formData.total_invested_cents) * 100,
        current_price_cents: formData.current_price_cents ? parseInt(formData.current_price_cents) * 100 : 0,
        sector: formData.sector || null,
        market: formData.market,
        dividend_yield: formData.dividend_yield ? parseFloat(formData.dividend_yield) : null,
        notes: formData.notes || null,
        currency: formData.currency
      };

      if (editingHolding) {
        const { error } = await supabase
          .from('stocks_portfolio')
          .update(holdingData)
          .eq('id', editingHolding.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('stocks_portfolio')
          .insert([holdingData]);
        if (error) throw error;
      }

      toast({
        title: 'Success',
        description: `Stock holding ${editingHolding ? 'updated' : 'added'} successfully`,
      });

      setIsDialogOpen(false);
      setEditingHolding(null);
      resetForm();
      loadHoldings();
    } catch (error) {
      console.error('Error saving stock holding:', error);
      toast({
        title: 'Error',
        description: 'Failed to save stock holding',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      symbol: '',
      company_name: '',
      quantity: '',
      average_buy_price_cents: '',
      total_invested_cents: '',
      current_price_cents: '',
      sector: '',
      market: 'NYSE',
      dividend_yield: '',
      notes: '',
      currency: 'USD'
    });
  };

  const handleEdit = (holding: StockHolding) => {
    setEditingHolding(holding);
    setFormData({
      symbol: holding.symbol,
      company_name: holding.company_name,
      quantity: holding.quantity.toString(),
      average_buy_price_cents: (holding.average_buy_price_cents / 100).toString(),
      total_invested_cents: (holding.total_invested_cents / 100).toString(),
      current_price_cents: (holding.current_price_cents / 100).toString(),
      sector: holding.sector || '',
      market: holding.market,
      dividend_yield: holding.dividend_yield?.toString() || '',
      notes: holding.notes || '',
      currency: holding.currency
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (holdingId: string) => {
    try {
      const { error } = await supabase
        .from('stocks_portfolio')
        .delete()
        .eq('id', holdingId);

      if (error) throw error;
      toast({ title: 'Success', description: 'Stock holding deleted successfully' });
      loadHoldings();
    } catch (error) {
      console.error('Error deleting stock holding:', error);
      toast({ title: 'Error', description: 'Failed to delete stock holding', variant: 'destructive' });
    }
  };

  const totalInvested = holdings.reduce((sum, holding) => sum + holding.total_invested_cents, 0);
  const totalCurrentValue = holdings.reduce((sum, holding) => sum + (holding.current_price_cents * holding.quantity), 0);
  const totalGainLoss = totalCurrentValue - totalInvested;
  const gainLossPercentage = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

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
            Stock Portfolio
          </h1>
          <p className="text-muted-foreground mt-2">
            Track your stock investments
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
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
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

        {/* Holdings Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Your Holdings</CardTitle>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => { resetForm(); setEditingHolding(null); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Holding
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{editingHolding ? 'Edit' : 'Add'} Stock Holding</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="symbol">Symbol</Label>
                        <Input
                          id="symbol"
                          value={formData.symbol}
                          onChange={(e) => setFormData(prev => ({ ...prev, symbol: e.target.value }))}
                          placeholder="AAPL, GOOGL, etc."
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="company_name">Company Name</Label>
                        <Input
                          id="company_name"
                          value={formData.company_name}
                          onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                          placeholder="Apple Inc., Google, etc."
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

                    <div className="grid grid-cols-3 gap-4">
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
                        <Label htmlFor="sector">Sector</Label>
                        <Input
                          id="sector"
                          value={formData.sector}
                          onChange={(e) => setFormData(prev => ({ ...prev, sector: e.target.value }))}
                          placeholder="Technology, Healthcare, etc."
                        />
                      </div>
                      <div>
                        <Label htmlFor="market">Market</Label>
                        <Input
                          id="market"
                          value={formData.market}
                          onChange={(e) => setFormData(prev => ({ ...prev, market: e.target.value }))}
                          placeholder="NYSE, NASDAQ, etc."
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="dividend_yield">Dividend Yield (%)</Label>
                      <Input
                        id="dividend_yield"
                        type="number"
                        step="0.01"
                        value={formData.dividend_yield}
                        onChange={(e) => setFormData(prev => ({ ...prev, dividend_yield: e.target.value }))}
                        placeholder="2.5"
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
                  <TableHead>Dividend</TableHead>
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
                          <div className="text-sm text-muted-foreground">{holding.company_name}</div>
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
                        {holding.dividend_yield ? `${holding.dividend_yield}%` : '-'}
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
      </div>
    </AppLayout>
  );
};

export default StocksPage;