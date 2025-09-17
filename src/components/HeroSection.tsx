import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, LogIn, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeroSectionProps {
  onStartChat?: () => void;
}

export function HeroSection({ onStartChat }: HeroSectionProps) {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden bg-background">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-hero-gradient opacity-5" />
      
      {/* Navigation */}
      <div className="relative max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-gradient rounded-lg flex items-center justify-center shadow-glow-soft">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <h1 className="font-bold text-xl bg-hero-gradient bg-clip-text text-transparent">
              Kairos
            </h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/auth')}
              className="flex items-center space-x-2"
            >
              <LogIn className="h-4 w-4" />
              <span>Sign In</span>
            </Button>
            <Button 
              onClick={() => navigate('/signup')}
              className="flex items-center space-x-2"
            >
              <UserPlus className="h-4 w-4" />
              <span>Get Started</span>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Hero content */}
      <div className="relative max-w-4xl mx-auto px-6 py-16 text-center">
        <div className="space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-accent/50 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-accent-foreground border border-border">
            <Sparkles className="h-4 w-4" />
            Beta Access • AI-Powered Life OS
          </div>
          
          {/* Main heading */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Meet{' '}
              <span className="bg-hero-gradient bg-clip-text text-transparent">
                Kairos
              </span>
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              The AI for your life — coach, planner, partner.
              <br />
              Manage everything through simple conversation.
            </p>
          </div>
          
          {/* CTA Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg"
              onClick={onStartChat || (() => navigate('/signup'))}
              className="bg-primary-gradient hover:opacity-90 transition-smooth shadow-glow-primary text-lg px-8 py-6 rounded-xl"
            >
              {onStartChat ? 'Start with Chat' : 'Start with Kairos'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <div className="text-sm text-muted-foreground">
              {onStartChat ? (
                <>
                  Want to save your progress?{' '}
                   <Button 
                     variant="link" 
                     onClick={() => navigate('/signup')}
                     className="p-0 h-auto text-primary hover:text-primary/80"
                   >
                     Sign up here
                   </Button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <Button 
                    variant="link" 
                    onClick={() => navigate('/auth')}
                    className="p-0 h-auto text-primary hover:text-primary/80"
                  >
                    Sign in here
                  </Button>
                </>
              )}
            </div>
          </div>
          
          {/* Beta notice */}
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-4 text-sm text-muted-foreground max-w-md mx-auto">
            <p className="font-medium text-foreground mb-1">🚀 Private Beta</p>
            <p>
              Kairos is currently in private beta. You'll need a beta access code to sign up.
            </p>
          </div>
        </div>
        
        {/* Features preview */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 text-sm text-muted-foreground">
          <div className="space-y-2">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              💰
            </div>
            <p className="font-medium">Money</p>
            <p className="text-xs">Track finances</p>
          </div>
          <div className="space-y-2">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              💪
            </div>
            <p className="font-medium">Fitness</p>
            <p className="text-xs">Health tracking</p>
          </div>
          <div className="space-y-2">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              ✅
            </div>
            <p className="font-medium">Tasks</p>
            <p className="text-xs">Get things done</p>
          </div>
          <div className="space-y-2">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              📅
            </div>
            <p className="font-medium">Calendar</p>
            <p className="text-xs">Schedule life</p>
          </div>
        </div>
      </div>
    </div>
  );
}