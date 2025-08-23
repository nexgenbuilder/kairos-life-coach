import React, { useState } from 'react';
import { Send, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'kairos';
  timestamp: Date;
}

interface ChatInterfaceProps {
  className?: string;
}

export function ChatInterface({ className }: ChatInterfaceProps) {
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

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: 'I understand! Let me help you with that. I\'m currently being set up with all my capabilities. Soon I\'ll be able to help you manage every aspect of your life seamlessly.',
        sender: 'kairos',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const toggleListening = () => {
    setIsListening(!isListening);
    // Voice functionality will be implemented with Web Speech API
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
              <p className="text-sm leading-relaxed">{message.content}</p>
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
              placeholder="Ask Kairos anything about your life..."
              className="pr-12 border-border focus:ring-primary"
            />
          </div>
          
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
            disabled={!inputValue.trim()}
            className="bg-primary-gradient hover:opacity-90 transition-smooth shadow-glow-soft"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}