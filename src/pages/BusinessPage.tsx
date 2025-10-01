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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Target, TrendingUp, Users, DollarSign, Package, Edit, Trash2, Building, Receipt } from 'lucide-react';
import PayrollManager from '@/components/business/PayrollManager';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import PersonForm from '@/components/shared/PersonForm';
import NotesManager from '@/components/shared/NotesManager';

interface Person {
  id: string;
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
  social_media_links: any;
}

interface InventoryItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unit_price_cents: number;
  category: string;
  supplier: string;
  sku: string;
  location: string;
  created_at: string;
}

interface BusinessTransaction {
  id: string;
  amount_cents: number;
  currency: string;
  description: string;
  category?: string;
  source?: string;
  date: string;
  is_recurring: boolean;
  recurring_frequency: string;
  vendor?: string;
  client_id?: string;
  created_at: string;
}

const BusinessPage = () => {
  const { user } = useAuth();
  const [people, setPeople] = useState<Person[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [expenses, setExpenses] = useState<BusinessTransaction[]>([]);
  const [revenue, setRevenue] = useState<BusinessTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('contacts');
  
  // Dialog states
  const [isPersonDialogOpen, setIsPersonDialogOpen] = useState(false);
  const [isInventoryDialogOpen, setIsInventoryDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isRevenueDialogOpen, setIsRevenueDialogOpen] = useState(false);
  
  // Editing states
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [editingInventoryItem, setEditingInventoryItem] = useState<InventoryItem | null>(null);
  const [editingExpense, setEditingExpense] = useState<BusinessTransaction | null>(null);
  const [editingRevenue, setEditingRevenue] = useState<BusinessTransaction | null>(null);

  // Form states
  const [inventoryFormData, setInventoryFormData] = useState({
    name: '',
    description: '',
    quantity: '',
    unit_price_cents: '',
    category: '',
    supplier: '',
    sku: '',
    location: ''
  });

  const [expenseFormData, setExpenseFormData] = useState({
    amount_cents: '',
    currency: 'USD',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    is_recurring: false,
    recurring_frequency: '',
    vendor: ''
  });

  const [revenueFormData, setRevenueFormData] = useState({
    amount_cents: '',
    currency: 'USD',
    description: '',
    source: '',
    date: new Date().toISOString().split('T')[0],
    is_recurring: false,
    recurring_frequency: '',
    client_id: ''
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      // Load business contacts
      const { data: peopleData, error: peopleError } = await supabase
        .from('people')
        .select('*')
        .eq('user_id', user!.id)
        .in('type', ['client', 'supplier', 'partner', 'vendor'])
        .order('created_at', { ascending: false });

      if (peopleError) throw peopleError;

      // Load inventory
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (inventoryError) throw inventoryError;

      // Load business expenses
      const { data: expensesData, error: expensesError } = await supabase
        .from('business_expenses')
        .select('*')
        .eq('user_id', user!.id)
        .order('date', { ascending: false });

      if (expensesError) throw expensesError;

      // Load business revenue
      const { data: revenueData, error: revenueError } = await supabase
        .from('business_revenue')
        .select('*')
        .eq('user_id', user!.id)
        .order('date', { ascending: false });

      if (revenueError) throw revenueError;

      setPeople(peopleData || []);
      setInventory(inventoryData || []);
      setExpenses(expensesData || []);
      setRevenue(revenueData || []);
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

  // Calculate KPIs
  const totalInventoryValue = inventory.reduce((sum, item) => sum + ((item.unit_price_cents || 0) * item.quantity), 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount_cents, 0);
  const totalRevenue = revenue.reduce((sum, rev) => sum + rev.amount_cents, 0);
  const netProfit = totalRevenue - totalExpenses;

  const handleInventorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const itemData = {
        user_id: user.id,
        name: inventoryFormData.name,
        description: inventoryFormData.description || null,
        quantity: parseInt(inventoryFormData.quantity),
        unit_price_cents: inventoryFormData.unit_price_cents ? parseInt(inventoryFormData.unit_price_cents) * 100 : null,
        category: inventoryFormData.category || null,
        supplier: inventoryFormData.supplier || null,
        sku: inventoryFormData.sku || null,
        location: inventoryFormData.location || null
      };

      if (editingInventoryItem) {
        const { error } = await supabase
          .from('inventory')
          .update(itemData)
          .eq('id', editingInventoryItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('inventory')
          .insert([itemData]);
        if (error) throw error;
      }

      toast({
        title: 'Success',
        description: `Inventory item ${editingInventoryItem ? 'updated' : 'created'} successfully`,
      });

      setIsInventoryDialogOpen(false);
      setEditingInventoryItem(null);
      resetInventoryForm();
      loadData();
    } catch (error) {
      console.error('Error saving inventory item:', error);
      toast({
        title: 'Error',
        description: 'Failed to save inventory item',
        variant: 'destructive',
      });
    }
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const transactionData = {
        user_id: user.id,
        amount_cents: parseInt(expenseFormData.amount_cents) * 100,
        currency: expenseFormData.currency,
        description: expenseFormData.description,
        category: expenseFormData.category,
        date: expenseFormData.date,
        is_recurring: expenseFormData.is_recurring,
        recurring_frequency: expenseFormData.recurring_frequency || null,
        vendor: expenseFormData.vendor || null
      };

      if (editingExpense) {
        const { error } = await supabase
          .from('business_expenses')
          .update(transactionData)
          .eq('id', editingExpense.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('business_expenses')
          .insert([transactionData]);
        if (error) throw error;
      }

      toast({
        title: 'Success',
        description: `Expense ${editingExpense ? 'updated' : 'created'} successfully`,
      });

      setIsExpenseDialogOpen(false);
      setEditingExpense(null);
      resetExpenseForm();
      loadData();
    } catch (error) {
      console.error('Error saving expense:', error);
      toast({
        title: 'Error',
        description: 'Failed to save expense',
        variant: 'destructive',
      });
    }
  };

  const handleRevenueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const transactionData = {
        user_id: user.id,
        amount_cents: parseInt(revenueFormData.amount_cents) * 100,
        currency: revenueFormData.currency,
        description: revenueFormData.description,
        source: revenueFormData.source,
        date: revenueFormData.date,
        is_recurring: revenueFormData.is_recurring,
        recurring_frequency: revenueFormData.recurring_frequency || null,
        client_id: revenueFormData.client_id || null
      };

      if (editingRevenue) {
        const { error } = await supabase
          .from('business_revenue')
          .update(transactionData)
          .eq('id', editingRevenue.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('business_revenue')
          .insert([transactionData]);
        if (error) throw error;
      }

      toast({
        title: 'Success',
        description: `Revenue ${editingRevenue ? 'updated' : 'created'} successfully`,
      });

      setIsRevenueDialogOpen(false);
      setEditingRevenue(null);
      resetRevenueForm();
      loadData();
    } catch (error) {
      console.error('Error saving revenue:', error);
      toast({
        title: 'Error',
        description: 'Failed to save revenue',
        variant: 'destructive',
      });
    }
  };

  const resetInventoryForm = () => {
    setInventoryFormData({
      name: '',
      description: '',
      quantity: '',
      unit_price_cents: '',
      category: '',
      supplier: '',
      sku: '',
      location: ''
    });
  };

  const resetExpenseForm = () => {
    setExpenseFormData({
      amount_cents: '',
      currency: 'USD',
      description: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      is_recurring: false,
      recurring_frequency: '',
      vendor: ''
    });
  };

  const resetRevenueForm = () => {
    setRevenueFormData({
      amount_cents: '',
      currency: 'USD',
      description: '',
      source: '',
      date: new Date().toISOString().split('T')[0],
      is_recurring: false,
      recurring_frequency: '',
      client_id: ''
    });
  };

  const handleDeleteInventory = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('inventory')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      toast({ title: 'Success', description: 'Inventory item deleted successfully' });
      loadData();
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      toast({ title: 'Error', description: 'Failed to delete inventory item', variant: 'destructive' });
    }
  };

  const handleDeleteExpense = async (transactionId: string) => {
    try {
      const { error } = await supabase
        .from('business_expenses')
        .delete()
        .eq('id', transactionId);

      if (error) throw error;
      toast({ title: 'Success', description: 'Expense deleted successfully' });
      loadData();
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast({ title: 'Error', description: 'Failed to delete expense', variant: 'destructive' });
    }
  };

  const handleDeleteRevenue = async (transactionId: string) => {
    try {
      const { error } = await supabase
        .from('business_revenue')
        .delete()
        .eq('id', transactionId);

      if (error) throw error;
      toast({ title: 'Success', description: 'Revenue deleted successfully' });
      loadData();
    } catch (error) {
      console.error('Error deleting revenue:', error);
      toast({ title: 'Error', description: 'Failed to delete revenue', variant: 'destructive' });
    }
  };

  const handleDeletePerson = async (personId: string) => {
    try {
      const { error } = await supabase
        .from('people')
        .delete()
        .eq('id', personId);

      if (error) throw error;
      toast({ title: 'Success', description: 'Contact deleted successfully' });
      loadData();
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast({ title: 'Error', description: 'Failed to delete contact', variant: 'destructive' });
    }
  };

  const getTypeColor = (type: string) => {
    const colors = {
      client: 'bg-green-100 text-green-800',
      supplier: 'bg-blue-100 text-blue-800',
      partner: 'bg-purple-100 text-purple-800',
      vendor: 'bg-orange-100 text-orange-800',
    };
    return colors[type as keyof typeof colors] || colors.client;
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto p-4 sm:p-6 max-w-full overflow-x-hidden">
          <div className="text-center">Loading...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Business Management
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            Manage contacts, inventory, expenses, and revenue
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(netProfit / 100)}</div>
              <p className="text-xs text-muted-foreground">Revenue - Expenses</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalRevenue / 100)}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalInventoryValue / 100)}</div>
              <p className="text-xs text-muted-foreground">{inventory.length} items</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Business Contacts</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{people.length}</div>
              <p className="text-xs text-muted-foreground">Total contacts</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different sections */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="payroll">Payroll</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="contacts" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Business Contacts</h2>
              <Button onClick={() => { setEditingPerson(null); setIsPersonDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Contact
              </Button>
            </div>

            {isPersonDialogOpen && (
              <PersonForm
                person={editingPerson}
                module="business"
                onSave={() => { setIsPersonDialogOpen(false); setEditingPerson(null); loadData(); }}
                onCancel={() => { setIsPersonDialogOpen(false); setEditingPerson(null); }}
              />
            )}

            <Card>
              <CardContent className="p-6">
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
                          <Badge className={getTypeColor(person.type)}>
                            {person.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{person.company || '-'}</TableCell>
                        <TableCell>{person.email || '-'}</TableCell>
                        <TableCell>{person.phone || '-'}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => { setEditingPerson(person); setIsPersonDialogOpen(true); }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeletePerson(person.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {people.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          No business contacts yet. Add your first contact to get started.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Inventory Management</h2>
              <Dialog open={isInventoryDialogOpen} onOpenChange={setIsInventoryDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingInventoryItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleInventorySubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={inventoryFormData.name}
                          onChange={(e) => setInventoryFormData({ ...inventoryFormData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="sku">SKU</Label>
                        <Input
                          id="sku"
                          value={inventoryFormData.sku}
                          onChange={(e) => setInventoryFormData({ ...inventoryFormData, sku: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={inventoryFormData.description}
                        onChange={(e) => setInventoryFormData({ ...inventoryFormData, description: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input
                          id="quantity"
                          type="number"
                          value={inventoryFormData.quantity}
                          onChange={(e) => setInventoryFormData({ ...inventoryFormData, quantity: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="unit_price">Unit Price</Label>
                        <Input
                          id="unit_price"
                          type="number"
                          step="0.01"
                          value={inventoryFormData.unit_price_cents}
                          onChange={(e) => setInventoryFormData({ ...inventoryFormData, unit_price_cents: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Input
                          id="category"
                          value={inventoryFormData.category}
                          onChange={(e) => setInventoryFormData({ ...inventoryFormData, category: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="supplier">Supplier</Label>
                        <Input
                          id="supplier"
                          value={inventoryFormData.supplier}
                          onChange={(e) => setInventoryFormData({ ...inventoryFormData, supplier: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={inventoryFormData.location}
                          onChange={(e) => setInventoryFormData({ ...inventoryFormData, location: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsInventoryDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        {editingInventoryItem ? 'Update' : 'Create'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Total Value</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.sku || '-'}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.unit_price_cents ? formatCurrency(item.unit_price_cents / 100) : '-'}</TableCell>
                        <TableCell>{item.unit_price_cents ? formatCurrency((item.unit_price_cents * item.quantity) / 100) : '-'}</TableCell>
                        <TableCell>{item.category || '-'}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteInventory(item.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {inventory.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          No inventory items yet. Add your first item to get started.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Business Expenses
              </h2>
              <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Expense
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Business Expense</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleExpenseSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="amount">Amount</Label>
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          value={expenseFormData.amount_cents}
                          onChange={(e) => setExpenseFormData({ ...expenseFormData, amount_cents: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="currency">Currency</Label>
                        <Select value={expenseFormData.currency} onValueChange={(value) => setExpenseFormData({ ...expenseFormData, currency: value })}>
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
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        value={expenseFormData.description}
                        onChange={(e) => setExpenseFormData({ ...expenseFormData, description: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select value={expenseFormData.category} onValueChange={(value) => setExpenseFormData({ ...expenseFormData, category: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="office">Office Supplies</SelectItem>
                            <SelectItem value="travel">Travel</SelectItem>
                            <SelectItem value="marketing">Marketing</SelectItem>
                            <SelectItem value="equipment">Equipment</SelectItem>
                            <SelectItem value="utilities">Utilities</SelectItem>
                            <SelectItem value="rent">Rent</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="vendor">Vendor</Label>
                        <Input
                          id="vendor"
                          value={expenseFormData.vendor}
                          onChange={(e) => setExpenseFormData({ ...expenseFormData, vendor: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={expenseFormData.date}
                        onChange={(e) => setExpenseFormData({ ...expenseFormData, date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="is_recurring"
                        checked={expenseFormData.is_recurring}
                        onCheckedChange={(checked) => setExpenseFormData({ ...expenseFormData, is_recurring: checked as boolean })}
                      />
                      <Label htmlFor="is_recurring">Recurring expense</Label>
                    </div>
                    {expenseFormData.is_recurring && (
                      <div>
                        <Label htmlFor="frequency">Frequency</Label>
                        <Select value={expenseFormData.recurring_frequency} onValueChange={(value) => setExpenseFormData({ ...expenseFormData, recurring_frequency: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                            <SelectItem value="yearly">Yearly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsExpenseDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Create</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Recurring</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className="font-medium">{expense.description}</TableCell>
                        <TableCell>{expense.category}</TableCell>
                        <TableCell>{expense.vendor || '-'}</TableCell>
                        <TableCell>{formatCurrency(expense.amount_cents / 100)}</TableCell>
                        <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                        <TableCell>{expense.is_recurring ? expense.recurring_frequency : 'No'}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteExpense(expense.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {expenses.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          No expenses yet. Add your first expense to get started.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Business Revenue
              </h2>
              <Dialog open={isRevenueDialogOpen} onOpenChange={setIsRevenueDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Revenue
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Business Revenue</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleRevenueSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="amount">Amount</Label>
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          value={revenueFormData.amount_cents}
                          onChange={(e) => setRevenueFormData({ ...revenueFormData, amount_cents: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="currency">Currency</Label>
                        <Select value={revenueFormData.currency} onValueChange={(value) => setRevenueFormData({ ...revenueFormData, currency: value })}>
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
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        value={revenueFormData.description}
                        onChange={(e) => setRevenueFormData({ ...revenueFormData, description: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="source">Source</Label>
                        <Input
                          id="source"
                          value={revenueFormData.source}
                          onChange={(e) => setRevenueFormData({ ...revenueFormData, source: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="client">Client</Label>
                        <Select value={revenueFormData.client_id} onValueChange={(value) => setRevenueFormData({ ...revenueFormData, client_id: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select client" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">No client</SelectItem>
                            {people.filter(p => p.type === 'client').map((client) => (
                              <SelectItem key={client.id} value={client.id}>
                                {client.full_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={revenueFormData.date}
                        onChange={(e) => setRevenueFormData({ ...revenueFormData, date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="is_recurring"
                        checked={revenueFormData.is_recurring}
                        onCheckedChange={(checked) => setRevenueFormData({ ...revenueFormData, is_recurring: checked as boolean })}
                      />
                      <Label htmlFor="is_recurring">Recurring revenue</Label>
                    </div>
                    {revenueFormData.is_recurring && (
                      <div>
                        <Label htmlFor="frequency">Frequency</Label>
                        <Select value={revenueFormData.recurring_frequency} onValueChange={(value) => setRevenueFormData({ ...revenueFormData, recurring_frequency: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                            <SelectItem value="yearly">Yearly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsRevenueDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Create</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Recurring</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {revenue.map((rev) => (
                      <TableRow key={rev.id}>
                        <TableCell className="font-medium">{rev.description}</TableCell>
                        <TableCell>{rev.source}</TableCell>
                        <TableCell>{people.find(p => p.id === rev.client_id)?.full_name || '-'}</TableCell>
                        <TableCell>{formatCurrency(rev.amount_cents / 100)}</TableCell>
                        <TableCell>{new Date(rev.date).toLocaleDateString()}</TableCell>
                        <TableCell>{rev.is_recurring ? rev.recurring_frequency : 'No'}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteRevenue(rev.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {revenue.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          No revenue yet. Add your first revenue entry to get started.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payroll" className="space-y-4">
            <PayrollManager />
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            <NotesManager module="business" />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default BusinessPage;