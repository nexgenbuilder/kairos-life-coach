import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface InboxMessage {
  id: string;
  message_id: string;
  is_read: boolean;
  created_at: string;
  message: {
    id: string;
    content: string;
    created_at: string;
    sender_id: string;
    is_all_mention: boolean;
    sender: {
      full_name: string;
      avatar_url?: string;
    };
  };
}

interface InboxViewProps {
  onMessageClick?: (messageId: string) => void;
}

export function InboxView({ onMessageClick }: InboxViewProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchMessages = async () => {
      setLoading(true);
      
      // Fetch inbox entries with message data
      const { data: inboxData, error: inboxError } = await supabase
        .from('message_inbox')
        .select('id, message_id, is_read, created_at')
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (inboxError) {
        console.error('Error fetching inbox:', inboxError);
        setLoading(false);
        return;
      }

      // Fetch full message details with sender profiles
      const messageIds = inboxData.map(item => item.message_id);
      const { data: messagesData, error: messagesError } = await supabase
        .from('user_messages')
        .select('id, content, created_at, sender_id, is_all_mention')
        .in('id', messageIds);

      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
        setLoading(false);
        return;
      }

      // Fetch sender profiles
      const senderIds = messagesData.map(msg => msg.sender_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', senderIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      // Combine the data
      const profileMap = new Map(
        (profilesData || []).map(p => [p.user_id, p])
      );
      
      const messageMap = new Map(
        (messagesData || []).map(m => [
          m.id, 
          {
            ...m,
            sender: profileMap.get(m.sender_id) || { full_name: 'Unknown', avatar_url: undefined }
          }
        ])
      );

      const combinedData = inboxData.map(inbox => ({
        ...inbox,
        message: messageMap.get(inbox.message_id)!
      }));

      setMessages(combinedData);
      setLoading(false);
    };

    fetchMessages();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('inbox-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'message_inbox',
          filter: `recipient_id=eq.${user.id}`
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAsRead = async (inboxId: string, messageId: string) => {
    const { error } = await supabase
      .from('message_inbox')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', inboxId);

    if (!error) {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === inboxId ? { ...msg, is_read: true } : msg
        )
      );
      onMessageClick?.(messageId);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <p className="text-muted-foreground">No messages yet</p>
        <p className="text-sm text-muted-foreground mt-2">
          Use @mentions in chat to message team members
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-2 p-4">
        {messages.map((inbox) => {
          const msg = inbox.message;
          const sender = Array.isArray(msg.sender) ? msg.sender[0] : msg.sender;
          
          return (
            <button
              key={inbox.id}
              onClick={() => markAsRead(inbox.id, msg.id)}
              className={cn(
                "w-full text-left p-3 rounded-lg border transition-colors",
                inbox.is_read 
                  ? "bg-background hover:bg-accent/50" 
                  : "bg-primary/5 border-primary/20 hover:bg-primary/10"
              )}
            >
              <div className="flex items-start space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={sender?.avatar_url} />
                  <AvatarFallback>
                    {sender?.full_name?.charAt(0).toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">
                      {sender?.full_name || 'Unknown User'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  {msg.is_all_mention && (
                    <Badge variant="secondary" className="mb-1 text-xs">
                      @all
                    </Badge>
                  )}
                  <p className="text-sm text-foreground line-clamp-2">
                    {msg.content}
                  </p>
                  {!inbox.is_read && (
                    <Badge variant="default" className="mt-2 text-xs">
                      New
                    </Badge>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
}
