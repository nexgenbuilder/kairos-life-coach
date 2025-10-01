import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useOrganization } from '@/hooks/useOrganization';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PostForm } from '@/components/feed/PostForm';
import { PostCard } from '@/components/feed/PostCard';
import { Rss, Pin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Post {
  id: string;
  content: string;
  user_id: string;
  organization_id: string;
  created_at: string;
  is_pinned: boolean;
  attachments?: any;
}

export default function FeedPage() {
  const { activeContext, loading: orgLoading, isAdmin } = useOrganization();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (activeContext?.id) {
      fetchPosts();
      setupRealtimeSubscription();
    }
  }, [activeContext?.id]);

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setCurrentUserId(user.id);
  };

  const fetchPosts = async () => {
    if (!activeContext?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('space_posts')
        .select('*')
        .eq('organization_id', activeContext.id)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load posts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!activeContext?.id) return;

    const channel = supabase
      .channel(`feed-${activeContext.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'space_posts',
          filter: `organization_id=eq.${activeContext.id}`,
        },
        () => {
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  if (orgLoading || loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading feed...</p>
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
                Please select or create a shared space to view the feed.
              </p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto max-w-2xl p-4 sm:p-6 md:p-8">
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-2 mb-2">
            <Rss className="h-8 w-8 text-primary" />
            Feed
          </h1>
          <p className="text-muted-foreground">{activeContext.name}</p>
        </div>

        <PostForm onPostCreated={fetchPosts} />

        <div className="space-y-4">
          {posts.length === 0 ? (
            <Card className="p-12 text-center">
              <Rss className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
              <p className="text-muted-foreground">
                Be the first to share something with your team!
              </p>
            </Card>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={currentUserId}
                isAdmin={isAdmin()}
                onDelete={fetchPosts}
              />
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
