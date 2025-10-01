import React, { useState, useRef } from 'react';
import { Send, Mic, MicOff, Bot, Search, Sparkles, Image, X } from 'lucide-react';
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
  source?: string; // Track which AI model responded
  imageUrl?: string; // For displaying images in chat
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
  const [routingMode, setRoutingMode] = useState<'auto' | 'gpt5' | 'search'>('auto'); // Manual routing control
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image must be less than 10MB",
        variant: "destructive",
      });
      return;
    }

    // Read file as base64
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async () => {
    if ((!inputValue.trim() && !selectedImage) || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue || (selectedImage ? 'Uploaded an image' : ''),
      sender: 'user',
      timestamp: new Date(),
      imageUrl: selectedImage || undefined
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    const currentImage = selectedImage;
    setInputValue('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      // If image is provided, try to process it as a receipt
      if (currentImage) {
        try {
          console.log('Processing receipt image...');
          // Strip the data URL prefix (data:image/jpeg;base64,) before sending
          const base64Data = currentImage.split(',')[1];
          const { data: receiptData, error: receiptError } = await supabase.functions.invoke('process-receipt', {
            body: {
              image: base64Data
            }
          });

          console.log('Receipt processing response:', { data: receiptData, error: receiptError });

          if (receiptError) throw receiptError;

          if (!receiptData || !receiptData.items || receiptData.items.length === 0) {
            throw new Error('No items extracted from receipt');
          }

          const successMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: `Great! I processed your receipt and added ${receiptData.itemsAdded} expense items:\n\n${receiptData.items.map((item: any) => `• ${item.description}: $${item.amount}`).join('\n')}\n\nTotal: $${receiptData.items.reduce((sum: number, item: any) => sum + item.amount, 0).toFixed(2)}`,
            sender: 'kairos',
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, successMessage]);

          toast({
            title: "Receipt Processed",
            description: `Successfully added ${receiptData.itemsAdded} expense items`,
          });

          // Refresh Today page and Dashboard if they exist
          if ((window as any).refreshTodayPage) {
            (window as any).refreshTodayPage();
          }
          if ((window as any).refreshDashboard) {
            (window as any).refreshDashboard();
          }

          setIsLoading(false);
          return;
        } catch (error) {
          console.error('Receipt processing error:', error);
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: `Sorry, I couldn't process that receipt. ${error instanceof Error ? error.message : 'Please try again with a clearer image.'}`,
            sender: 'kairos',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, errorMessage]);
          
          toast({
            title: "Receipt Processing Failed",
            description: error instanceof Error ? error.message : "Could not process the receipt image. Please try again.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
      }

      // Continue with existing text-based message handling
      if (!currentInput.trim()) {
        setIsLoading(false);
        return;
      }

      if (routingMode === 'search') {
        // Force Perplexity for real-time search
        const { data, error } = await supabase.functions.invoke('perplexity-search', {
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
          timestamp: new Date(),
          source: 'perplexity'
        };
        
        setMessages(prev => [...prev, aiResponseMessage]);

      } else if (routingMode === 'gpt5') {
        // Force Lovable AI for reasoning/conversation
        const { data, error } = await supabase.functions.invoke('lovable-chat', {
          body: { 
            message: currentInput,
            context: window.location.pathname.slice(1) || 'home',
            forceGPT5: true
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
          timestamp: new Date(),
          source: 'lovable-ai'
        };
        
        setMessages(prev => [...prev, aiResponseMessage]);

        // Add text-to-speech for GPT-5 responses
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

      } else {
        // Auto mode - keep existing logic
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

          // Refresh Today page and Dashboard if they exist  
          if ((window as any).refreshTodayPage) {
            (window as any).refreshTodayPage();
          }
          if ((window as any).refreshDashboard) {
            (window as any).refreshDashboard();
          }
        } else {
          // Use Lovable AI for general conversation
          const { data, error } = await supabase.functions.invoke('lovable-chat', {
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
            timestamp: new Date(),
            source: data.source || 'lovable-ai'
          };
          
          setMessages(prev => [...prev, aiResponseMessage]);

          // Refresh Today page and Dashboard if they exist for AI chat responses too
          if ((window as any).refreshTodayPage) {
            (window as any).refreshTodayPage();
          }
          if ((window as any).refreshDashboard) {
            (window as any).refreshDashboard();
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

      // Reset routing mode to auto after sending (unless it's a specific mode selection)
      if (routingMode !== 'auto') {
        setTimeout(() => setRoutingMode('auto'), 100);
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
              {message.imageUrl && (
                <img 
                  src={message.imageUrl} 
                  alt="Uploaded receipt" 
                  className="max-w-full rounded-lg mb-2"
                  style={{ maxHeight: '200px' }}
                />
              )}
              <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
              {message.sender === 'kairos' && message.source && (
                <div className="mt-2 flex justify-end">
                  <span className={cn(
                    "text-xs px-2 py-1 rounded-full font-medium",
                    message.source === 'perplexity' 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' 
                      : 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
                  )}>
                    {message.source === 'perplexity' ? '🌐 Live Search' : '✨ Lovable AI'}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Routing Mode Indicator */}
      {routingMode !== 'auto' && (
        <div className="px-4 py-2 bg-primary/10 border-t border-primary/20">
          <div className="flex items-center justify-center space-x-2 text-sm text-primary">
            {routingMode === 'gpt5' ? <Sparkles className="h-4 w-4" /> : <Search className="h-4 w-4" />}
            <span>
              {routingMode === 'gpt5' ? 'Lovable AI Mode - Powered by Gemini' : 'Search Mode - Real-time web search capabilities'}
            </span>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-border bg-card/50 backdrop-blur-sm p-4">
        {selectedImage && (
          <div className="max-w-4xl mx-auto mb-2 relative inline-block">
            <img 
              src={selectedImage} 
              alt="Selected receipt" 
              className="max-h-32 rounded-lg border border-border"
            />
            <Button
              size="icon"
              variant="destructive"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        <div className="flex items-center space-x-2 max-w-4xl mx-auto">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            className="text-muted-foreground hover:text-primary"
            title="Upload receipt image"
          >
            <Image className="h-4 w-4" />
          </Button>

          <div className="flex-1 relative">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              placeholder={selectedImage ? "Add a note (optional)" : routingMode === 'gpt5' ? "Chat with Lovable AI..." : routingMode === 'search' ? "Search the web..." : "Create tasks, log expenses, track fitness..."}
              className="pr-12 border-border focus:ring-primary"
            />
          </div>
          
          {/* Lovable AI Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setRoutingMode(routingMode === 'gpt5' ? 'auto' : 'gpt5')}
            className={cn(
              "transition-smooth",
              routingMode === 'gpt5' ? 'text-purple-600 bg-purple-100 dark:bg-purple-900/50 shadow-glow-soft' : 'text-muted-foreground hover:text-purple-600'
            )}
            title="Lovable AI - Powered by Gemini"
          >
            <Sparkles className="h-4 w-4" />
          </Button>

          {/* Perplexity Search Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setRoutingMode(routingMode === 'search' ? 'auto' : 'search')}
            className={cn(
              "transition-smooth",
              routingMode === 'search' ? 'text-green-600 bg-green-100 dark:bg-green-900/50 shadow-glow-soft' : 'text-muted-foreground hover:text-green-600'
            )}
            title="Perplexity Search - Real-time web search"
          >
            <Search className="h-4 w-4" />
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
            disabled={(!inputValue.trim() && !selectedImage) || isLoading}
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