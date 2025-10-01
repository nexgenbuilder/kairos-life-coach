import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useSound } from '@/hooks/useSound';
import { supabase } from '@/integrations/supabase/client';
import { Send, Loader2, Sparkles, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface SimplifiedAIChatProps {
  engine: 'perplexity' | 'gemini';
  title: string;
  description: string;
}

export function SimplifiedAIChat({ engine, title, description }: SimplifiedAIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { play } = useSound();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const functionName = engine === 'perplexity' ? 'perplexity-search' : 'lovable-chat';
      const body = engine === 'perplexity' 
        ? { message: input }
        : { 
            messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
            model: 'google/gemini-2.5-flash'
          };

      console.log(`[${title}] Sending request to ${functionName}:`, body);

      const { data, error } = await supabase.functions.invoke(functionName, { body });

      console.log(`[${title}] Response:`, { data, error });

      if (error) {
        console.error(`[${title}] Edge function error:`, error);
        throw error;
      }

      if (!data) {
        console.error(`[${title}] No data returned from edge function`);
        throw new Error('No response data received');
      }

      const aiContent = engine === 'perplexity' 
        ? data.response 
        : data.choices?.[0]?.message?.content || data.response || 'No response';
      
      const images = data.choices?.[0]?.message?.images || data.images;
      const actions = data.actions;

      console.log(`[${title}] AI content:`, aiContent);
      console.log(`[${title}] Images:`, images?.length || 0);
      console.log(`[${title}] Actions:`, actions?.length || 0);

      // Build rich message with images and action confirmations
      let fullContent = aiContent;
      
      // Add action confirmations
      if (actions && actions.length > 0) {
        const actionText = actions.map((a: any) => {
          if (a.action === 'task_created') return `✅ Created task: "${a.title}"`;
          if (a.action === 'expense_logged') return `💰 Logged expense: $${a.amount}`;
          if (a.action === 'income_logged') return `💵 Logged income: $${a.amount}`;
          if (a.action === 'workout_logged') return `🏃 Logged workout: ${a.exercise}`;
          if (a.action === 'event_created') return `📅 Created event: "${a.title}"`;
          if (a.action === 'note_created') return `📝 Created note: "${a.title}"`;
          return null;
        }).filter(Boolean).join('\n');
        
        if (actionText) {
          fullContent = `${fullContent}\n\n${actionText}`;
        }
      }

      setMessages(prev => [...prev, { role: 'assistant', content: fullContent }]);
      
      // Display images separately if present
      if (images && images.length > 0) {
        for (const img of images) {
          const imgUrl = img.image_url?.url || img.url;
          if (imgUrl) {
            setMessages(prev => [...prev, { 
              role: 'assistant', 
              content: `![Generated Image](${imgUrl})` 
            }]);
          }
        }
      }
      
      play('success');
    } catch (error: any) {
      console.error(`[${title}] Full error:`, error);
      
      let errorMessage = error.message || 'Failed to get response. Please check console for details.';
      
      // Provide specific feedback for rate limits
      if (error.message?.includes('Rate limit') || error.message?.includes('429')) {
        errorMessage = 'Rate limit reached. Please wait a moment before trying again.';
      }
      
      toast({ 
        title: `${title} Error`, 
        description: errorMessage,
        variant: 'destructive' 
      });
      play('warn');
    } finally {
      setLoading(false);
    }
  };

  const Icon = engine === 'perplexity' ? Search : Sparkles;

  return (
    <div className="flex flex-col h-[600px]">
      <div className="flex items-center gap-2 mb-4 p-3 glass-soft rounded-lg">
        <Icon className="h-5 w-5 text-primary" />
        <div>
          <h3 className="font-medium text-strong">{title}</h3>
          <p className="text-xs text-muted">{description}</p>
        </div>
      </div>

      <ScrollArea ref={scrollRef} className="flex-1 pr-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12 text-muted">
              <Icon className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Start a conversation with {title}</p>
            </div>
          )}
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={cn(
                "p-3 rounded-lg max-w-[85%]",
                msg.role === 'user'
                  ? "ml-auto glass-card text-strong"
                  : "mr-auto glass-soft text-strong"
              )}
            >
              <div className="text-xs font-medium mb-1 opacity-70">
                {msg.role === 'user' ? 'You' : title}
              </div>
              <div className="whitespace-pre-wrap">
                {msg.content.includes('![') ? (
                  // Render markdown images
                  msg.content.split(/!\[([^\]]*)\]\(([^)]+)\)/g).map((part, i) => {
                    if (i % 3 === 0) return <span key={i}>{part}</span>;
                    if (i % 3 === 2) return <img key={i} src={part} alt={msg.content.split(/!\[([^\]]*)\]/)[i]} className="rounded-lg mt-2 max-w-full" />;
                    return null;
                  })
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="mr-auto glass-soft p-3 rounded-lg max-w-[85%]">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="mt-4 flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={`Ask ${title}...`}
          className="min-h-[60px] resize-none glass-soft text-strong"
          disabled={loading}
        />
        <Button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className="glass-card"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
