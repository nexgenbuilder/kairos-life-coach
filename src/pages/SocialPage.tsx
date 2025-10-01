import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, MapPin, Tag, Filter, Search, Building2, UserPlus, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import { toast } from '@/hooks/use-toast';
import { formatDistance } from 'date-fns';

interface Connection {
  id: string;
  connection_user_id: string;
  category: string;
  source_organization_id: string | null;
  discovered_at: string;
  profile: {
    full_name: string;
    avatar_url: string | null;
  };
  source_organization?: {
    name: string;
    type: string;
  };
}

interface SpaceTag {
  id: string;
  organization_id: string;
  tag: string;
  color: string;
  organization: {
    name: string;
  };
}

const SocialPage = () => {
  const { user } = useAuth();
  const { userContexts } = useOrganization();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [spaceTags, setSpaceTags] = useState<SpaceTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSpace, setSelectedSpace] = useState<string>('all');
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const [selectedOrgForTag, setSelectedOrgForTag] = useState('');
  const [newTag, setNewTag] = useState({ tag: '', color: '#3b82f6' });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load connections with their profiles first
      const { data: connectionsData, error: connectionsError } = await supabase
        .from('connection_categories')
        .select('*')
        .eq('user_id', user!.id)
        .order('discovered_at', { ascending: false });

      if (connectionsError) throw connectionsError;

      // Fetch profiles for all connections
      const userIds = connectionsData?.map(c => c.connection_user_id) || [];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);

      // Fetch organization details for connections with source
      const orgIds = connectionsData?.filter(c => c.source_organization_id).map(c => c.source_organization_id!) || [];
      const { data: orgsData } = await supabase
        .from('organizations')
        .select('id, name, type')
        .in('id', orgIds);

      // Combine data
      const enrichedConnections = connectionsData?.map(conn => ({
        ...conn,
        profile: profilesData?.find(p => p.user_id === conn.connection_user_id),
        source_organization: orgsData?.find(o => o.id === conn.source_organization_id)
      })) || [];

      // Load space tags
      const { data: tagsData, error: tagsError } = await supabase
        .from('user_space_tags')
        .select(`
          id,
          organization_id,
          tag,
          color,
          organization:organization_id (
            name
          )
        `)
        .eq('user_id', user!.id)
        .order('tag');

      if (tagsError) throw tagsError;

      setConnections(enrichedConnections as any);
      setSpaceTags(tagsData || []);
    } catch (error) {
      console.error('Error loading connections:', error);
      toast({
        title: 'Error',
        description: 'Failed to load connections',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedOrgForTag || !newTag.tag) {
      toast({
        title: 'Error',
        description: 'Please select a space and enter a tag',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('user_space_tags')
        .insert([{
          user_id: user!.id,
          organization_id: selectedOrgForTag,
          tag: newTag.tag,
          color: newTag.color
        }]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Tag added successfully',
      });

      setIsTagDialogOpen(false);
      setNewTag({ tag: '', color: '#3b82f6' });
      setSelectedOrgForTag('');
      loadData();
    } catch (error) {
      console.error('Error adding tag:', error);
      toast({
        title: 'Error',
        description: 'Failed to add tag',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveTag = async (tagId: string) => {
    try {
      const { error } = await supabase
        .from('user_space_tags')
        .delete()
        .eq('id', tagId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Tag removed successfully',
      });

      loadData();
    } catch (error) {
      console.error('Error removing tag:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove tag',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateCategory = async (connectionId: string, newCategory: string) => {
    try {
      const { error } = await supabase
        .from('connection_categories')
        .update({ category: newCategory })
        .eq('id', connectionId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Connection category updated',
      });

      loadData();
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: 'Error',
        description: 'Failed to update category',
        variant: 'destructive',
      });
    }
  };

  // Filter connections
  const filteredConnections = connections.filter(conn => {
    const matchesSearch = conn.profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || conn.category === selectedCategory;
    const matchesSpace = selectedSpace === 'all' || conn.source_organization_id === selectedSpace;
    return matchesSearch && matchesCategory && matchesSpace;
  });

  // Get unique categories and spaces
  const categories = Array.from(new Set(connections.map(c => c.category)));
  const spaces = Array.from(new Set(connections
    .filter(c => c.source_organization_id)
    .map(c => ({ id: c.source_organization_id!, name: c.source_organization?.name || 'Unknown' }))))
    .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);

  // Get tags grouped by space
  const tagsBySpace = spaceTags.reduce((acc, tag) => {
    if (!acc[tag.organization_id]) {
      acc[tag.organization_id] = [];
    }
    acc[tag.organization_id].push(tag);
    return acc;
  }, {} as Record<string, SpaceTag[]>);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      colleague: 'bg-blue-500/10 text-blue-700 border-blue-200',
      friend: 'bg-green-500/10 text-green-700 border-green-200',
      family: 'bg-purple-500/10 text-purple-700 border-purple-200',
      business: 'bg-orange-500/10 text-orange-700 border-orange-200',
      other: 'bg-gray-500/10 text-gray-700 border-gray-200',
    };
    return colors[category] || colors.other;
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto p-4 sm:p-6 max-w-full overflow-x-hidden">
          <div className="text-center">Loading connections...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-hero-gradient bg-clip-text text-transparent">
              Connections
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-2">
              {connections.length} connections across {spaces.length} spaces
            </p>
          </div>
          
          <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Tag className="h-4 w-4 mr-2" />
                Tag Spaces
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tag Your Spaces</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddTag} className="space-y-4">
                <div>
                  <Label>Space</Label>
                  <Select value={selectedOrgForTag} onValueChange={setSelectedOrgForTag}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a space" />
                    </SelectTrigger>
                    <SelectContent>
                      {userContexts.map((ctx) => (
                        <SelectItem key={ctx.group_id} value={ctx.group_id}>
                          {ctx.group_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Tag Name</Label>
                  <Input
                    placeholder="e.g., Work, Friends, Church, etc."
                    value={newTag.tag}
                    onChange={(e) => setNewTag({ ...newTag, tag: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label>Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={newTag.color}
                      onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
                      className="w-20"
                    />
                    <Input
                      value={newTag.color}
                      onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsTagDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Tag</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="connections" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="connections">
              <Users className="h-4 w-4 mr-2" />
              Connections
            </TabsTrigger>
            <TabsTrigger value="spaces">
              <Building2 className="h-4 w-4 mr-2" />
              Space Tags
            </TabsTrigger>
          </TabsList>

          <TabsContent value="connections" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Filter & Search</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Search</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search connections..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Category</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Space</Label>
                    <Select value={selectedSpace} onValueChange={setSelectedSpace}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Spaces</SelectItem>
                        {spaces.map(space => (
                          <SelectItem key={space.id} value={space.id}>{space.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredConnections.map((connection) => (
                <Card key={connection.id} className="hover:shadow-glow-soft transition-shadow">
                  <CardHeader className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={connection.profile?.avatar_url || undefined} />
                          <AvatarFallback>
                            {connection.profile?.full_name?.charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">
                            {connection.profile?.full_name || 'Unknown'}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground">
                            {connection.discovered_at && formatDistance(new Date(connection.discovered_at), new Date(), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">From:</span>
                        <Badge variant="outline" className="font-normal">
                          {connection.source_organization?.name || 'Direct Add'}
                        </Badge>
                      </div>

                      {connection.source_organization_id && tagsBySpace[connection.source_organization_id] && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <Tag className="h-4 w-4 text-muted-foreground" />
                          {tagsBySpace[connection.source_organization_id].map(tag => (
                            <Badge 
                              key={tag.id}
                              style={{ 
                                backgroundColor: `${tag.color}20`,
                                borderColor: tag.color,
                                color: tag.color
                              }}
                              className="font-normal"
                            >
                              {tag.tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div>
                        <Label className="text-xs">Category</Label>
                        <Select 
                          value={connection.category} 
                          onValueChange={(value) => handleUpdateCategory(connection.id, value)}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="colleague">Colleague</SelectItem>
                            <SelectItem value="friend">Friend</SelectItem>
                            <SelectItem value="family">Family</SelectItem>
                            <SelectItem value="business">Business</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredConnections.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {searchQuery || selectedCategory !== 'all' || selectedSpace !== 'all'
                      ? 'No connections match your filters'
                      : 'No connections yet. Join spaces to automatically discover connections!'}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="spaces" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Space Tags</CardTitle>
                <CardDescription>
                  Organize your spaces with personal tags like Work, Friends, Church, etc.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {userContexts.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Join or create spaces to start tagging them
                  </p>
                ) : (
                  <div className="space-y-4">
                    {userContexts.map((ctx) => (
                      <div key={ctx.group_id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-semibold">{ctx.group_name}</h3>
                            <p className="text-sm text-muted-foreground capitalize">{ctx.group_type}</p>
                          </div>
                          <Badge variant="outline">{ctx.role}</Badge>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {tagsBySpace[ctx.group_id]?.map(tag => (
                            <Badge
                              key={tag.id}
                              style={{ 
                                backgroundColor: `${tag.color}20`,
                                borderColor: tag.color,
                                color: tag.color
                              }}
                              className="gap-1"
                            >
                              {tag.tag}
                              <button
                                onClick={() => handleRemoveTag(tag.id)}
                                className="ml-1 hover:opacity-70"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          )) || (
                            <span className="text-sm text-muted-foreground">No tags yet</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default SocialPage;