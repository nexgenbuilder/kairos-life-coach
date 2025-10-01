import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/hooks/useOrganization';
import { MentionAutocomplete } from '@/components/chat/MentionAutocomplete';

interface PostFormProps {
  onPostCreated?: () => void;
}

interface Member {
  user_id: string;
  full_name: string;
  avatar_url?: string;
}

export function PostForm({ onPostCreated }: PostFormProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [members, setMembers] = useState<Member[]>([]);
  const { activeContext } = useOrganization();
  const { toast } = useToast();

  useEffect(() => {
    fetchCurrentUser();
    if (activeContext?.id) {
      fetchMembers();
    }
  }, [activeContext?.id]);

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      setCurrentUser(profile);
    }
  };

  const fetchMembers = async () => {
    if (!activeContext?.id) return;

    const { data: membersData } = await supabase
      .from('organization_memberships')
      .select('user_id')
      .eq('organization_id', activeContext.id)
      .eq('is_active', true);

    if (membersData) {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', membersData.map(m => m.user_id));

      if (profilesData) {
        setMembers(profilesData);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setContent(value);

    const lastAtIndex = value.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const textAfterAt = value.slice(lastAtIndex + 1);
      if (!textAfterAt.includes(' ')) {
        setMentionSearch(textAfterAt);
        setShowMentions(true);
        
        const textarea = e.target;
        const { top, left } = textarea.getBoundingClientRect();
        setMentionPosition({ top: top - 200, left });
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const handleMentionSelect = (userId: string, name: string) => {
    const lastAtIndex = content.lastIndexOf('@');
    const newContent = content.slice(0, lastAtIndex) + `@${name} `;
    setContent(newContent);
    setShowMentions(false);
  };

  const handleSubmit = async () => {
    if (!content.trim() || !activeContext?.id) return;

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to post',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    const mentionedUsers = content.match(/@(\w+)/g)?.map(mention => {
      const name = mention.slice(1);
      return members.find(m => m.full_name === name)?.user_id;
    }).filter(Boolean) || [];

    const { error } = await supabase
      .from('space_posts')
      .insert({
        organization_id: activeContext.id,
        user_id: user.id,
        content,
        mentioned_users: mentionedUsers,
      });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to create post',
        variant: 'destructive',
      });
    } else {
      setContent('');
      onPostCreated?.();
      toast({
        title: 'Success',
        description: 'Post created successfully',
      });
    }

    setLoading(false);
  };

  return (
    <>
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Avatar>
              <AvatarImage src={currentUser?.avatar_url} />
              <AvatarFallback>
                {currentUser?.full_name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="Share an update with your team... (Use @ to mention someone)"
                value={content}
                onChange={handleInputChange}
                className="min-h-[100px] resize-none mb-3"
              />
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" disabled>
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Attach Image
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!content.trim() || loading}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Post
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {showMentions && (
        <MentionAutocomplete
          searchTerm={mentionSearch}
          members={members}
          onSelect={handleMentionSelect}
          position={mentionPosition}
        />
      )}
    </>
  );
}
