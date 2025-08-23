import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface Note {
  id: string;
  title: string;
  content: string;
  person_id: string | null;
  module: string;
  created_at: string;
  updated_at: string;
  person?: {
    full_name: string;
  };
}

interface Person {
  id: string;
  full_name: string;
}

interface NotesManagerProps {
  module: 'social' | 'love' | 'business' | 'professional';
  personId?: string | null;
  refreshTrigger?: number;
}

const NotesManager: React.FC<NotesManagerProps> = ({ module, personId, refreshTrigger = 0 }) => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    person_id: personId || ''
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, module, personId, refreshTrigger]);

  const loadData = async () => {
    try {
      // Load notes for this module
      let notesQuery = supabase
        .from('notes')
        .select(`
          *,
          person:person_id (
            id,
            full_name
          )
        `)
        .eq('user_id', user!.id)
        .eq('module', module)
        .order('created_at', { ascending: false });

      if (personId) {
        notesQuery = notesQuery.eq('person_id', personId);
      }

      const { data: notesData, error: notesError } = await notesQuery;
      if (notesError) throw notesError;

      // Load people for this module
      const typeMap = {
        social: ['friend', 'colleague', 'acquaintance'],
        love: ['family', 'partner', 'spouse', 'relative'],
        business: ['client', 'supplier', 'partner', 'vendor'],
        professional: ['colleague', 'manager', 'hr', 'client']
      };

      const { data: peopleData, error: peopleError } = await supabase
        .from('people')
        .select('id, full_name')
        .eq('user_id', user!.id)
        .in('type', typeMap[module]);

      if (peopleError) throw peopleError;

      setNotes(notesData || []);
      setPeople(peopleData || []);
    } catch (error) {
      console.error('Error loading notes:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notes',
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
      const noteData = {
        user_id: user.id,
        title: formData.title,
        content: formData.content,
        person_id: formData.person_id || null,
        module: module
      };

      if (editingNote) {
        const { error } = await supabase
          .from('notes')
          .update(noteData)
          .eq('id', editingNote.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('notes')
          .insert([noteData]);
        if (error) throw error;
      }

      toast({
        title: 'Success',
        description: `Note ${editingNote ? 'updated' : 'created'} successfully`,
      });

      setIsDialogOpen(false);
      setEditingNote(null);
      setFormData({ title: '', content: '', person_id: personId || '' });
      loadData();
    } catch (error) {
      console.error('Error saving note:', error);
      toast({
        title: 'Error',
        description: 'Failed to save note',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      person_id: note.person_id || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Note deleted successfully',
      });
      loadData();
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete note',
        variant: 'destructive',
      });
    }
  };

  const getModuleColor = (module: string) => {
    const colors = {
      social: 'bg-blue-100 text-blue-800',
      love: 'bg-pink-100 text-pink-800',
      business: 'bg-green-100 text-green-800',
      professional: 'bg-purple-100 text-purple-800'
    };
    return colors[module as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading notes...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Notes
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Note
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingNote ? 'Edit Note' : 'Create New Note'}</DialogTitle>
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

              {!personId && (
                <div>
                  <Label htmlFor="person">Related Contact (Optional)</Label>
                  <Select value={formData.person_id} onValueChange={(value) => setFormData({ ...formData, person_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select contact" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No contact</SelectItem>
                      {people.map((person) => (
                        <SelectItem key={person.id} value={person.id}>
                          {person.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingNote ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {notes.length === 0 ? (
            <div className="text-center text-muted-foreground py-4">
              No notes yet. Create your first note to get started.
            </div>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="p-4 border rounded-lg space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{note.title}</h3>
                      <Badge className={getModuleColor(note.module)}>
                        {note.module}
                      </Badge>
                      {note.person && (
                        <Badge variant="outline">
                          {note.person.full_name}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{note.content}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(note.created_at).toLocaleDateString()} at {new Date(note.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(note)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(note.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NotesManager;