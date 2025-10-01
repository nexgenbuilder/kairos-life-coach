import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Pin, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CommentSection } from './CommentSection';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
  post: {
    id: string;
    content: string;
    user_id: string;
    created_at: string;
    is_pinned: boolean;
    attachments?: any[];
  };
  currentUserId: string;
  isAdmin: boolean;
  onDelete?: () => void;
}

export function PostCard({ post, currentUserId, isAdmin, onDelete }: PostCardProps) {
  const [author, setAuthor] = useState<any>(null);
  const [likesCount, setLikesCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentsCount, setCommentsCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchAuthor();
    fetchLikes();
    fetchCommentsCount();
  }, [post.id]);

  const fetchAuthor = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('user_id', post.user_id)
      .single();
    
    if (data) setAuthor(data);
  };

  const fetchLikes = async () => {
    const { data, count } = await supabase
      .from('post_interactions')
      .select('*', { count: 'exact' })
      .eq('post_id', post.id)
      .eq('interaction_type', 'like');

    if (count !== null) setLikesCount(count);
    if (data) {
      setHasLiked(data.some(like => like.user_id === currentUserId));
    }
  };

  const fetchCommentsCount = async () => {
    const { count } = await supabase
      .from('post_comments')
      .select('*', { count: 'exact' })
      .eq('post_id', post.id);

    if (count !== null) setCommentsCount(count);
  };

  const handleLike = async () => {
    if (hasLiked) {
      await supabase
        .from('post_interactions')
        .delete()
        .eq('post_id', post.id)
        .eq('user_id', currentUserId)
        .eq('interaction_type', 'like');
      
      setHasLiked(false);
      setLikesCount(prev => prev - 1);
    } else {
      await supabase
        .from('post_interactions')
        .insert({
          post_id: post.id,
          user_id: currentUserId,
          interaction_type: 'like',
        });
      
      setHasLiked(true);
      setLikesCount(prev => prev + 1);
    }
  };

  const handleDelete = async () => {
    const { error } = await supabase
      .from('space_posts')
      .delete()
      .eq('id', post.id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete post',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Post deleted successfully',
      });
      onDelete?.();
    }
  };

  const renderContent = () => {
    const mentionRegex = /@(\w+)/g;
    const parts = post.content.split(mentionRegex);
    
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return (
          <span key={index} className="text-primary font-medium">
            @{part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={author?.avatar_url} />
              <AvatarFallback>
                {author?.full_name?.charAt(0).toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{author?.full_name || 'Loading...'}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {post.is_pinned && <Pin className="h-4 w-4 text-primary" />}
            {(currentUserId === post.user_id || isAdmin) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm whitespace-pre-wrap">{renderContent()}</p>

        {post.attachments && post.attachments.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {post.attachments.map((attachment: any, index: number) => (
              <img
                key={index}
                src={attachment.url}
                alt="Attachment"
                className="rounded-lg w-full object-cover"
              />
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 pt-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={hasLiked ? 'text-red-500' : ''}
          >
            <Heart className={`h-4 w-4 mr-1 ${hasLiked ? 'fill-current' : ''}`} />
            <span className="text-xs">{likesCount}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            <span className="text-xs">{commentsCount}</span>
          </Button>
        </div>

        {showComments && (
          <CommentSection
            postId={post.id}
            currentUserId={currentUserId}
            onCommentAdded={fetchCommentsCount}
          />
        )}
      </CardContent>
    </Card>
  );
}
