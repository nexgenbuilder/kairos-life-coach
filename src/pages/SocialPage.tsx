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
import { Plus, Users, Calendar, Heart, MessageCircle, Clock, Edit, Trash2 } from 'lucide-react';
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

interface RelationshipRule {
  id: string;
  cadence_days: number;
  next_nudge_date: string;
  person: {
    full_name: string;
  };
}

const SocialPage = () => {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Person[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [relationshipRules, setRelationshipRules] = useState<RelationshipRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPersonDialogOpen, setIsPersonDialogOpen] = useState(false);
  const [isInteractionDialogOpen, setIsInteractionDialogOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);

  const [personFormData, setPersonFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    birthday: '',
    notes: ''
  });

  const [interactionFormData, setInteractionFormData] = useState({
    person_id: '',
    summary: '',
    channel: 'note',
    sentiment: 'neutral',
    follow_up_date: ''
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      // Load friends
      const { data: friendsData, error: friendsError } = await supabase
        .from('people')
        .select('*')
        .eq('user_id', user!.id)
        .eq('type', 'friend')
        .order('created_at', { ascending: false });

      if (friendsError) throw friendsError;

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
        .eq('module', 'social')
        .order('created_at', { ascending: false })
        .limit(10);

      if (interactionsError) throw interactionsError;

      // Load relationship rules
      const { data: rulesData, error: rulesError } = await supabase
        .from('relationship_rules')
        .select(`
          *,
          person:person_id (
            full_name
          )
        `)
        .eq('user_id', user!.id)
        .order('next_nudge_date', { ascending: true });

      if (rulesError) throw rulesError;

      setFriends(friendsData || []);
      setInteractions(interactionsData || []);
      setRelationshipRules(rulesData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load social data',
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
        type: 'friend',
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
        description: `Friend ${editingPerson ? 'updated' : 'added'} successfully`,
      });

      setIsPersonDialogOpen(false);
      setEditingPerson(null);
      setPersonFormData({
        full_name: '',
        email: '',
        phone: '',
        birthday: '',
        notes: ''
      });
      loadData();
    } catch (error) {
      console.error('Error saving friend:', error);
      toast({
        title: 'Error',
        description: 'Failed to save friend',
        variant: 'destructive',
      });
    }
  };

  const handleInteractionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const interactionData = {
        user_id: user!.id,
        person_id: interactionFormData.person_id,
        module: 'social',
        summary: interactionFormData.summary,
        channel: interactionFormData.channel,
        sentiment: interactionFormData.sentiment,
        follow_up_date: interactionFormData.follow_up_date || null,
      };

      const { error } = await supabase
        .from('interactions')
        .insert([interactionData]);

      if (error) throw error;

      // Update last interaction date for the person
      await supabase
        .from('people')
        .update({ last_interaction_at: new Date().toISOString() })
        .eq('id', interactionFormData.person_id);

      toast({
        title: 'Success',
        description: 'Interaction logged successfully',
      });

      setIsInteractionDialogOpen(false);
      setInteractionFormData({
        person_id: '',
        summary: '',
        channel: 'note',
        sentiment: 'neutral',
        follow_up_date: ''
      });
      loadData();
    } catch (error) {
      console.error('Error logging interaction:', error);
      toast({
        title: 'Error',
        description: 'Failed to log interaction',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (person: Person) => {
    setEditingPerson(person);
    setPersonFormData({
      full_name: person.full_name,
      email: person.email || '',
      phone: person.phone || '',
      birthday: person.birthday || '',
      notes: person.notes || ''
    });
    setIsPersonDialogOpen(true);
  };

  const handleDelete = async (personId: string) => {
    try {
      const { error } = await supabase
        .from('people')
        .delete()
        .eq('id', personId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Friend deleted successfully',
      });
      loadData();
    } catch (error) {
      console.error('Error deleting friend:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete friend',
        variant: 'destructive',
      });
    }
  };

  const startCadence = async (personId: string) => {
    try {
      const cadenceDays = 14; // Default to 2 weeks
      const nextNudgeDate = new Date();
      nextNudgeDate.setDate(nextNudgeDate.getDate() + cadenceDays);

      const { error } = await supabase
        .from('relationship_rules')
        .insert([{
          user_id: user!.id,
          person_id: personId,
          cadence_days: cadenceDays,
          next_nudge_date: nextNudgeDate.toISOString().split('T')[0]
        }]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Relationship cadence started',
      });
      loadData();
    } catch (error) {
      console.error('Error starting cadence:', error);
      toast({
        title: 'Error',
        description: 'Failed to start cadence',
        variant: 'destructive',
      });
    }
  };

  const getSentimentColor = (sentiment: string) => {
    const colors = {
      positive: 'bg-green-100 text-green-800',
      neutral: 'bg-gray-100 text-gray-800',
      negative: 'bg-red-100 text-red-800',
    };
    return colors[sentiment as keyof typeof colors] || colors.neutral;
  };

  // Calculate overdue check-ins
  const overdueNudges = relationshipRules.filter(rule => 
    new Date(rule.next_nudge_date) <= new Date()
  );

  const upcomingBirthdays = friends.filter(friend => {
    if (!friend.birthday) return false;
    const birthday = new Date(friend.birthday);
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    birthday.setFullYear(today.getFullYear());
    return birthday >= today && birthday <= nextWeek;
  });

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
              Social
            </h1>
            <p className="text-muted-foreground mt-2">Manage your friendships and social connections</p>
          </div>
          
          <div className="space-x-2">
            <Dialog open={isInteractionDialogOpen} onOpenChange={setIsInteractionDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Log Interaction
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Log Social Interaction</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleInteractionSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="person">Friend</Label>
                    <Select value={interactionFormData.person_id} onValueChange={(value) => setInteractionFormData({ ...interactionFormData, person_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select friend" />
                      </SelectTrigger>
                      <SelectContent>
                        {friends.map((friend) => (
                          <SelectItem key={friend.id} value={friend.id}>
                            {friend.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="summary">Summary</Label>
                    <Textarea
                      id="summary"
                      value={interactionFormData.summary}
                      onChange={(e) => setInteractionFormData({ ...interactionFormData, summary: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="channel">Channel</Label>
                      <Select value={interactionFormData.channel} onValueChange={(value) => setInteractionFormData({ ...interactionFormData, channel: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="call">Call</SelectItem>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="meeting">In Person</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="note">Note</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="sentiment">Sentiment</Label>
                      <Select value={interactionFormData.sentiment} onValueChange={(value) => setInteractionFormData({ ...interactionFormData, sentiment: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="positive">Positive</SelectItem>
                          <SelectItem value="neutral">Neutral</SelectItem>
                          <SelectItem value="negative">Negative</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="follow_up_date">Follow-up Date</Label>
                    <Input
                      id="follow_up_date"
                      type="date"
                      value={interactionFormData.follow_up_date}
                      onChange={(e) => setInteractionFormData({ ...interactionFormData, follow_up_date: e.target.value })}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsInteractionDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Log Interaction</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isPersonDialogOpen} onOpenChange={setIsPersonDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Friend
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingPerson ? 'Edit Friend' : 'Add New Friend'}</DialogTitle>
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
              <CardTitle className="text-sm font-medium">Total Friends</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{friends.length}</div>
              <p className="text-xs text-muted-foreground">In your network</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue Check-ins</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overdueNudges.length}</div>
              <p className="text-xs text-muted-foreground">Need attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Birthdays</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingBirthdays.length}</div>
              <p className="text-xs text-muted-foreground">Next 7 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Interactions</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{interactions.length}</div>
              <p className="text-xs text-muted-foreground">Last 10 logged</p>
            </CardContent>
          </Card>
        </div>

        {/* Friends List */}
        <Card>
          <CardHeader>
            <CardTitle>Friends</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Last Contact</TableHead>
                  <TableHead>Birthday</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {friends.map((friend) => (
                  <TableRow key={friend.id}>
                    <TableCell className="font-medium">{friend.full_name}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {friend.email && <div>{friend.email}</div>}
                        {friend.phone && <div>{friend.phone}</div>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {friend.last_interaction_at 
                        ? formatDistance(new Date(friend.last_interaction_at), new Date(), { addSuffix: true })
                        : 'No contact yet'
                      }
                    </TableCell>
                    <TableCell>
                      {friend.birthday ? new Date(friend.birthday).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => startCadence(friend.id)}>
                          <Clock className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(friend)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(friend.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {friends.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No friends added yet. Add your first friend to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Interactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Interactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {interactions.map((interaction) => (
                <div key={interaction.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                  <MessageCircle className="h-5 w-5 mt-0.5 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{interaction.person.full_name}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge className={getSentimentColor(interaction.sentiment)}>
                          {interaction.sentiment}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatDistance(new Date(interaction.created_at), new Date(), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <p className="text-muted-foreground mt-1">{interaction.summary}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="outline">{interaction.channel}</Badge>
                      {interaction.follow_up_date && (
                        <span className="text-sm text-muted-foreground">
                          Follow-up: {new Date(interaction.follow_up_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {interactions.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  No interactions logged yet. Start by logging your first interaction with a friend.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default SocialPage;