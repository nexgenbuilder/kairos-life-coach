import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

export function HeroSection() {
  return (
    <div className="relative overflow-hidden bg-background">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-hero-gradient opacity-5" />
      
      {/* Hero content */}
      <div className="relative max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-accent/50 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-accent-foreground border border-border">
            <Sparkles className="h-4 w-4" />
            Powered by AI
          </div>
          
          {/* Main heading */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              Meet{' '}
              <span className="bg-hero-gradient bg-clip-text text-transparent">
                Kairos
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              The AI for your life — coach, planner, partner.
              <br />
              Manage everything through simple conversation.
            </p>
          </div>
          
          {/* CTA Button */}
          <div className="pt-4">
            <Button 
              size="lg"
              className="bg-primary-gradient hover:opacity-90 transition-smooth shadow-glow-primary text-lg px-8 py-6 rounded-xl"
            >
              Start with chat
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Features preview */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 text-sm text-muted-foreground">
          <div className="space-y-2">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              💰
            </div>
            <p>Money</p>
          </div>
          <div className="space-y-2">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              💪
            </div>
            <p>Fitness</p>
          </div>
          <div className="space-y-2">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              ✅
            </div>
            <p>Tasks</p>
          </div>
          <div className="space-y-2">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              📅
            </div>
            <p>Calendar</p>
          </div>
        </div>
      </div>
    </div>
  );
}