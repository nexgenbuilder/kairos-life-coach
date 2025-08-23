import React, { useState } from 'react';
import { Send, Mic, MicOff, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
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

export function N8nChatInterface({ className }: ChatInterfaceProps) {
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
  
  // n8n webhook URLs - stored in localStorage
  const [n8nTaskWebhook, setN8nTaskWebhook] = useState(() => 
    localStorage.getItem('n8n_task_webhook') || ''
  );
  const [n8nExpenseWebhook, setN8nExpenseWebhook] = useState(() => 
    localStorage.getItem('n8n_expense_webhook') || ''
  );
  const [n8nFitnessWebhook, setN8nFitnessWebhook] = useState(() => 
    localStorage.getItem('n8n_fitness_webhook') || ''
  );

  // Save webhook URLs to localStorage
  const saveWebhookUrls = () => {
    localStorage.setItem('n8n_task_webhook', n8nTaskWebhook);
    localStorage.setItem('n8n_expense_webhook', n8nExpenseWebhook);
    localStorage.setItem('n8n_fitness_webhook', n8nFitnessWebhook);
    toast({
      title: "Success",
      description: "n8n webhook URLs saved successfully",
    });
  };

  // Detection patterns for different actions
  const detectActionType = (message: string): 'task' | 'expense' | 'fitness' | 'chat' => {
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
    
    // Fitness-related keywords
    if (lowerMessage.includes('workout') || lowerMessage.includes('exercise') ||
        lowerMessage.includes('fitness') || lowerMessage.includes('gym') ||
        lowerMessage.includes('ran') || lowerMessage.includes('cycling')) {
      return 'fitness';
    }
    
    return 'chat';
  };

  // Extract structured data from natural language
  const extractTaskData = (message: string) => {
    const titleMatch = message.match(/(?:create|add|new|make)\s+(?:a\s+)?(?:new\s+)?task\s+(?:called\s+|named\s+)?["\']?([^"']+?)["\']?(?:\s|$)/i);
    const priorityMatch = message.match(/(?:high|medium|low)\s+priority/i);
    
    return {
      title: titleMatch ? titleMatch[1].trim() : 'New Task',
      priority: priorityMatch ? priorityMatch[0].split(' ')[0].toLowerCase() : 'medium',
      user_id: session?.user?.id
    };
  };

  const extractExpenseData = (message: string) => {
    const amountMatch = message.match(/\$?(\d+(?:\.\d{2})?)/);
    const categoryMatch = message.match(/(?:for|on|category)\s+([a-zA-Z\s]+)/i);
    
    return {
      amount: amountMatch ? parseFloat(amountMatch[1]) : 0,
      category: categoryMatch ? categoryMatch[1].trim() : 'Other',
      description: message,
      user_id: session?.user?.id
    };
  };

  const extractFitnessData = (message: string) => {
    const exerciseMatch = message.match(/(?:did|completed|finished)\s+([^,]+)/i);
    const durationMatch = message.match(/(\d+)\s+(?:minutes?|mins?|hours?|hrs?)/i);
    
    return {
      exercise: exerciseMatch ? exerciseMatch[1].trim() : message,
      duration: durationMatch ? parseInt(durationMatch[1]) : null,
      user_id: session?.user?.id
    };
  };

  // Send to n8n webhook
  const sendToN8n = async (webhookUrl: string, data: any) => {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending to n8n:', error);
      throw error;
    }
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
      const actionType = detectActionType(currentInput);
      let aiResponse = '';

      if (actionType === 'task' && n8nTaskWebhook) {
        // Handle task creation via n8n
        const taskData = extractTaskData(currentInput);
        await sendToN8n(n8nTaskWebhook, taskData);
        aiResponse = `Perfect! I've created the task "${taskData.title}" with ${taskData.priority} priority. You can view it in your tasks list.`;
      } else if (actionType === 'expense' && n8nExpenseWebhook) {
        // Handle expense logging via n8n
        const expenseData = extractExpenseData(currentInput);
        await sendToN8n(n8nExpenseWebhook, expenseData);
        aiResponse = `Great! I've logged your expense of $${expenseData.amount} in the ${expenseData.category} category.`;
      } else if (actionType === 'fitness' && n8nFitnessWebhook) {
        // Handle fitness logging via n8n
        const fitnessData = extractFitnessData(currentInput);
        await sendToN8n(n8nFitnessWebhook, fitnessData);
        aiResponse = `Awesome! I've logged your workout: ${fitnessData.exercise}${fitnessData.duration ? ` for ${fitnessData.duration} minutes` : ''}.`;
      } else {
        // Fall back to OpenAI for general conversation
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
        aiResponse = data.response;

        // If it's an action but no webhook is configured, inform the user
        if (actionType !== 'chat') {
          aiResponse += `\n\nNote: To enable automatic ${actionType} logging, please configure your n8n webhook URL in the settings.`;
        }
      }

      const aiResponseMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: 'kairos',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiResponseMessage]);

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

      {/* Input Area */}
      <div className="border-t border-border bg-card/50 backdrop-blur-sm p-4">
        <div className="flex items-center space-x-2 max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask Kairos anything or create tasks, log expenses, track fitness..."
              className="pr-12 border-border focus:ring-primary"
            />
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-primary"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>n8n Webhook Configuration</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="task-webhook">Task Creation Webhook</Label>
                  <Input
                    id="task-webhook"
                    value={n8nTaskWebhook}
                    onChange={(e) => setN8nTaskWebhook(e.target.value)}
                    placeholder="https://your-n8n-instance.com/webhook/tasks"
                  />
                </div>
                <div>
                  <Label htmlFor="expense-webhook">Expense Logging Webhook</Label>
                  <Input
                    id="expense-webhook"
                    value={n8nExpenseWebhook}
                    onChange={(e) => setN8nExpenseWebhook(e.target.value)}
                    placeholder="https://your-n8n-instance.com/webhook/expenses"
                  />
                </div>
                <div>
                  <Label htmlFor="fitness-webhook">Fitness Logging Webhook</Label>
                  <Input
                    id="fitness-webhook"
                    value={n8nFitnessWebhook}
                    onChange={(e) => setN8nFitnessWebhook(e.target.value)}
                    placeholder="https://your-n8n-instance.com/webhook/fitness"
                  />
                </div>
                <Button onClick={saveWebhookUrls} className="w-full">
                  Save Webhook URLs
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
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