import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Globe, Users, Search, Building2, Heart, FolderOpen, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface PublicSpace {
  id: string;
  name: string;
  description: string;
  type: string;
  visibility: string;
  join_approval_required: boolean;
  member_count: number;
  created_at: string;
}

const PublicSpacesPage = () => {
  const { user } = useAuth();
  const [spaces, setSpaces] = useState<PublicSpace[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSpace, setSelectedSpace] = useState<PublicSpace | null>(null);
  const [joinMessage, setJoinMessage] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadPublicSpaces();
  }, []);

  const loadPublicSpaces = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('visibility', 'public')
        .eq('discoverable', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get member counts for each space
      const spacesWithCounts = await Promise.all(
        (data || []).map(async (space) => {
          const { count } = await supabase
            .from('organization_memberships')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', space.id)
            .eq('is_active', true);

          return {
            ...space,
            member_count: count || 0,
          };
        })
      );

      setSpaces(spacesWithCounts);
    } catch (error) {
      console.error('Error loading public spaces:', error);
      toast({
        title: 'Error',
        description: 'Failed to load public spaces',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRequest = async () => {
    if (!selectedSpace) return;

    try {
      if (selectedSpace.join_approval_required) {
        // Create join request
        const { error } = await supabase
          .from('space_join_requests')
          .insert({
            space_id: selectedSpace.id,
            user_id: user!.id,
            message: joinMessage,
            status: 'pending',
          });

        if (error) throw error;

        toast({
          title: 'Request sent!',
          description: 'Your join request has been sent to the space admins.',
        });
      } else {
        // Auto-join
        const { error } = await supabase
          .from('organization_memberships')
          .insert({
            organization_id: selectedSpace.id,
            user_id: user!.id,
            role: 'member',
            is_active: true,
          });

        if (error) throw error;

        // Create user context
        await supabase
          .from('user_contexts')
          .insert({
            user_id: user!.id,
            group_id: selectedSpace.id,
            is_active: false,
          });

        toast({
          title: 'Joined successfully!',
          description: `You are now a member of ${selectedSpace.name}.`,
        });
      }

      setIsDialogOpen(false);
      setJoinMessage('');
      loadPublicSpaces();
    } catch (error: any) {
      console.error('Error joining space:', error);
      toast({
        title: 'Error',
        description: error.message === 'duplicate key value violates unique constraint "space_join_requests_space_id_user_id_key"'
          ? 'You have already requested to join this space.'
          : 'Failed to join space. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getSpaceIcon = (type: string) => {
    switch (type) {
      case 'organization':
        return Building2;
      case 'family':
        return Heart;
      case 'project':
        return FolderOpen;
      default:
        return Users;
    }
  };

  const filteredSpaces = spaces.filter(space =>
    space.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    space.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto p-4 sm:p-6 max-w-full overflow-x-hidden">
          <div className="text-center">Loading public spaces...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Discover Public Spaces
            </h1>
            <p className="text-muted-foreground mt-2">
              Join communities and collaborate with others
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search spaces..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredSpaces.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Globe className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No public spaces found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSpaces.map((space) => {
              const Icon = getSpaceIcon(space.type);
              return (
                <Card key={space.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{space.name}</CardTitle>
                          <Badge variant="outline" className="mt-1">
                            {space.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CardDescription className="line-clamp-3">
                      {space.description || 'No description provided'}
                    </CardDescription>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{space.member_count} members</span>
                      </div>
                      {space.join_approval_required ? (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Requires approval
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Open to join
                        </Badge>
                      )}
                    </div>

                    <Button
                      className="w-full"
                      onClick={() => {
                        setSelectedSpace(space);
                        setIsDialogOpen(true);
                      }}
                    >
                      {space.join_approval_required ? 'Request to Join' : 'Join Space'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Join {selectedSpace?.name}
              </DialogTitle>
              <DialogDescription>
                {selectedSpace?.join_approval_required
                  ? 'Send a request to join this space. Admins will review your request.'
                  : 'You can join this space immediately.'}
              </DialogDescription>
            </DialogHeader>
            
            {selectedSpace?.join_approval_required && (
              <div className="space-y-2">
                <Label htmlFor="message">Message (Optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Introduce yourself or explain why you'd like to join..."
                  value={joinMessage}
                  onChange={(e) => setJoinMessage(e.target.value)}
                  rows={4}
                />
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleJoinRequest}>
                {selectedSpace?.join_approval_required ? 'Send Request' : 'Join Now'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default PublicSpacesPage;
