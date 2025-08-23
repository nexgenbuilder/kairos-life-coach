import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Receipt, TrendingUp, Edit, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface BusinessTransaction {
  id: string;
  amount_cents: number;
  currency: string;
  description: string;
  category: string;
  date: string;
  is_recurring: boolean;
  recurring_frequency?: string;
  vendor?: string;
  client_id?: string;
  created_at: string;
}

interface BusinessFinancialsProps {
  expenses: BusinessTransaction[];
  revenue: BusinessTransaction[];
  people: any[];
  onExpenseSubmit: (e: React.FormEvent) => void;
  onRevenueSubmit: (e: React.FormEvent) => void;
  onDeleteExpense: (id: string) => void;
  onDeleteRevenue: (id: string) => void;
  expenseFormData: any;
  revenueFormData: any;
  setExpenseFormData: (data: any) => void;
  setRevenueFormData: (data: any) => void;
  isExpenseDialogOpen: boolean;
  isRevenueDialogOpen: boolean;
  setIsExpenseDialogOpen: (open: boolean) => void;
  setIsRevenueDialogOpen: (open: boolean) => void;
}

const BusinessFinancials: React.FC<BusinessFinancialsProps> = ({
  expenses,
  revenue,
  people,
  onExpenseSubmit,
  onRevenueSubmit,
  onDeleteExpense,
  onDeleteRevenue,
  expenseFormData,
  revenueFormData,
  setExpenseFormData,
  setRevenueFormData,
  isExpenseDialogOpen,
  isRevenueDialogOpen,
  setIsExpenseDialogOpen,
  setIsRevenueDialogOpen
}) => {
  return (
    <div className="space-y-6">
      {/* Expenses Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Business Expenses
          </h3>
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
              <form onSubmit={onExpenseSubmit} className="space-y-4">
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
                    onCheckedChange={(checked) => setExpenseFormData({ ...expenseFormData, is_recurring: checked })}
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
                      <Button variant="ghost" size="sm" onClick={() => onDeleteExpense(expense.id)}>
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
      </div>

      {/* Revenue Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Business Revenue
          </h3>
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
              <form onSubmit={onRevenueSubmit} className="space-y-4">
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
                    onCheckedChange={(checked) => setRevenueFormData({ ...revenueFormData, is_recurring: checked })}
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
                    <TableCell>{rev.category}</TableCell>
                    <TableCell>{people.find(p => p.id === rev.client_id)?.full_name || '-'}</TableCell>
                    <TableCell>{formatCurrency(rev.amount_cents / 100)}</TableCell>
                    <TableCell>{new Date(rev.date).toLocaleDateString()}</TableCell>
                    <TableCell>{rev.is_recurring ? rev.recurring_frequency : 'No'}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => onDeleteRevenue(rev.id)}>
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
      </div>
    </div>
  );
};

export default BusinessFinancials;