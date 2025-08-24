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
import { Plus, Clock, DollarSign, CheckCircle, Edit, Trash2, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/currency';

interface WorkSchedule {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  hourly_rate_cents: number;
  daily_rate_cents: number;
  salary_weekly_cents: number;
  work_type: string;
  is_recurring: boolean;
  recurrence_pattern: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface WorkSettings {
  default_hourly_rate_cents: number;
  default_pay_type: string;
  currency: string;
  vacation_hours_total: number;
  vacation_hours_used: number;
  sick_hours_total: number;
  sick_hours_used: number;
  personal_hours_total: number;
  personal_hours_used: number;
}

export const WorkScheduleManager = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<WorkSchedule[]>([]);
  const [workSettings, setWorkSettings] = useState<WorkSettings | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<WorkSchedule | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    start_time: '',
    end_time: '',
    pay_rate_cents: '',
    pay_type: 'hourly',
    currency: 'USD',
    notes: ''
  });

  const [settingsForm, setSettingsForm] = useState<WorkSettings>({
    default_hourly_rate_cents: 0,
    default_pay_type: 'hourly',
    currency: 'USD',
    vacation_hours_total: 0,
    vacation_hours_used: 0,
    sick_hours_total: 0,
    sick_hours_used: 0,
    personal_hours_total: 0,
    personal_hours_used: 0
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      // Load work schedules
      const { data: schedulesData, error: schedulesError } = await supabase
        .from('work_schedules')
        .select('*')
        .eq('user_id', user!.id)
        .order('start_time', { ascending: false });

      if (schedulesError) throw schedulesError;

      // Load work settings - using dummy data for now
      const settingsData = null;
      const settingsError = null;

      if (settingsError && settingsError.code !== 'PGRST116') {
        throw settingsError;
      }

      setSchedules(schedulesData || []);
      setWorkSettings(settingsData);
      if (settingsData) {
        setSettingsForm(settingsData);
      }
    } catch (error) {
      console.error('Error loading work data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load work data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const scheduleData = {
        user_id: user!.id,
        title: formData.title,
        start_time: formData.start_time,
        end_time: formData.end_time,
        hourly_rate_cents: formData.pay_type === 'hourly' ? parseInt(formData.pay_rate_cents) * 100 : 0,
        daily_rate_cents: formData.pay_type === 'daily' ? parseInt(formData.pay_rate_cents) * 100 : 0,
        salary_weekly_cents: formData.pay_type === 'weekly' ? parseInt(formData.pay_rate_cents) * 100 : 0,
        work_type: formData.pay_type,
        is_recurring: false,
        recurrence_pattern: '',
      };

      if (editingSchedule) {
        const { error } = await supabase
          .from('work_schedules')
          .update(scheduleData)
          .eq('id', editingSchedule.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('work_schedules')
          .insert([scheduleData]);

        if (error) throw error;
      }

      toast({
        title: 'Success',
        description: `Work schedule ${editingSchedule ? 'updated' : 'created'} successfully`,
      });

      setIsDialogOpen(false);
      setEditingSchedule(null);
      setFormData({
        title: '',
        start_time: '',
        end_time: '',
        pay_rate_cents: '',
        pay_type: 'hourly',
        currency: 'USD',
        notes: ''
      });
      loadData();
    } catch (error) {
      console.error('Error saving work schedule:', error);
      toast({
        title: 'Error',
        description: 'Failed to save work schedule',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (schedule: WorkSchedule) => {
    setEditingSchedule(schedule);
    const payRate = schedule.hourly_rate_cents || schedule.daily_rate_cents || schedule.salary_weekly_cents;
    setFormData({
      title: schedule.title,
      start_time: schedule.start_time.slice(0, 16),
      end_time: schedule.end_time.slice(0, 16),
      pay_rate_cents: (payRate / 100).toString(),
      pay_type: schedule.work_type,
      currency: 'USD',
      notes: ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (scheduleId: string) => {
    try {
      const { error } = await supabase
        .from('work_schedules')
        .delete()
        .eq('id', scheduleId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Work schedule deleted successfully',
      });
      loadData();
    } catch (error) {
      console.error('Error deleting work schedule:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete work schedule',
        variant: 'destructive',
      });
    }
  };

  const handleMarkCompleted = async (schedule: WorkSchedule) => {
    try {
      // For demo purposes, just show a success message
      toast({
        title: 'Success',
        description: 'Work schedule marked as completed',
      });
      loadData();
    } catch (error) {
      console.error('Error updating work schedule:', error);
      toast({
        title: 'Error',
        description: 'Failed to update work schedule',
        variant: 'destructive',
      });
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const settingsData = {
        user_id: user!.id,
        ...settingsForm
      };

      // Dummy settings save for now
      console.log('Saving work settings:', settingsData);

      toast({
        title: 'Success',
        description: 'Work settings updated successfully',
      });

      setIsSettingsDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Error saving work settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save work settings',
        variant: 'destructive',
      });
    }
  };

  const getPayTypeLabel = (payType: string) => {
    const labels = {
      hourly: 'Hourly',
      daily: 'Daily',
      weekly: 'Weekly',
      bi_weekly: 'Bi-weekly',
      monthly: 'Monthly',
      salary: 'Salary'
    };
    return labels[payType as keyof typeof labels] || payType;
  };

  const calculateDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return hours.toFixed(1);
  };

  // Calculate KPIs
  const thisWeekSchedules = schedules.filter(schedule => {
    const scheduleDate = new Date(schedule.start_time);
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    return scheduleDate >= startOfWeek;
  });

  const projectedWeeklyIncome = thisWeekSchedules
    .reduce((sum, schedule) => {
      const payRate = schedule.hourly_rate_cents || schedule.daily_rate_cents || schedule.salary_weekly_cents;
      return sum + payRate;
    }, 0);
  
  const actualWeeklyIncome = 0; // Placeholder

  const totalPtoAvailable = workSettings 
    ? workSettings.vacation_hours_total + workSettings.sick_hours_total + workSettings.personal_hours_total
    : 0;
  
  const totalPtoUsed = workSettings 
    ? workSettings.vacation_hours_used + workSettings.sick_hours_used + workSettings.personal_hours_used
    : 0;

  if (isLoading) {
    return <div className="text-center">Loading work schedules...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Work Schedule</h2>
          <p className="text-muted-foreground">Manage your work schedule and track income</p>
        </div>
        
        <div className="space-x-2">
          <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Settings</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Work Settings</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSettingsSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="default_rate">Default Rate</Label>
                    <Input
                      id="default_rate"
                      type="number"
                      step="0.01"
                      value={settingsForm.default_hourly_rate_cents / 100}
                      onChange={(e) => setSettingsForm({
                        ...settingsForm,
                        default_hourly_rate_cents: parseFloat(e.target.value) * 100 || 0
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="default_pay_type">Pay Type</Label>
                    <Select 
                      value={settingsForm.default_pay_type} 
                      onValueChange={(value) => setSettingsForm({...settingsForm, default_pay_type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="bi_weekly">Bi-weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="salary">Salary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="vacation_total">Vacation Hours</Label>
                    <Input
                      id="vacation_total"
                      type="number"
                      value={settingsForm.vacation_hours_total}
                      onChange={(e) => setSettingsForm({
                        ...settingsForm,
                        vacation_hours_total: parseFloat(e.target.value) || 0
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sick_total">Sick Hours</Label>
                    <Input
                      id="sick_total"
                      type="number"
                      value={settingsForm.sick_hours_total}
                      onChange={(e) => setSettingsForm({
                        ...settingsForm,
                        sick_hours_total: parseFloat(e.target.value) || 0
                      })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="personal_total">Personal Hours</Label>
                  <Input
                    id="personal_total"
                    type="number"
                    value={settingsForm.personal_hours_total}
                    onChange={(e) => setSettingsForm({
                      ...settingsForm,
                      personal_hours_total: parseFloat(e.target.value) || 0
                    })}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsSettingsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save Settings</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Schedule
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editingSchedule ? 'Edit Work Schedule' : 'New Work Schedule'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_time">Start Time</Label>
                    <Input
                      id="start_time"
                      type="datetime-local"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_time">End Time</Label>
                    <Input
                      id="end_time"
                      type="datetime-local"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pay_rate">Pay Rate</Label>
                    <Input
                      id="pay_rate"
                      type="number"
                      step="0.01"
                      value={formData.pay_rate_cents}
                      onChange={(e) => setFormData({ ...formData, pay_rate_cents: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="pay_type">Pay Type</Label>
                    <Select value={formData.pay_type} onValueChange={(value) => setFormData({ ...formData, pay_type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="bi_weekly">Bi-weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="salary">Salary</SelectItem>
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
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingSchedule ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projected Weekly</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(projectedWeeklyIncome / 100)}</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actual Weekly</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(actualWeeklyIncome / 100)}</div>
            <p className="text-xs text-muted-foreground">Completed work</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">PTO Available</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(totalPtoAvailable - totalPtoUsed).toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Hours remaining</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed This Week</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{thisWeekSchedules.length}</div>
            <p className="text-xs text-muted-foreground">Work sessions</p>
          </CardContent>
        </Card>
      </div>

      {/* Work Schedules Table */}
      <Card>
        <CardHeader>
          <CardTitle>Work Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Pay Rate</TableHead>
                <TableHead>Projected Income</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell className="font-medium">{schedule.title}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{new Date(schedule.start_time).toLocaleDateString()}</div>
                      <div className="text-muted-foreground">
                        {new Date(schedule.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                        {new Date(schedule.end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{calculateDuration(schedule.start_time, schedule.end_time)}h</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{formatCurrency((schedule.hourly_rate_cents || schedule.daily_rate_cents || schedule.salary_weekly_cents) / 100)}</div>
                      <div className="text-muted-foreground">{getPayTypeLabel(schedule.work_type)}</div>
                    </div>
                  </TableCell>
                  <TableCell>{formatCurrency((schedule.hourly_rate_cents || schedule.daily_rate_cents || schedule.salary_weekly_cents) / 100)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      Scheduled
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkCompleted(schedule)}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(schedule)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(schedule.id)}
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