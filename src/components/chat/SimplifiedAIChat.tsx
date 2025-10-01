import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface SimplifiedAIChatProps {
  mode: 'perplexity' | 'gemini';
}

export function SimplifiedAIChat({ mode }: SimplifiedAIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const functionName = mode === 'perplexity' ? 'perplexity-search' : 'lovable-chat';
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: { message: userMessage }
      });

      if (error) throw error;

      const assistantMessage = mode === 'perplexity' 
        ? data?.content || data?.message || 'No response'
        : data?.response || data?.content || 'No response';

      setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
    } catch (error: any) {
      console.error('AI chat error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to get AI response',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px]">
      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-soft py-8">
              <p className="text-sm">
                {mode === 'perplexity' 
                  ? 'Ask anything and get real-time web answers'
                  : 'Chat with Google Gemini AI'}
              </p>
            </div>
          )}
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-primary/20 ml-8'
                  : 'bg-muted/30 mr-8'
              }`}
            >
              <div className="text-xs font-medium mb-1 text-muted">
                {msg.role === 'user' ? 'You' : mode === 'perplexity' ? 'Perplexity' : 'Gemini'}
              </div>
              <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-soft text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Thinking...</span>
            </div>
          )}
        </div>
      </ScrollArea>
      
      <div className="mt-4 flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === 'perplexity' ? 'Ask a question...' : 'Chat with Gemini...'}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          className="min-h-[60px] resize-none"
          disabled={loading}
        />
        <Button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          size="icon"
          className="h-[60px] w-[60px]"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </Button>
      </div>
    </div>
  );
}
