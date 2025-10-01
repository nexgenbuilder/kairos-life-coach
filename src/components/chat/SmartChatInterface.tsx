import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Bot, Search, Sparkles, Image, X, Inbox, MessageSquare, Paperclip, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import { useChatMode } from '@/hooks/useChatMode';
import { routeMessage } from '@/lib/engineRouter';
import { ModeToggle } from './ModeToggle';
import { ModeStatusChip } from './ModeStatusChip';
import { parseSlashCommand } from '@/utils/slashCommandParser';
import { MentionAutocomplete } from './MentionAutocomplete';
import { InboxView } from './InboxView';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  
  // Generate stable threadId for this chat session
  const threadId = React.useMemo(() => {
    return activeContext?.id ? `thread-${activeContext.id}` : 'default-thread';
  }, [activeContext?.id]);
  
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
  const { state: modeState, toggleMode, checkQuota, incrementUsage, handleError } = useChatMode(threadId);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [activeTab, setActiveTab] = useState<'chat' | 'inbox'>('chat');
  const [attachedFiles, setAttachedFiles] = useState<Array<{ id: string; file_name: string }>>([]);
  const [availableFiles, setAvailableFiles] = useState<Array<{ id: string; file_name: string; mime_type: string }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch organization members and files for @mentions and attachments
  useEffect(() => {
    if (!activeContext) return;

    const fetchMembers = async () => {
      const { data, error } = await supabase
        .rpc('get_organization_members', { org_id: activeContext.id });

      if (!error && data) {
        setMembers(data);
      }
    };

    const fetchAvailableFiles = async () => {
      const { data, error } = await supabase
        .from('file_metadata')
        .select('id, file_name, mime_type')
        .eq('organization_id', activeContext.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setAvailableFiles(data);
      }
    };

    fetchMembers();
    fetchAvailableFiles();
  }, [activeContext]);

  // Handle input changes to detect @mentions
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Detect @ mentions
    const lastAtSymbol = value.lastIndexOf('@');
    if (lastAtSymbol !== -1 && lastAtSymbol === value.length - 1) {
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
    
    if (lowerMessage.includes('create task') || lowerMessage.includes('add task') || 
        lowerMessage.includes('new task') || lowerMessage.includes('make task') ||
        lowerMessage.includes('task called') || lowerMessage.includes('todo')) {
      return 'task';
    }
    
    if (lowerMessage.includes('log expense') || lowerMessage.includes('add expense') ||
        lowerMessage.includes('spent') || lowerMessage.includes('cost') ||
        lowerMessage.includes('paid') || lowerMessage.includes('expense')) {
      return 'expense';
    }
    
    if (lowerMessage.includes('log income') || lowerMessage.includes('add income') ||
        lowerMessage.includes('received') || lowerMessage.includes('earned') ||
        lowerMessage.includes('income') || lowerMessage.includes('payment') ||
        lowerMessage.includes('salary') || lowerMessage.includes('commission')) {
      return 'income';
    }
    
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

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image must be less than 10MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async () => {
    if ((!inputValue.trim() && !selectedImage && attachedFiles.length === 0) || isLoading) return;

    // Check if message contains @mentions (peer-to-peer message)
    const mentionPattern = /@(\w+)/g;
    const mentions = [...inputValue.matchAll(mentionPattern)];
    
    if (mentions.length > 0 && activeContext) {
      await handleUserMessage(inputValue, mentions, attachedFiles.map(f => f.id));
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue || (selectedImage ? 'Uploaded an image' : attachedFiles.length > 0 ? `Attached ${attachedFiles.length} file(s)` : ''),
      sender: 'user',
      timestamp: new Date(),
      imageUrl: selectedImage || undefined
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    const currentImage = selectedImage;
    setInputValue('');
    setSelectedImage(null);
    setAttachedFiles([]);
    setIsLoading(true);

    try {
      // If image is provided, try to process it as a receipt
      if (currentImage) {
        try {
          console.log('Processing receipt image...');
          const base64Data = currentImage.split(',')[1];
          const { data: receiptData, error: receiptError } = await supabase.functions.invoke('process-receipt', {
            body: { image: base64Data }
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

      if (!currentInput.trim()) {
        setIsLoading(false);
        return;
      }

      // Route message through centralized engine router
      const result = await routeMessage({
        mode: modeState.activeMode,
        text: currentInput,
        context: window.location.pathname.slice(1) || 'home',
        session,
        onQuotaCheck: checkQuota,
        onIncrementUsage: incrementUsage,
        onFallback: (reason) => {
          toast({
            title: "Switched to General Mode",
            description: reason,
            variant: "default"
          });
        }
      });

      // Show fallback banner if needed
      if (result.fellBackToGeneral && result.fallbackReason) {
        toast({
          title: "Using General Mode",
          description: result.fallbackReason,
          variant: "default"
        });
      }

      const aiResponseMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: result.content,
        sender: 'kairos',
        timestamp: new Date(),
        source: result.source
      };
      
      setMessages(prev => [...prev, aiResponseMessage]);

      if ((window as any).refreshTodayPage) {
        (window as any).refreshTodayPage();
      }
      if ((window as any).refreshDashboard) {
        (window as any).refreshDashboard();
      }

      // TTS for Gemini and General modes
      if (modeState.activeMode === 'gemini' || modeState.activeMode === 'general') {
        try {
          const { data: ttsData, error: ttsError } = await supabase.functions.invoke('text-to-speech', {
            body: { 
              text: result.content,
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

  const handleUserMessage = async (content: string, mentions: RegExpMatchArray[], fileIds: string[] = []) => {
    if (!activeContext || !session?.user) return;

    try {
      setIsLoading(true);

      const mentionedNames = mentions.map(m => m[1]);
      const isAllMention = mentionedNames.includes('all');
      
      let recipientIds: string[] = [];
      
      if (isAllMention) {
        const { data: allMembers } = await supabase
          .rpc('get_organization_members', { org_id: activeContext.id });
        recipientIds = allMembers?.map((m: Member) => m.user_id) || [];
      } else {
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

      const { error } = await supabase
        .from('user_messages')
        .insert({
          sender_id: session.user.id,
          content: content,
          recipients: recipientIds,
          organization_id: activeContext.id,
          is_all_mention: isAllMention,
          attached_files: fileIds.length > 0 ? fileIds : null,
        });

      if (error) throw error;

      const confirmMessage: Message = {
        id: Date.now().toString(),
        content: `Message sent to ${isAllMention ? '@all' : mentionedNames.map(n => '@' + n).join(', ')}${fileIds.length > 0 ? ` with ${fileIds.length} file(s) attached` : ''}`,
        sender: 'kairos',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, confirmMessage]);

      toast({
        title: "Message sent",
        description: `Delivered to ${recipientIds.length} recipient${recipientIds.length > 1 ? 's' : ''}`,
      });

      setInputValue('');
      setAttachedFiles([]);
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
        <TabsList className="w-full grid grid-cols-2 mb-4">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            AI Chat
          </TabsTrigger>
          <TabsTrigger value="inbox" className="flex items-center gap-2">
            <Inbox className="h-4 w-4" />
            Inbox
          </TabsTrigger>
        </TabsList>
        
        {activeTab === 'chat' && (
          <div className="flex items-center justify-between px-4 mb-3">
            <ModeToggle
              activeMode={modeState.activeMode}
              onToggle={toggleMode}
              allowed={modeState.allowed}
              quotas={modeState.quotas}
            />
            <ModeStatusChip mode={modeState.activeMode} />
          </div>
        )}

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
                    "max-w-[85%] sm:max-w-[80%] rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 transition-smooth",
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

          {/* Attached Files Display */}
          {attachedFiles.length > 0 && (
            <div className="border-t p-3 bg-muted/30">
              <div className="flex flex-wrap gap-2">
                {attachedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-2 bg-background px-3 py-1.5 rounded-md border text-sm"
                  >
                    <FileText className="h-3 w-3" />
                    <span className="max-w-[150px] truncate">{file.file_name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                      onClick={() => setAttachedFiles(attachedFiles.filter(f => f.id !== file.id))}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-border">
            {showMentions && activeContext && (
              <MentionAutocomplete
                searchTerm={mentionSearch}
                members={members}
                onSelect={handleMentionSelect}
                position={mentionPosition}
              />
            )}
            
            {/* Image Preview */}
            {selectedImage && (
              <div className="p-3 border-b border-border">
                <div className="relative inline-block">
                  <img 
                    src={selectedImage} 
                    alt="Selected" 
                    className="max-h-24 rounded-lg"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-destructive hover:bg-destructive/90"
                    onClick={() => setSelectedImage(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Action Buttons Row - Mobile Optimized */}
            <div className="p-3 flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={isLoading || !activeContext}
                    className="shrink-0 h-11 w-11 sm:h-10 sm:w-10"
                    title="Attach files from Cloud Storage"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2">
                      <p className="text-sm font-medium mb-2">Attach files from Cloud Storage</p>
                      {availableFiles.length > 0 ? (
                        availableFiles.map((file) => (
                          <Button
                            key={file.id}
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => {
                              if (!attachedFiles.find(f => f.id === file.id)) {
                                setAttachedFiles([...attachedFiles, file]);
                              }
                            }}
                            disabled={attachedFiles.some(f => f.id === file.id)}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            <span className="truncate">{file.file_name}</span>
                          </Button>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No files available. Upload files in Cloud Storage first.
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>
              
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
                className="shrink-0 h-11 w-11 sm:h-10 sm:w-10"
                title="Upload receipt image"
              >
                <Image className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={toggleListening}
                disabled={isLoading}
                className={cn("shrink-0 h-11 w-11 sm:h-10 sm:w-10", isListening && "bg-destructive text-destructive-foreground")}
                title="Voice input"
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            </div>

            {/* Input Field Row - Full Width */}
            <div className="px-3 pb-3 flex items-end gap-2">
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
                className="flex-1 min-h-[48px] h-auto py-3 px-4"
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={isLoading || (!inputValue.trim() && !selectedImage && attachedFiles.length === 0)}
                className="shrink-0 h-12 w-12"
                size="icon"
              >
                {isLoading ? (
                  <Bot className="h-5 w-5 animate-pulse" />
                ) : (
                  <Send className="h-5 w-5" />
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
