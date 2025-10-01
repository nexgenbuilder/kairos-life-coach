import React from 'react';
import { Brain, Search, Sparkles, Zap, MessageSquare, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function AICapabilitiesSection() {
  const capabilities = [
    {
      icon: MessageSquare,
      title: "Natural Conversations",
      description: "Chat naturally about your tasks, finances, health, or any data. Ask questions, get insights, and automate actions.",
      example: "\"Show me my expenses from last month\" or \"Schedule a workout for tomorrow\""
    },
    {
      icon: Search,
      title: "Live Web Search",
      description: "Real-time search integration provides up-to-date information and context for better decision making.",
      example: "\"What's the current price of Bitcoin?\" or \"Find the best workout plan for beginners\""
    },
    {
      icon: Sparkles,
      title: "Smart Suggestions",
      description: "AI analyzes your patterns and suggests tasks, optimizes schedules, and identifies opportunities.",
      example: "Suggests bill payment reminders, workout schedules, and task prioritization"
    },
    {
      icon: Zap,
      title: "Task Automation",
      description: "Automate repetitive tasks across modules. Create expenses, schedule events, add tasks—all through conversation.",
      example: "\"Add $50 grocery expense and create a task to meal prep on Sunday\""
    },
    {
      icon: TrendingUp,
      title: "Cross-Module Intelligence",
      description: "AI connects insights across all your data. Understand how health impacts productivity or spending affects goals.",
      example: "Correlates workout frequency with energy levels and task completion rates"
    },
    {
      icon: Brain,
      title: "Powered by Gemini 2.5",
      description: "Google's most advanced AI model provides accurate, contextual, and helpful responses with deep reasoning.",
      example: "Handles complex multi-step requests and provides detailed explanations"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-background to-primary/10">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <Badge variant="secondary" className="mb-4 bg-primary/10 border-primary/30 text-primary font-semibold">
            Powered by AI
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Intelligence that{' '}
            <span className="text-primary">
              understands you
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
            Google Gemini 2.5 integration brings conversational AI to every aspect of your life management
          </p>
        </div>

        {/* Main AI Demo Card */}
        <Card className="max-w-5xl mx-auto mb-12 p-8 bg-card/95 border-2 border-primary/30 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center">
                <Brain className="h-12 w-12 text-purple-500" />
              </div>
            </div>
            <div className="flex-1 space-y-4">
              <h3 className="text-2xl font-bold text-foreground">Try the AI Assistant</h3>
              <div className="space-y-3">
                <div className="p-4 rounded-lg bg-muted/80 border border-border">
                  <p className="text-sm text-muted-foreground mb-1 font-semibold">You:</p>
                  <p className="text-foreground font-medium">"What are my top expenses this month and how can I save money?"</p>
                </div>
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                  <p className="text-sm text-muted-foreground mb-1 font-semibold">Kairos AI:</p>
                  <p className="text-foreground font-medium">
                    "Your top expenses are: Dining ($450), Entertainment ($200), and Transportation ($180). 
                    I notice you're dining out 15+ times monthly. Meal prepping could save ~$250/month. 
                    I can help create a meal prep schedule if you'd like."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Capabilities Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {capabilities.map((capability, index) => (
            <Card 
              key={index}
              className="p-6 hover:shadow-lg transition-all duration-500 hover:-translate-y-2 border-border bg-card/95 backdrop-blur-sm"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <capability.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">{capability.title}</h3>
              <p className="text-muted-foreground text-sm mb-3 leading-relaxed font-medium">{capability.description}</p>
              <div className="p-3 bg-muted/80 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground font-medium">
                  {capability.example}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* Free AI Usage Banner */}
        <div className="mt-12 max-w-3xl mx-auto">
          <Card className="p-6 bg-primary/5 border-2 border-primary/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-1 text-foreground">Free AI Usage Included</h4>
                <p className="text-sm text-muted-foreground font-medium">
                  All Gemini models are currently free to use until October 6, 2025. Experience the full power of AI without limits.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
