import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Users, DollarSign, Edit, Trash2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import { toast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PayrollRecord {
  id: string;
  employee_name: string;
  employee_email: string;
  pay_rate_cents: number;
  pay_frequency: string;
  hours_worked: number;
  gross_pay_cents: number;
  taxes_cents: number;
  deductions_cents: number;
  net_pay_cents: number;
  pay_period_start: string;
  pay_period_end: string;
  pay_date: string;
  notes: string;
  currency: string;
  created_at: string;
}

export default function PayrollManager() {
  const { user } = useAuth();
  const { activeContext, isAdmin } = useOrganization();
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PayrollRecord | null>(null);

  const [formData, setFormData] = useState({
    employee_name: '',
    employee_email: '',
    pay_rate_cents: '',
    pay_frequency: 'hourly',
    hours_worked: '',
    gross_pay_cents: '',
    taxes_cents: '',
    deductions_cents: '',
    net_pay_cents: '',
    pay_period_start: '',
    pay_period_end: '',
    pay_date: new Date().toISOString().split('T')[0],
    notes: '',
    currency: 'USD'
  });

  useEffect(() => {
    if (user) {
      loadPayrollRecords();
    }
  }, [user]);

  const loadPayrollRecords = async () => {
    try {
      let query = supabase
        .from('payroll')
        .select('*')
        .order('pay_date', { ascending: false });

      // If user has an active organization context, filter by that
      if (activeContext) {
        query = query.eq('organization_id', activeContext.id);
      } else {
        // Otherwise, show their personal records
        query = query.eq('user_id', user!.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPayrollRecords(data || []);
    } catch (error) {
      console.error('Error loading payroll records:', error);
      toast({
        title: 'Error',
        description: 'Failed to load payroll records',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateNetPay = () => {
    const gross = parseInt(formData.gross_pay_cents) || 0;
    const taxes = parseInt(formData.taxes_cents) || 0;
    const deductions = parseInt(formData.deductions_cents) || 0;
    const net = gross - taxes - deductions;
    setFormData(prev => ({ ...prev, net_pay_cents: net.toString() }));
  };

  useEffect(() => {
    calculateNetPay();
  }, [formData.gross_pay_cents, formData.taxes_cents, formData.deductions_cents]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activeContext) {
      toast({
        title: 'Error',
        description: 'You must be in an organization context to manage payroll',
        variant: 'destructive',
      });
      return;
    }

    if (!isAdmin()) {
      toast({
        title: 'Access Denied',
        description: 'Only organization admins can manage payroll records',
        variant: 'destructive',
      });
      return;
    }

    try {
      const recordData = {
        user_id: user.id,
        organization_id: activeContext.id,
        employee_name: formData.employee_name,
        employee_email: formData.employee_email || null,
        pay_rate_cents: parseInt(formData.pay_rate_cents) * 100,
        pay_frequency: formData.pay_frequency,
        hours_worked: formData.hours_worked ? parseFloat(formData.hours_worked) : null,
        gross_pay_cents: parseInt(formData.gross_pay_cents) * 100,
        taxes_cents: parseInt(formData.taxes_cents || '0') * 100,
        deductions_cents: parseInt(formData.deductions_cents || '0') * 100,
        net_pay_cents: parseInt(formData.net_pay_cents) * 100,
        pay_period_start: formData.pay_period_start,
        pay_period_end: formData.pay_period_end,
        pay_date: formData.pay_date,
        notes: formData.notes || null,
        currency: formData.currency
      };

      if (editingRecord) {
        const { error } = await supabase
          .from('payroll')
          .update(recordData)
          .eq('id', editingRecord.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('payroll')
          .insert([recordData]);
        if (error) throw error;
      }

      toast({
        title: 'Success',
        description: `Payroll record ${editingRecord ? 'updated' : 'created'} successfully`,
      });

      setIsDialogOpen(false);
      setEditingRecord(null);
      resetForm();
      loadPayrollRecords();
    } catch (error) {
      console.error('Error saving payroll record:', error);
      toast({
        title: 'Error',
        description: 'Failed to save payroll record',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      employee_name: '',
      employee_email: '',
      pay_rate_cents: '',
      pay_frequency: 'hourly',
      hours_worked: '',
      gross_pay_cents: '',
      taxes_cents: '',
      deductions_cents: '',
      net_pay_cents: '',
      pay_period_start: '',
      pay_period_end: '',
      pay_date: new Date().toISOString().split('T')[0],
      notes: '',
      currency: 'USD'
    });
  };

  const handleEdit = (record: PayrollRecord) => {
    setEditingRecord(record);
    setFormData({
      employee_name: record.employee_name,
      employee_email: record.employee_email || '',
      pay_rate_cents: (record.pay_rate_cents / 100).toString(),
      pay_frequency: record.pay_frequency,
      hours_worked: record.hours_worked?.toString() || '',
      gross_pay_cents: (record.gross_pay_cents / 100).toString(),
      taxes_cents: (record.taxes_cents / 100).toString(),
      deductions_cents: (record.deductions_cents / 100).toString(),
      net_pay_cents: (record.net_pay_cents / 100).toString(),
      pay_period_start: record.pay_period_start,
      pay_period_end: record.pay_period_end,
      pay_date: record.pay_date,
      notes: record.notes || '',
      currency: record.currency
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (recordId: string) => {
    if (!isAdmin()) {
      toast({
        title: 'Access Denied',
        description: 'Only organization admins can delete payroll records',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('payroll')
        .delete()
        .eq('id', recordId);

      if (error) throw error;
      toast({ title: 'Success', description: 'Payroll record deleted successfully' });
      loadPayrollRecords();
    } catch (error) {
      console.error('Error deleting payroll record:', error);
      toast({ title: 'Error', description: 'Failed to delete payroll record', variant: 'destructive' });
    }
  };

  const totalGrossPay = payrollRecords.reduce((sum, record) => sum + record.gross_pay_cents, 0);
  const totalNetPay = payrollRecords.reduce((sum, record) => sum + record.net_pay_cents, 0);
  const totalTaxes = payrollRecords.reduce((sum, record) => sum + record.taxes_cents, 0);

  if (isLoading) {
    return <div className="text-center">Loading payroll records...</div>;
  }

  return (
    <div className="space-y-6">
      {!activeContext && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please select an organization context to manage payroll records. Payroll is organization-specific for security and compliance.
          </AlertDescription>
        </Alert>
      )}

      {activeContext && !isAdmin() && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You have view-only access to payroll records. Only organization admins can create, edit, or delete payroll data.
          </AlertDescription>
        </Alert>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gross Pay</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalGrossPay / 100)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Net Pay</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalNetPay / 100)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Taxes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalTaxes / 100)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Payroll Records Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Payroll Records</CardTitle>
            {activeContext && isAdmin() && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => { resetForm(); setEditingRecord(null); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Payroll Record
                  </Button>
                </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingRecord ? 'Edit' : 'Add'} Payroll Record</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="employee_name">Employee Name</Label>
                      <Input
                        id="employee_name"
                        value={formData.employee_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, employee_name: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="employee_email">Employee Email</Label>
                      <Input
                        id="employee_email"
                        type="email"
                        value={formData.employee_email}
                        onChange={(e) => setFormData(prev => ({ ...prev, employee_email: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="pay_rate_cents">Pay Rate ($)</Label>
                      <Input
                        id="pay_rate_cents"
                        type="number"
                        step="0.01"
                        value={formData.pay_rate_cents}
                        onChange={(e) => setFormData(prev => ({ ...prev, pay_rate_cents: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="pay_frequency">Pay Frequency</Label>
                      <Select value={formData.pay_frequency} onValueChange={(value) => setFormData(prev => ({ ...prev, pay_frequency: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="biweekly">Bi-weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="annual">Annual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="hours_worked">Hours Worked</Label>
                      <Input
                        id="hours_worked"
                        type="number"
                        step="0.25"
                        value={formData.hours_worked}
                        onChange={(e) => setFormData(prev => ({ ...prev, hours_worked: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pay_period_start">Pay Period Start</Label>
                      <Input
                        id="pay_period_start"
                        type="date"
                        value={formData.pay_period_start}
                        onChange={(e) => setFormData(prev => ({ ...prev, pay_period_start: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="pay_period_end">Pay Period End</Label>
                      <Input
                        id="pay_period_end"
                        type="date"
                        value={formData.pay_period_end}
                        onChange={(e) => setFormData(prev => ({ ...prev, pay_period_end: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="gross_pay_cents">Gross Pay ($)</Label>
                      <Input
                        id="gross_pay_cents"
                        type="number"
                        step="0.01"
                        value={formData.gross_pay_cents}
                        onChange={(e) => setFormData(prev => ({ ...prev, gross_pay_cents: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="taxes_cents">Taxes ($)</Label>
                      <Input
                        id="taxes_cents"
                        type="number"
                        step="0.01"
                        value={formData.taxes_cents}
                        onChange={(e) => setFormData(prev => ({ ...prev, taxes_cents: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="deductions_cents">Deductions ($)</Label>
                      <Input
                        id="deductions_cents"
                        type="number"
                        step="0.01"
                        value={formData.deductions_cents}
                        onChange={(e) => setFormData(prev => ({ ...prev, deductions_cents: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="net_pay_cents">Net Pay ($)</Label>
                      <Input
                        id="net_pay_cents"
                        type="number"
                        step="0.01"
                        value={formData.net_pay_cents}
                        readOnly
                        className="bg-muted"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pay_date">Pay Date</Label>
                      <Input
                        id="pay_date"
                        type="date"
                        value={formData.pay_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, pay_date: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="currency">Currency</Label>
                      <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
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
                      {editingRecord ? 'Update' : 'Add'} Record
                    </Button>
                  </div>
                </form>
              </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Pay Period</TableHead>
                <TableHead>Gross Pay</TableHead>
                <TableHead>Net Pay</TableHead>
                <TableHead>Pay Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payrollRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{record.employee_name}</div>
                      {record.employee_email && (
                        <div className="text-sm text-muted-foreground">{record.employee_email}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(record.pay_period_start).toLocaleDateString()} - {new Date(record.pay_period_end).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{formatCurrency(record.gross_pay_cents / 100)}</TableCell>
                  <TableCell>{formatCurrency(record.net_pay_cents / 100)}</TableCell>
                  <TableCell>{new Date(record.pay_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {isAdmin() ? (
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(record)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(record.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">View Only</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}