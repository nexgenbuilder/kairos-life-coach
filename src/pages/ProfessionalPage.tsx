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
import { Plus, Target, TrendingUp, Calendar, CheckCircle, Edit, Trash2, Clock, Users, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import PersonForm from '@/components/shared/PersonForm';
import { WorkScheduleManager } from '@/components/professional/WorkScheduleManager';
import { PTOManager } from '@/components/professional/PTOManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Deal {
  id: string;
  user_id: string;
  title: string;
  amount_cents: number;
  currency: string;
  stage: string;
  probability: number;
  close_date: string;
  notes: string;
  actual_revenue_cents?: number;
  person?: {
    full_name: string;
    email: string;
  };
  created_at: string;
}

interface Person {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  type: string;
  company: string;
  position: string;
  address: string;
  birthday: string;
  notes: string;
  tags: string[];
  social_media_links: Record<string, string>;
}

interface Task {
  id: string;
  title: string;
  status: string;
  due_date: string;
  priority: string;
}

const ProfessionalPage = () => {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [isPersonDialogOpen, setIsPersonDialogOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [closingDeal, setClosingDeal] = useState<Deal | null>(null);
  const [actualRevenue, setActualRevenue] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    amount_cents: '',
    currency: 'USD',
    stage: 'prospect',
    probability: '25',
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
      // Load professional opportunities (admin sees all, others see only their own)
      let dealsQuery = supabase
        .from('deals')
        .select(`
          *,
          person:person_id (
            id,
            full_name,
            email
          )
        `);
      
      if (!isAdmin) {
        dealsQuery = dealsQuery.eq('user_id', user!.id);
      }
      
      const { data: dealsData, error: dealsError } = await dealsQuery
        .order('created_at', { ascending: false });

      if (dealsError) throw dealsError;

      // Load people (prospects, clients, coworkers)
      let peopleQuery = supabase
        .from('people')
        .select('*')
        .in('type', ['colleague', 'manager', 'hr', 'client']);
      
      if (!isAdmin) {
        peopleQuery = peopleQuery.eq('user_id', user!.id);
      }

      const { data: peopleData, error: peopleError } = await peopleQuery;
      
      if (peopleError) throw peopleError;

      setDeals(dealsData || []);
      setPeople((peopleData || []).map(person => ({
        ...person,
        tags: person.tags || [],
        social_media_links: person.social_media_links || {}
      })) as Person[]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load professional data',
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
        description: `Opportunity ${editingDeal ? 'updated' : 'created'} successfully`,
      });

      setIsDialogOpen(false);
      setEditingDeal(null);
      setFormData({
        title: '',
        amount_cents: '',
        currency: 'USD',
        stage: 'prospect',
        probability: '25',
        close_date: '',
        notes: '',
        person_id: ''
      });
      loadData();
    } catch (error) {
      console.error('Error saving opportunity:', error);
      toast({
        title: 'Error',
        description: 'Failed to save opportunity',
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
        description: 'Opportunity deleted successfully',
      });
      loadData();
    } catch (error) {
      console.error('Error deleting opportunity:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete opportunity',
        variant: 'destructive',
      });
    }
  };

  const handlePersonSave = () => {
    setIsPersonDialogOpen(false);
    setEditingPerson(null);
    loadData();
  };

  const handlePersonEdit = (person: Person) => {
    setEditingPerson(person);
    setIsPersonDialogOpen(true);
  };

  const handlePersonDelete = async (personId: string) => {
    try {
      const { error } = await supabase
        .from('people')
        .delete()
        .eq('id', personId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Contact deleted successfully',
      });
      loadData();
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete contact',
        variant: 'destructive',
      });
    }
  };

  const handleCloseDeal = (deal: Deal) => {
    setClosingDeal(deal);
    setActualRevenue((deal.amount_cents / 100).toString());
    setCloseDialogOpen(true);
  };

  const handleCloseSubmit = async (won: boolean) => {
    if (!closingDeal) return;
    
    try {
      const updateData = {
        stage: won ? 'won' : 'lost',
        actual_revenue_cents: won ? parseInt(actualRevenue) * 100 : 0,
      };

      const { error } = await supabase
        .from('deals')
        .update(updateData)
        .eq('id', closingDeal.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Opportunity marked as ${won ? 'won' : 'lost'}`,
      });

      setCloseDialogOpen(false);
      setClosingDeal(null);
      setActualRevenue('');
      loadData();
    } catch (error) {
      console.error('Error closing deal:', error);
      toast({
        title: 'Error',
        description: 'Failed to close opportunity',
        variant: 'destructive',
      });
    }
  };

  const getStageColor = (stage: string) => {
    const colors = {
      new: 'bg-slate-100 text-slate-800',
      prospect: 'bg-gray-100 text-gray-800',
      qualified: 'bg-cyan-100 text-cyan-800',
      meeting: 'bg-blue-100 text-blue-800',
      proposal: 'bg-yellow-100 text-yellow-800',
      negotiation: 'bg-purple-100 text-purple-800',
      commit: 'bg-orange-100 text-orange-800',
      won: 'bg-green-100 text-green-800',
      lost: 'bg-red-100 text-red-800',
      closed: 'bg-green-100 text-green-800',
    };
    return colors[stage as keyof typeof colors] || colors.prospect;
  };

  // Calculate KPIs
  const activePipeline = deals.filter(deal => !['won', 'lost'].includes(deal.stage));
  const totalPipelineValue = activePipeline.reduce((sum, deal) => sum + deal.amount_cents, 0);
  
  const wonDeals = deals.filter(deal => deal.stage === 'won');
  const thisMonthWon = wonDeals.filter(deal => {
    const dealDate = new Date(deal.created_at);
    const now = new Date();
    return dealDate.getMonth() === now.getMonth() && dealDate.getFullYear() === now.getFullYear();
  });
  
  const monthlyRevenue = thisMonthWon.reduce((sum, deal) => sum + (deal.actual_revenue_cents || deal.amount_cents), 0);
  const totalDeals = deals.filter(deal => deal.stage !== 'lost').length;
  const conversionRate = totalDeals > 0 ? (wonDeals.length / totalDeals) * 100 : 0;

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
              Professional
            </h1>
            <p className="text-muted-foreground mt-2">Manage your work schedule, sales pipeline, and professional network</p>
          </div>
          
          <div className="space-x-2">
            <Dialog open={isPersonDialogOpen} onOpenChange={setIsPersonDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Contact
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <PersonForm
                  person={editingPerson}
                  module="professional"
                  onSave={handlePersonSave}
                  onCancel={() => setIsPersonDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Opportunity
                </Button>
              </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editingDeal ? 'Edit Opportunity' : 'Create New Opportunity'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Opportunity Title</Label>
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
                        <SelectItem value="prospect">Prospect</SelectItem>
                        <SelectItem value="qualified">Qualified</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="proposal">Proposal</SelectItem>
                        <SelectItem value="negotiation">Negotiation</SelectItem>
                        <SelectItem value="commit">Commit</SelectItem>
                        <SelectItem value="won">Won</SelectItem>
                        <SelectItem value="lost">Lost</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
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

            {/* Close Deal Dialog */}
            <Dialog open={closeDialogOpen} onOpenChange={setCloseDialogOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Close Opportunity</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Mark "{closingDeal?.title}" as won or lost.
                  </p>
                  
                  <div>
                    <Label htmlFor="actualRevenue">Actual Revenue (if won)</Label>
                    <Input
                      id="actualRevenue"
                      type="number"
                      value={actualRevenue}
                      onChange={(e) => setActualRevenue(e.target.value)}
                      placeholder="Enter actual revenue amount"
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCloseDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => handleCloseSubmit(false)}
                    >
                      Mark as Lost
                    </Button>
                    <Button
                      type="button"
                      onClick={() => handleCloseSubmit(true)}
                    >
                      Mark as Won
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="opportunities" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
            <TabsTrigger value="schedule">Work Schedule</TabsTrigger>
            <TabsTrigger value="pto">Time Off</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
          </TabsList>

          <TabsContent value="opportunities" className="space-y-6">
            {isAdmin && (
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="text-sm font-medium">Admin View - All Team Data</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    You're viewing opportunities and contacts from all team members
                  </p>
                </CardContent>
              </Card>
            )}
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalPipelineValue / 100)}</div>
              <p className="text-xs text-muted-foreground">Projected value</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(monthlyRevenue / 100)}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Success rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Opportunities</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activePipeline.length}</div>
              <p className="text-xs text-muted-foreground">In progress</p>
            </CardContent>
          </Card>
        </div>

        {/* Professional Contacts */}
        <Card>
          <CardHeader>
            <CardTitle>Professional Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {people.map((person) => (
                  <TableRow key={person.id}>
                    <TableCell className="font-medium">{person.full_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {person.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{person.company || '-'}</TableCell>
                    <TableCell>{person.email || '-'}</TableCell>
                    <TableCell>{person.phone || '-'}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handlePersonEdit(person)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handlePersonDelete(person.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {people.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No contacts yet. Add your first professional contact to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Opportunities Table */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Opportunity</TableHead>
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
                        {!['won', 'lost'].includes(deal.stage) && (
                          <Button variant="ghost" size="sm" onClick={() => handleCloseDeal(deal)}>
                            <DollarSign className="h-4 w-4" />
                          </Button>
                        )}
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
                      No opportunities yet. Create your first opportunity to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <WorkScheduleManager />
          </TabsContent>

          <TabsContent value="pto" className="space-y-6">
            <PTOManager />
          </TabsContent>

          <TabsContent value="contacts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Professional Contacts</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                     {people.map((person) => (
                       <TableRow key={person.id}>
                         <TableCell className="font-medium">
                           <div>
                             <div>{person.full_name}</div>
                             {isAdmin && person.user_id !== user?.id && (
                               <div className="text-xs text-muted-foreground">
                                 Added by: Sales Agent
                               </div>
                             )}
                           </div>
                         </TableCell>
                         <TableCell>{person.company || '-'}</TableCell>
                         <TableCell>{person.position || '-'}</TableCell>
                         <TableCell>
                           <Badge variant="outline">
                             {person.type.charAt(0).toUpperCase() + person.type.slice(1)}
                           </Badge>
                         </TableCell>
                         <TableCell>{person.email || '-'}</TableCell>
                         <TableCell>
                           <div className="flex space-x-2">
                             <Button
                               size="sm"
                               variant="outline"
                               onClick={() => handlePersonEdit(person)}
                             >
                               <Edit className="h-4 w-4" />
                             </Button>
                             <Button
                               size="sm"
                               variant="outline"
                               onClick={() => handlePersonDelete(person.id)}
                             >
                               <Trash2 className="h-4 w-4" />
                             </Button>
                           </div>
                         </TableCell>
                       </TableRow>
                     ))}
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

export default ProfessionalPage;