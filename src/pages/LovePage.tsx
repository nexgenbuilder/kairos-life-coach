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
import { Plus, Heart, Calendar, Gift, Users, Clock, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { formatDistance } from 'date-fns';

interface Person {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  birthday: string;
  notes: string;
  last_interaction_at: string;
  created_at: string;
}

interface KeyDate {
  id: string;
  title: string;
  date_value: string;
  recurrence: string;
  reminder_days: number;
  person?: {
    full_name: string;
  };
  created_at: string;
}

interface Interaction {
  id: string;
  summary: string;
  channel: string;
  sentiment: string;
  follow_up_date: string;
  created_at: string;
  person: {
    full_name: string;
  };
}

const LovePage = () => {
  const { user } = useAuth();
  const [family, setFamily] = useState<Person[]>([]);
  const [keyDates, setKeyDates] = useState<KeyDate[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPersonDialogOpen, setIsPersonDialogOpen] = useState(false);
  const [isKeyDateDialogOpen, setIsKeyDateDialogOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [editingKeyDate, setEditingKeyDate] = useState<KeyDate | null>(null);

  const [personFormData, setPersonFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    birthday: '',
    notes: '',
    type: 'family'
  });

  const [keyDateFormData, setKeyDateFormData] = useState({
    title: '',
    date_value: '',
    recurrence: 'yearly',
    reminder_days: '7',
    person_id: ''
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      // Load family members and partners
      const { data: familyData, error: familyError } = await supabase
        .from('people')
        .select('*')
        .eq('user_id', user!.id)
        .in('type', ['family', 'partner'])
        .order('created_at', { ascending: false });

      if (familyError) throw familyError;

      // Load key dates
      const { data: keyDatesData, error: keyDatesError } = await supabase
        .from('key_dates')
        .select(`
          *,
          person:person_id (
            full_name
          )
        `)
        .eq('user_id', user!.id)
        .order('date_value', { ascending: true });

      if (keyDatesError) throw keyDatesError;

      // Load recent interactions
      const { data: interactionsData, error: interactionsError } = await supabase
        .from('interactions')
        .select(`
          *,
          person:person_id (
            full_name
          )
        `)
        .eq('user_id', user!.id)
        .eq('module', 'love')
        .order('created_at', { ascending: false })
        .limit(10);

      if (interactionsError) throw interactionsError;

      setFamily(familyData || []);
      setKeyDates(keyDatesData || []);
      setInteractions(interactionsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load family data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePersonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const personData = {
        user_id: user!.id,
        type: personFormData.type,
        full_name: personFormData.full_name,
        email: personFormData.email,
        phone: personFormData.phone,
        birthday: personFormData.birthday || null,
        notes: personFormData.notes,
      };

      if (editingPerson) {
        const { error } = await supabase
          .from('people')
          .update(personData)
          .eq('id', editingPerson.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('people')
          .insert([personData]);

        if (error) throw error;
      }

      toast({
        title: 'Success',
        description: `${personFormData.type === 'partner' ? 'Partner' : 'Family member'} ${editingPerson ? 'updated' : 'added'} successfully`,
      });

      setIsPersonDialogOpen(false);
      setEditingPerson(null);
      setPersonFormData({
        full_name: '',
        email: '',
        phone: '',
        birthday: '',
        notes: '',
        type: 'family'
      });
      loadData();
    } catch (error) {
      console.error('Error saving person:', error);
      toast({
        title: 'Error',
        description: 'Failed to save person',
        variant: 'destructive',
      });
    }
  };

  const handleKeyDateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const keyDateData = {
        user_id: user!.id,
        title: keyDateFormData.title,
        date_value: keyDateFormData.date_value,
        recurrence: keyDateFormData.recurrence,
        reminder_days: parseInt(keyDateFormData.reminder_days),
        person_id: keyDateFormData.person_id || null,
      };

      if (editingKeyDate) {
        const { error } = await supabase
          .from('key_dates')
          .update(keyDateData)
          .eq('id', editingKeyDate.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('key_dates')
          .insert([keyDateData]);

        if (error) throw error;
      }

      toast({
        title: 'Success',
        description: `Key date ${editingKeyDate ? 'updated' : 'created'} successfully`,
      });

      setIsKeyDateDialogOpen(false);
      setEditingKeyDate(null);
      setKeyDateFormData({
        title: '',
        date_value: '',
        recurrence: 'yearly',
        reminder_days: '7',
        person_id: ''
      });
      loadData();
    } catch (error) {
      console.error('Error saving key date:', error);
      toast({
        title: 'Error',
        description: 'Failed to save key date',
        variant: 'destructive',
      });
    }
  };

  const handlePersonEdit = (person: Person) => {
    setEditingPerson(person);
    setPersonFormData({
      full_name: person.full_name,
      email: person.email || '',
      phone: person.phone || '',
      birthday: person.birthday || '',
      notes: person.notes || '',
      type: 'family' // We'll determine this from the existing data
    });
    setIsPersonDialogOpen(true);
  };

  const handleKeyDateEdit = (keyDate: KeyDate) => {
    setEditingKeyDate(keyDate);
    setKeyDateFormData({
      title: keyDate.title,
      date_value: keyDate.date_value,
      recurrence: keyDate.recurrence,
      reminder_days: keyDate.reminder_days.toString(),
      person_id: (keyDate.person as any)?.id || ''
    });
    setIsKeyDateDialogOpen(true);
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
        description: 'Person deleted successfully',
      });
      loadData();
    } catch (error) {
      console.error('Error deleting person:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete person',
        variant: 'destructive',
      });
    }
  };

  const handleKeyDateDelete = async (keyDateId: string) => {
    try {
      const { error } = await supabase
        .from('key_dates')
        .delete()
        .eq('id', keyDateId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Key date deleted successfully',
      });
      loadData();
    } catch (error) {
      console.error('Error deleting key date:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete key date',
        variant: 'destructive',
      });
    }
  };

  // Calculate upcoming key dates (next 30 days)
  const upcomingKeyDates = keyDates.filter(keyDate => {
    const date = new Date(keyDate.date_value);
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    // For yearly recurring dates, check if the anniversary is coming up
    if (keyDate.recurrence === 'yearly') {
      date.setFullYear(today.getFullYear());
      if (date < today) {
        date.setFullYear(today.getFullYear() + 1);
      }
    }
    
    return date >= today && date <= thirtyDaysFromNow;
  });

  const getSentimentColor = (sentiment: string) => {
    const colors = {
      positive: 'bg-green-100 text-green-800',
      neutral: 'bg-gray-100 text-gray-800',
      negative: 'bg-red-100 text-red-800',
    };
    return colors[sentiment as keyof typeof colors] || colors.neutral;
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Love
            </h1>
            <p className="text-muted-foreground mt-2">Nurture your family relationships and special moments</p>
          </div>
          
          <div className="space-x-2">
            <Dialog open={isKeyDateDialogOpen} onOpenChange={setIsKeyDateDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Gift className="h-4 w-4 mr-2" />
                  Add Key Date
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingKeyDate ? 'Edit Key Date' : 'Add Key Date'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleKeyDateSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={keyDateFormData.title}
                      onChange={(e) => setKeyDateFormData({ ...keyDateFormData, title: e.target.value })}
                      placeholder="Anniversary, Birthday, etc."
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="date_value">Date</Label>
                    <Input
                      id="date_value"
                      type="date"
                      value={keyDateFormData.date_value}
                      onChange={(e) => setKeyDateFormData({ ...keyDateFormData, date_value: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="person">Person (Optional)</Label>
                    <Select value={keyDateFormData.person_id} onValueChange={(value) => setKeyDateFormData({ ...keyDateFormData, person_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select person" />
                      </SelectTrigger>
                      <SelectContent>
                        {family.map((person) => (
                          <SelectItem key={person.id} value={person.id}>
                            {person.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="recurrence">Recurrence</Label>
                      <Select value={keyDateFormData.recurrence} onValueChange={(value) => setKeyDateFormData({ ...keyDateFormData, recurrence: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="reminder_days">Reminder (days before)</Label>
                      <Input
                        id="reminder_days"
                        type="number"
                        min="1"
                        value={keyDateFormData.reminder_days}
                        onChange={(e) => setKeyDateFormData({ ...keyDateFormData, reminder_days: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsKeyDateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingKeyDate ? 'Update' : 'Add'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isPersonDialogOpen} onOpenChange={setIsPersonDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Family Member
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingPerson ? 'Edit Family Member' : 'Add Family Member'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handlePersonSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="full_name">Name</Label>
                    <Input
                      id="full_name"
                      value={personFormData.full_name}
                      onChange={(e) => setPersonFormData({ ...personFormData, full_name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="type">Relationship</Label>
                    <Select value={personFormData.type} onValueChange={(value) => setPersonFormData({ ...personFormData, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="partner">Partner</SelectItem>
                        <SelectItem value="family">Family</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={personFormData.email}
                      onChange={(e) => setPersonFormData({ ...personFormData, email: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={personFormData.phone}
                      onChange={(e) => setPersonFormData({ ...personFormData, phone: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="birthday">Birthday</Label>
                    <Input
                      id="birthday"
                      type="date"
                      value={personFormData.birthday}
                      onChange={(e) => setPersonFormData({ ...personFormData, birthday: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={personFormData.notes}
                      onChange={(e) => setPersonFormData({ ...personFormData, notes: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsPersonDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingPerson ? 'Update' : 'Add'}
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
              <CardTitle className="text-sm font-medium">Family Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{family.length}</div>
              <p className="text-xs text-muted-foreground">In your circle</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Dates</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingKeyDates.length}</div>
              <p className="text-xs text-muted-foreground">Next 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Key Dates</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{keyDates.length}</div>
              <p className="text-xs text-muted-foreground">Total tracked</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Interactions</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{interactions.length}</div>
              <p className="text-xs text-muted-foreground">Logged</p>
            </CardContent>
          </Card>
        </div>

        {/* Family Members */}
        <Card>
          <CardHeader>
            <CardTitle>Family & Partners</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Birthday</TableHead>
                  <TableHead>Last Contact</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {family.map((person) => (
                  <TableRow key={person.id}>
                    <TableCell className="font-medium">{person.full_name}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {person.email && <div>{person.email}</div>}
                        {person.phone && <div>{person.phone}</div>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {person.birthday ? new Date(person.birthday).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      {person.last_interaction_at 
                        ? formatDistance(new Date(person.last_interaction_at), new Date(), { addSuffix: true })
                        : 'No contact yet'
                      }
                    </TableCell>
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
                {family.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No family members added yet. Add your first family member to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Key Dates */}
        <Card>
          <CardHeader>
            <CardTitle>Important Dates</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Person</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Recurrence</TableHead>
                  <TableHead>Reminder</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keyDates.map((keyDate) => (
                  <TableRow key={keyDate.id}>
                    <TableCell className="font-medium">{keyDate.title}</TableCell>
                    <TableCell>{keyDate.person?.full_name || 'General'}</TableCell>
                    <TableCell>{new Date(keyDate.date_value).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{keyDate.recurrence}</Badge>
                    </TableCell>
                    <TableCell>{keyDate.reminder_days} days before</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleKeyDateEdit(keyDate)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleKeyDateDelete(keyDate.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {keyDates.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No key dates added yet. Add important dates to track anniversaries and special occasions.
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

export default LovePage;