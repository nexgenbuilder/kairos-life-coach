import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Bot, Search, Sparkles, Image, X, Inbox, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import { MentionAutocomplete } from './MentionAutocomplete';
import { InboxView } from './InboxView';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'kairos';
  timestamp: Date;
  source?: string;
  imageUrl?: string;
}

interface Member {
  user_id: string;
  full_name: string;
  avatar_url?: string;
}

interface ChatInterfaceProps {
  className?: string;
}

export function SmartChatInterface({ className }: ChatInterfaceProps) {
  const { session } = useAuth();
  const { toast } = useToast();
  const { activeContext } = useOrganization();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hey! I'm Kairos, your AI life assistant. I can help you manage tasks, plan your day, track expenses, log workouts, and much more. You can also use @mentions to message team members. What would you like to work on today?",
      sender: 'kairos',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [routingMode, setRoutingMode] = useState<'auto' | 'gpt5' | 'search'>('auto');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [activeTab, setActiveTab] = useState<'chat' | 'inbox'>('chat');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch organization members for @mentions
  useEffect(() => {
    if (!activeContext) return;

    const fetchMembers = async () => {
      const { data, error } = await supabase
        .rpc('get_organization_members', { org_id: activeContext.id });

      if (!error && data) {
        setMembers(data);
      }
    };

    fetchMembers();
  }, [activeContext]);

  // Handle input changes to detect @mentions
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Detect @ mentions
    const lastAtSymbol = value.lastIndexOf('@');
    if (lastAtSymbol !== -1 && lastAtSymbol === value.length - 1) {
      // Just typed @
      setShowMentions(true);
      setMentionSearch('');
      updateMentionPosition();
    } else if (lastAtSymbol !== -1) {
      const searchTerm = value.substring(lastAtSymbol + 1);
      if (!searchTerm.includes(' ')) {
        setShowMentions(true);
        setMentionSearch(searchTerm);
        updateMentionPosition();
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const updateMentionPosition = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setMentionPosition({
        top: window.innerHeight - rect.top + 10,
        left: rect.left
      });
    }
  };

  const handleMentionSelect = (userId: string, name: string) => {
    const lastAtSymbol = inputValue.lastIndexOf('@');
    const beforeMention = inputValue.substring(0, lastAtSymbol);
    setInputValue(`${beforeMention}@${name} `);
    setShowMentions(false);
    inputRef.current?.focus();
  };

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

    // Check if message contains @mentions (peer-to-peer message)
    const mentionPattern = /@(\w+)/g;
    const mentions = [...inputValue.matchAll(mentionPattern)];
    
    if (mentions.length > 0 && activeContext) {
      // This is a user-to-user message
      await handleUserMessage(inputValue, mentions);
      return;
    }

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

  const handleUserMessage = async (content: string, mentions: RegExpMatchArray[]) => {
    if (!activeContext || !session?.user) return;

    try {
      setIsLoading(true);

      // Parse mentions
      const mentionedNames = mentions.map(m => m[1]);
      const isAllMention = mentionedNames.includes('all');
      
      let recipientIds: string[] = [];
      
      if (isAllMention) {
        // Send to all members in the organization
        const { data: allMembers } = await supabase
          .rpc('get_organization_members', { org_id: activeContext.id });
        recipientIds = allMembers?.map((m: Member) => m.user_id) || [];
      } else {
        // Send to specific mentioned users
        recipientIds = members
          .filter(m => mentionedNames.includes(m.full_name))
          .map(m => m.user_id);
      }

      if (recipientIds.length === 0) {
        toast({
          title: "No recipients found",
          description: "Could not find the mentioned users",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Create the message
      const { error } = await supabase
        .from('user_messages')
        .insert({
          sender_id: session.user.id,
          organization_id: activeContext.id,
          content,
          recipients: recipientIds,
          is_all_mention: isAllMention
        });

      if (error) throw error;

      // Add confirmation message to chat
      const confirmMessage: Message = {
        id: Date.now().toString(),
        content: `Message sent to ${isAllMention ? '@all' : mentionedNames.map(n => '@' + n).join(', ')}`,
        sender: 'kairos',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, confirmMessage]);

      toast({
        title: "Message sent",
        description: `Delivered to ${recipientIds.length} recipient${recipientIds.length > 1 ? 's' : ''}`,
      });

      setInputValue('');
    } catch (error) {
      console.error('Error sending user message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
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
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'chat' | 'inbox')} className="flex-1 flex flex-col">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            AI Chat
          </TabsTrigger>
          <TabsTrigger value="inbox" className="flex items-center gap-2">
            <Inbox className="h-4 w-4" />
            Inbox
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="flex-1 flex flex-col mt-0">
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
      <div className="p-4 border-t border-border">
        {showMentions && activeContext && (
          <MentionAutocomplete
            searchTerm={mentionSearch}
            members={members}
            onSelect={handleMentionSelect}
            position={mentionPosition}
          />
        )}
        {selectedImage && (
          <div className="mb-2 relative inline-block">
            <img 
              src={selectedImage} 
              alt="Selected" 
              className="max-h-20 rounded-lg"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive hover:bg-destructive/90"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        <div className="flex space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleImageSelect}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="shrink-0"
          >
            <Image className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleListening}
            disabled={isLoading}
            className={cn("shrink-0", isListening && "bg-destructive text-destructive-foreground")}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          <Button
            variant={routingMode === 'gpt5' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setRoutingMode(routingMode === 'gpt5' ? 'auto' : 'gpt5')}
            disabled={isLoading}
            className="shrink-0"
            title="GPT-5 Mode"
          >
            <Sparkles className="h-4 w-4" />
          </Button>
          <Button
            variant={routingMode === 'search' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setRoutingMode(routingMode === 'search' ? 'auto' : 'search')}
            disabled={isLoading}
            className="shrink-0"
            title="Web Search Mode"
          >
            <Search className="h-4 w-4" />
          </Button>
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !showMentions) {
                handleSendMessage();
              }
            }}
            placeholder={activeContext ? "Message AI or @mention teammates..." : "Ask Kairos anything..."}
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={isLoading || (!inputValue.trim() && !selectedImage)}
            className="shrink-0"
          >
            {isLoading ? (
              <Bot className="h-4 w-4 animate-pulse" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
        </TabsContent>

        <TabsContent value="inbox" className="flex-1 mt-0">
          <InboxView />
        </TabsContent>
      </Tabs>
    </div>
  );
}