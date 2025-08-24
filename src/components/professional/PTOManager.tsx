import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Calendar, Clock, CheckCircle, XCircle, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface PTORequest {
  id: string;
  start_date: string;
  end_date: string;
  hours_requested: number;
  pto_type: string;
  status: string;
  notes: string;
  created_at: string;
}

export const PTOManager = () => {
  const { user } = useAuth();
  const [ptoRequests, setPtoRequests] = useState<PTORequest[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPTO, setEditingPTO] = useState<PTORequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    hours_requested: '',
    pto_type: 'vacation',
    notes: ''
  });

  useEffect(() => {
    if (user) {
      loadPTORequests();
    }
  }, [user]);

  const loadPTORequests = async () => {
    try {
      const { data, error } = await supabase
        .from('pto_requests')
        .select('*')
        .eq('user_id', user!.id)
        .order('start_date', { ascending: false });

      if (error) throw error;
      setPtoRequests(data || []);
    } catch (error) {
      console.error('Error loading PTO requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to load PTO requests',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const ptoData = {
        user_id: user!.id,
        start_date: formData.start_date,
        end_date: formData.end_date,
        hours_requested: parseFloat(formData.hours_requested),
        pto_type: formData.pto_type,
        notes: formData.notes,
      };

      if (editingPTO) {
        const { error } = await supabase
          .from('pto_requests')
          .update(ptoData)
          .eq('id', editingPTO.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('pto_requests')
          .insert([ptoData]);

        if (error) throw error;
      }

      toast({
        title: 'Success',
        description: `PTO request ${editingPTO ? 'updated' : 'created'} successfully`,
      });

      setIsDialogOpen(false);
      setEditingPTO(null);
      setFormData({
        start_date: '',
        end_date: '',
        hours_requested: '',
        pto_type: 'vacation',
        notes: ''
      });
      loadPTORequests();
    } catch (error) {
      console.error('Error saving PTO request:', error);
      toast({
        title: 'Error',
        description: 'Failed to save PTO request',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (pto: PTORequest) => {
    setEditingPTO(pto);
    setFormData({
      start_date: pto.start_date,
      end_date: pto.end_date,
      hours_requested: pto.hours_requested.toString(),
      pto_type: pto.pto_type,
      notes: pto.notes || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (ptoId: string) => {
    try {
      const { error } = await supabase
        .from('pto_requests')
        .delete()
        .eq('id', ptoId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'PTO request deleted successfully',
      });
      loadPTORequests();
    } catch (error) {
      console.error('Error deleting PTO request:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete PTO request',
        variant: 'destructive',
      });
    }
  };

  const handleApprove = async (ptoId: string, hoursRequested: number) => {
    try {
      const { error } = await supabase
        .from('pto_requests')
        .update({ 
          status: 'approved',
          hours_requested: hoursRequested
        })
        .eq('id', ptoId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'PTO request approved',
      });
      loadPTORequests();
    } catch (error) {
      console.error('Error approving PTO request:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve PTO request',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      denied: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getPTOTypeLabel = (type: string) => {
    const labels = {
      vacation: 'Vacation',
      sick: 'Sick',
      personal: 'Personal',
      holiday: 'Holiday'
    };
    return labels[type as keyof typeof labels] || type;
  };

  // Calculate statistics
  const totalRequested = ptoRequests.reduce((sum, pto) => sum + pto.hours_requested, 0);
  const totalApproved = ptoRequests
    .filter(pto => pto.status === 'approved')
    .reduce((sum, pto) => sum + pto.hours_requested, 0);
  
  const pendingRequests = ptoRequests.filter(pto => pto.status === 'pending').length;
  const approvedRequests = ptoRequests.filter(pto => pto.status === 'approved').length;

  if (isLoading) {
    return <div className="text-center">Loading PTO requests...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Time Off Management</h2>
          <p className="text-muted-foreground">Track your PTO and vacation requests</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Request Time Off
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingPTO ? 'Edit PTO Request' : 'New PTO Request'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hours_requested">Hours</Label>
                  <Input
                    id="hours_requested"
                    type="number"
                    step="0.5"
                    value={formData.hours_requested}
                    onChange={(e) => setFormData({ ...formData, hours_requested: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="pto_type">Type</Label>
                  <Select value={formData.pto_type} onValueChange={(value) => setFormData({ ...formData, pto_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vacation">Vacation</SelectItem>
                      <SelectItem value="sick">Sick</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="holiday">Holiday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  placeholder="Optional notes about your request..."
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingPTO ? 'Update' : 'Submit Request'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* PTO Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requested</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequested}</div>
            <p className="text-xs text-muted-foreground">Hours this year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalApproved}</div>
            <p className="text-xs text-muted-foreground">Hours approved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRequests}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Requests</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedRequests}</div>
            <p className="text-xs text-muted-foreground">This year</p>
          </CardContent>
        </Card>
      </div>

      {/* PTO Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>PTO Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dates</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ptoRequests.map((pto) => (
                <TableRow key={pto.id}>
                  <TableCell>
                    <div className="text-sm">
                      <div>{new Date(pto.start_date).toLocaleDateString()}</div>
                      <div className="text-muted-foreground">to {new Date(pto.end_date).toLocaleDateString()}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{getPTOTypeLabel(pto.pto_type)}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{pto.hours_requested}h</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(pto.status)}>
                      {pto.status.charAt(0).toUpperCase() + pto.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {pto.notes || '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {pto.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApprove(pto.id, pto.hours_requested)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(pto)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(pto.id)}
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
    </div>
  );
};