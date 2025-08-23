import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, TrendingUp, DollarSign, Target, Users, Calendar, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';

interface Deal {
  id: string;
  title: string;
  amount_cents: number;
  currency: string;
  stage: string;
  probability: number;
  close_date: string;
  notes: string;
  person?: {
    full_name: string;
    email: string;
  };
  created_at: string;
}

interface Person {
  id: string;
  full_name: string;
  email: string;
  type: string;
}

const BusinessPage = () => {
  const { user } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    amount_cents: '',
    currency: 'USD',
    stage: 'new',
    probability: '50',
    close_date: '',
    notes: '',
    person_id: ''
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      // Load deals with person data
      const { data: dealsData, error: dealsError } = await supabase
        .from('deals')
        .select(`
          *,
          person:person_id (
            id,
            full_name,
            email
          )
        `)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (dealsError) throw dealsError;

      // Load people for dropdowns
      const { data: peopleData, error: peopleError } = await supabase
        .from('people')
        .select('id, full_name, email, type')
        .eq('user_id', user!.id)
        .in('type', ['lead', 'customer', 'vendor']);

      if (peopleError) throw peopleError;

      setDeals(dealsData || []);
      setPeople(peopleData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load business data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const dealData = {
        user_id: user!.id,
        title: formData.title,
        amount_cents: parseInt(formData.amount_cents) * 100,
        currency: formData.currency,
        stage: formData.stage,
        probability: parseInt(formData.probability),
        close_date: formData.close_date || null,
        notes: formData.notes,
        person_id: formData.person_id || null,
      };

      if (editingDeal) {
        const { error } = await supabase
          .from('deals')
          .update(dealData)
          .eq('id', editingDeal.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('deals')
          .insert([dealData]);

        if (error) throw error;
      }

      toast({
        title: 'Success',
        description: `Deal ${editingDeal ? 'updated' : 'created'} successfully`,
      });

      setIsDialogOpen(false);
      setEditingDeal(null);
      setFormData({
        title: '',
        amount_cents: '',
        currency: 'USD',
        stage: 'new',
        probability: '50',
        close_date: '',
        notes: '',
        person_id: ''
      });
      loadData();
    } catch (error) {
      console.error('Error saving deal:', error);
      toast({
        title: 'Error',
        description: 'Failed to save deal',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (deal: Deal) => {
    setEditingDeal(deal);
    setFormData({
      title: deal.title,
      amount_cents: (deal.amount_cents / 100).toString(),
      currency: deal.currency,
      stage: deal.stage,
      probability: deal.probability.toString(),
      close_date: deal.close_date || '',
      notes: deal.notes || '',
      person_id: (deal.person as any)?.id || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (dealId: string) => {
    try {
      const { error } = await supabase
        .from('deals')
        .delete()
        .eq('id', dealId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Deal deleted successfully',
      });
      loadData();
    } catch (error) {
      console.error('Error deleting deal:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete deal',
        variant: 'destructive',
      });
    }
  };

  const getStageColor = (stage: string) => {
    const colors = {
      new: 'bg-gray-100 text-gray-800',
      qualified: 'bg-blue-100 text-blue-800',
      proposal: 'bg-yellow-100 text-yellow-800',
      negotiation: 'bg-orange-100 text-orange-800',
      won: 'bg-green-100 text-green-800',
      lost: 'bg-red-100 text-red-800',
    };
    return colors[stage as keyof typeof colors] || colors.new;
  };

  // Calculate KPIs
  const totalPipelineValue = deals
    .filter(deal => deal.stage !== 'won' && deal.stage !== 'lost')
    .reduce((sum, deal) => sum + (deal.amount_cents * deal.probability / 100), 0);

  const wonDeals = deals.filter(deal => deal.stage === 'won');
  const totalRevenue = wonDeals.reduce((sum, deal) => sum + deal.amount_cents, 0);
  
  const totalDeals = deals.filter(deal => deal.stage !== 'lost').length;
  const winRate = totalDeals > 0 ? (wonDeals.length / totalDeals) * 100 : 0;

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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Business
            </h1>
            <p className="text-muted-foreground mt-2">Manage your deals, revenue, and business operations</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Deal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editingDeal ? 'Edit Deal' : 'Create New Deal'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Deal Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={formData.amount_cents}
                      onChange={(e) => setFormData({ ...formData, amount_cents: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="stage">Stage</Label>
                    <Select value={formData.stage} onValueChange={(value) => setFormData({ ...formData, stage: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="qualified">Qualified</SelectItem>
                        <SelectItem value="proposal">Proposal</SelectItem>
                        <SelectItem value="negotiation">Negotiation</SelectItem>
                        <SelectItem value="won">Won</SelectItem>
                        <SelectItem value="lost">Lost</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="probability">Probability (%)</Label>
                    <Input
                      id="probability"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.probability}
                      onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="person">Contact</Label>
                  <Select value={formData.person_id} onValueChange={(value) => setFormData({ ...formData, person_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select contact" />
                    </SelectTrigger>
                    <SelectContent>
                      {people.map((person) => (
                        <SelectItem key={person.id} value={person.id}>
                          {person.full_name} - {person.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="close_date">Expected Close Date</Label>
                  <Input
                    id="close_date"
                    type="date"
                    value={formData.close_date}
                    onChange={(e) => setFormData({ ...formData, close_date: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingDeal ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalPipelineValue / 100)}</div>
              <p className="text-xs text-muted-foreground">Weighted by probability</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalRevenue / 100)}</div>
              <p className="text-xs text-muted-foreground">Won deals</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{winRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Success rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{deals.filter(d => !['won', 'lost'].includes(d.stage)).length}</div>
              <p className="text-xs text-muted-foreground">In progress</p>
            </CardContent>
          </Card>
        </div>

        {/* Deals Table */}
        <Card>
          <CardHeader>
            <CardTitle>Deals Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Deal</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Probability</TableHead>
                  <TableHead>Close Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deals.map((deal) => (
                  <TableRow key={deal.id}>
                    <TableCell className="font-medium">{deal.title}</TableCell>
                    <TableCell>{deal.person?.full_name || 'No contact'}</TableCell>
                    <TableCell>{formatCurrency(deal.amount_cents / 100)}</TableCell>
                    <TableCell>
                      <Badge className={getStageColor(deal.stage)}>
                        {deal.stage}
                      </Badge>
                    </TableCell>
                    <TableCell>{deal.probability}%</TableCell>
                    <TableCell>{deal.close_date ? new Date(deal.close_date).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(deal)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(deal.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {deals.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No deals yet. Create your first deal to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default BusinessPage;