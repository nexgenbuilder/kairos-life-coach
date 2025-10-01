import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useOrganization } from '@/hooks/useOrganization';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Search, Users, Shield, Crown, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface Member {
  user_id: string;
  full_name: string;
  avatar_url?: string;
  role: string;
  joined_at: string;
  category?: string;
}

export default function MembersPage() {
  const { user } = useAuth();
  const { activeContext, loading: orgLoading } = useOrganization();
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (activeContext?.id) {
      fetchMembers();
    }
  }, [activeContext?.id]);

  useEffect(() => {
    let filtered = members;
    
    if (searchQuery) {
      filtered = filtered.filter(member =>
        member.full_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (categoryFilter && categoryFilter !== 'all') {
      filtered = filtered.filter(member => member.category === categoryFilter);
    }
    
    setFilteredMembers(filtered);
  }, [searchQuery, categoryFilter, members]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const { data: membershipsData, error: membershipsError } = await supabase
        .from('organization_memberships')
        .select('user_id, role, created_at')
        .eq('organization_id', activeContext!.id)
        .eq('is_active', true);

      if (membershipsError) throw membershipsError;

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', membershipsData.map(m => m.user_id));

      if (profilesError) throw profilesError;

      // Get connection categories
      const { data: categoriesData } = await supabase
        .from('connection_categories')
        .select('connection_user_id, category')
        .eq('user_id', user!.id)
        .eq('space_id', activeContext!.id);

      const combinedMembers = membershipsData.map(membership => {
        const profile = profilesData.find(p => p.user_id === membership.user_id);
        const categoryInfo = categoriesData?.find(c => c.connection_user_id === membership.user_id);
        return {
          user_id: membership.user_id,
          full_name: profile?.full_name || 'Unknown User',
          avatar_url: profile?.avatar_url,
          role: membership.role,
          joined_at: membership.created_at,
          category: categoryInfo?.category,
        };
      });

      setMembers(combinedMembers);
      setFilteredMembers(combinedMembers);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast({
        title: 'Error',
        description: 'Failed to load members',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = async (memberId: string, category: string) => {
    try {
      const { error } = await supabase
        .from('connection_categories')
        .upsert({
          user_id: user!.id,
          connection_user_id: memberId,
          space_id: activeContext!.id,
          category,
        });

      if (error) throw error;

      // Update local state
      setMembers(prev => prev.map(m => 
        m.user_id === memberId ? { ...m, category } : m
      ));

      toast({
        title: 'Category updated',
        description: 'Connection category has been updated successfully.',
      });
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: 'Error',
        description: 'Failed to update category',
        variant: 'destructive',
      });
    }
  };

  const getCategoryLabel = (category?: string) => {
    if (!category) return 'Uncategorized';
    const labels: Record<string, string> = {
      social: 'Social',
      community: 'Community',
      groups: 'Groups',
      work_business: 'Work/Business',
    };
    return labels[category] || 'Uncategorized';
  };

  const getCategoryColor = (category?: string) => {
    const colors: Record<string, string> = {
      social: 'bg-pink-100 text-pink-800',
      community: 'bg-blue-100 text-blue-800',
      groups: 'bg-green-100 text-green-800',
      work_business: 'bg-purple-100 text-purple-800',
    };
    return colors[category || ''] || 'bg-gray-100 text-gray-800';
  };

  const handleMessageMember = (memberId: string, memberName: string) => {
    navigate('/social', { 
      state: { 
        startConversation: true, 
        recipientId: memberId,
        recipientName: memberName 
      } 
    });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  if (orgLoading || loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading members...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!activeContext) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>No Active Space</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Please select or create a shared space to view members.
              </p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-4 sm:p-6 md:p-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-2">
                <Users className="h-8 w-8 text-primary" />
                Team Members
              </h1>
              <p className="text-muted-foreground mt-2">
                {activeContext.name} • {filteredMembers.length} {filteredMembers.length === 1 ? 'member' : 'members'}
              </p>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredMembers.map((member) => (
            <Card key={member.user_id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-20 w-20 mb-4">
                    <AvatarImage src={member.avatar_url} alt={member.full_name} />
                    <AvatarFallback className="text-2xl">
                      {member.full_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <h3 className="text-lg font-semibold mb-2">{member.full_name}</h3>

                  <div className="flex items-center gap-2 mb-4">
                    {getRoleIcon(member.role)}
                    <Badge variant={member.role === 'owner' ? 'default' : 'secondary'}>
                      {member.role}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">
                    Joined {new Date(member.joined_at).toLocaleDateString()}
                  </p>

                  <Button
                    onClick={() => handleMessageMember(member.user_id, member.full_name)}
                    className="w-full"
                    variant="outline"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredMembers.length === 0 && (
          <Card className="p-12 text-center">
            <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No members found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'Try a different search term' : 'No members in this space yet'}
            </p>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
