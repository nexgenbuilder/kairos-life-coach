import React, { useState } from 'react';
import { Send, Mic, MicOff, Bot, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'kairos';
  timestamp: Date;
}

interface ChatInterfaceProps {
  className?: string;
}

export function SmartChatInterface({ className }: ChatInterfaceProps) {
  const { session } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hey! I\'m Kairos, your AI life assistant. I can help you manage tasks, plan your day, track expenses, log workouts, and much more. What would you like to work on today?',
      sender: 'kairos',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [aiMode, setAiMode] = useState(false); // Toggle for AI conversation mode

  // Detection patterns for different actions
  const detectActionType = (message: string): 'task' | 'expense' | 'income' | 'fitness' | 'chat' => {
    const lowerMessage = message.toLowerCase();
    
    // Task-related keywords
    if (lowerMessage.includes('create task') || lowerMessage.includes('add task') || 
        lowerMessage.includes('new task') || lowerMessage.includes('make task') ||
        lowerMessage.includes('task called') || lowerMessage.includes('todo')) {
      return 'task';
    }
    
    // Expense-related keywords
    if (lowerMessage.includes('log expense') || lowerMessage.includes('add expense') ||
        lowerMessage.includes('spent') || lowerMessage.includes('cost') ||
        lowerMessage.includes('paid') || lowerMessage.includes('expense')) {
      return 'expense';
    }
    
    // Income-related keywords
    if (lowerMessage.includes('log income') || lowerMessage.includes('add income') ||
        lowerMessage.includes('received') || lowerMessage.includes('earned') ||
        lowerMessage.includes('income') || lowerMessage.includes('payment') ||
        lowerMessage.includes('salary') || lowerMessage.includes('commission')) {
      return 'income';
    }
    
    // Fitness-related keywords
    if (lowerMessage.includes('workout') || lowerMessage.includes('exercise') ||
        lowerMessage.includes('fitness') || lowerMessage.includes('gym') ||
        lowerMessage.includes('ran') || lowerMessage.includes('cycling') ||
        lowerMessage.includes('running') || lowerMessage.includes('jogging') ||
        lowerMessage.includes('swimming') || lowerMessage.includes('lifting') ||
        lowerMessage.includes('weights') || lowerMessage.includes('cardio') ||
        lowerMessage.includes('yoga') || lowerMessage.includes('pilates') ||
        lowerMessage.includes('did pushups') || lowerMessage.includes('did squats') ||
        lowerMessage.includes('log workout') || lowerMessage.includes('track workout')) {
      return 'fitness';
    }
    
    return 'chat';
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      if (aiMode) {
        // Force AI conversation mode - bypass action detection
        const { data, error } = await supabase.functions.invoke('ai-chat', {
          body: { 
            message: currentInput,
            context: window.location.pathname.slice(1) || 'home'
          },
          headers: session ? {
            'Authorization': `Bearer ${session.access_token}`
          } : {}
        });

        if (error) throw error;

        const aiResponseMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.response,
          sender: 'kairos',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, aiResponseMessage]);

        // Add text-to-speech for AI responses
        try {
          const { data: ttsData, error: ttsError } = await supabase.functions.invoke('text-to-speech', {
            body: { 
              text: data.response,
              voice: 'alloy'
            }
          });

          if (!ttsError && ttsData.audioContent) {
            const audio = new Audio(`data:audio/mp3;base64,${ttsData.audioContent}`);
            audio.play().catch(err => console.error('Error playing audio:', err));
          }
        } catch (error) {
          console.error('Error generating speech:', error);
        }

        // Keep AI mode active - don't auto-disable

      } else {
        // Normal mode - detect action type and route accordingly
        const actionType = detectActionType(currentInput);

        if (actionType !== 'chat') {
          // Use our centralized smart-action edge function for structured operations
          const { data, error } = await supabase.functions.invoke('smart-action', {
            body: { 
              message: currentInput,
              actionType: actionType,
              context: window.location.pathname.slice(1) || 'home'
            },
            headers: session ? {
              'Authorization': `Bearer ${session.access_token}`
            } : {}
          });

          if (error) throw error;

          const aiResponseMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: data.response,
            sender: 'kairos',
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, aiResponseMessage]);

          // Refresh Today page if it exists  
          if ((window as any).refreshTodayPage) {
            (window as any).refreshTodayPage();
          }
        } else {
          // Use regular AI chat for general conversation
          const { data, error } = await supabase.functions.invoke('ai-chat', {
            body: { 
              message: currentInput,
              context: window.location.pathname.slice(1) || 'home'
            },
            headers: session ? {
              'Authorization': `Bearer ${session.access_token}`
            } : {}
          });

          if (error) throw error;

          const aiResponseMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: data.response,
            sender: 'kairos',
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, aiResponseMessage]);

          // Refresh Today page if it exists for AI chat responses too
          if ((window as any).refreshTodayPage) {
            (window as any).refreshTodayPage();
          }

          // Add text-to-speech for conversational responses
          try {
            const { data: ttsData, error: ttsError } = await supabase.functions.invoke('text-to-speech', {
              body: { 
                text: data.response,
                voice: 'alloy'
              }
            });

            if (!ttsError && ttsData.audioContent) {
              const audio = new Audio(`data:audio/mp3;base64,${ttsData.audioContent}`);
              audio.play().catch(err => console.error('Error playing audio:', err));
            }
          } catch (error) {
            console.error('Error generating speech:', error);
          }
        }
      }

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to process your request. Please try again.",
        variant: "destructive",
      });
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm having trouble processing your request right now. Please try again in a moment.",
        sender: 'kairos',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleListening = async () => {
    if (!isListening) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        const audioChunks: Blob[] = [];

        mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.onload = async () => {
            const base64Audio = (reader.result as string).split(',')[1];
            
            try {
              const { data, error } = await supabase.functions.invoke('speech-to-text', {
                body: { audio: base64Audio }
              });

              if (error) throw error;
              if (data.text) {
                setInputValue(data.text);
              }
            } catch (error) {
              console.error('Error converting speech to text:', error);
              toast({
                title: "Error",
                description: "Failed to convert speech to text",
                variant: "destructive",
              });
            }
          };
          reader.readAsDataURL(audioBlob);
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsListening(true);

        setTimeout(() => {
          if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            setIsListening(false);
          }
        }, 5000);

      } catch (error) {
        console.error('Error accessing microphone:', error);
        toast({
          title: "Error",
          description: "Could not access microphone",
          variant: "destructive",
        });
      }
    } else {
      setIsListening(false);
    }
  };

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex w-full",
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-3 transition-smooth",
                message.sender === 'user'
                  ? 'bg-primary-gradient text-primary-foreground shadow-glow-soft'
                  : 'bg-chat-gradient border border-border text-foreground'
              )}
            >
              <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* AI Mode Indicator */}
      {aiMode && (
        <div className="px-4 py-2 bg-primary/10 border-t border-primary/20">
          <div className="flex items-center justify-center space-x-2 text-sm text-primary">
            <Sparkles className="h-4 w-4" />
            <span>AI Conversation Mode - Next message will chat with Kairos</span>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-border bg-card/50 backdrop-blur-sm p-4">
        <div className="flex items-center space-x-2 max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={aiMode ? "Chat with Kairos AI..." : "Create tasks, log expenses, track fitness..."}
              className="pr-12 border-border focus:ring-primary"
            />
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setAiMode(!aiMode)}
            className={cn(
              "transition-smooth",
              aiMode ? 'text-primary bg-primary/10 shadow-glow-soft' : 'text-muted-foreground hover:text-primary'
            )}
            title={aiMode ? "Disable AI chat mode" : "Enable AI chat mode"}
          >
            {aiMode ? <Sparkles className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleListening}
            className={cn(
              "transition-smooth",
              isListening ? 'text-primary bg-accent' : 'text-muted-foreground hover:text-primary'
            )}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          
          <Button 
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="bg-primary-gradient hover:opacity-90 transition-smooth shadow-glow-soft"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}