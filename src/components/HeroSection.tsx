import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Heart, LogIn, UserPlus, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

export function HeroSection() {
  const navigate = useNavigate();

  const scrollToAccess = () => {
    document.getElementById('access')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-background via-primary/5 to-secondary/5 min-h-screen flex flex-col">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      
      {/* Navigation */}
      <nav className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center space-x-3 group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-glow-soft group-hover:shadow-glow-primary transition-all">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <h1 className="font-bold text-2xl bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Kairos
            </h1>
          </button>
          
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/auth')}
              className="hidden sm:flex items-center gap-2"
            >
              <LogIn className="h-4 w-4" />
              <span>Sign In</span>
            </Button>
            <Button 
              onClick={() => navigate('/signup')}
              className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
            >
              <UserPlus className="h-4 w-4" />
              <span>Get Started</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero content */}
      <div className="relative flex-1 flex items-center justify-center">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-12">
          {/* Badge */}
          <div 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-secondary/10 backdrop-blur-sm rounded-full px-6 py-3 border border-primary/20 shadow-glow-soft animate-fade-in"
          >
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">Private Beta • AI-Powered Life OS</span>
          </div>
          
          {/* Main heading with staggered animation */}
          <div className="space-y-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-foreground drop-shadow-sm">
              Meet{' '}
              <span className="text-primary">
                Kairos
              </span>
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl text-muted-foreground max-w-4xl mx-auto leading-relaxed font-medium">
              The AI for your life — coach, planner, partner.
              <br />
              <span className="text-foreground font-semibold">Manage everything through simple conversation.</span>
            </p>
          </div>
          
          {/* CTA Buttons */}
          <div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in"
            style={{ animationDelay: '400ms' }}
          >
            <Button 
              size="lg"
              onClick={scrollToAccess}
              className="bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90 transition-all text-lg px-10 py-7 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105"
            >
              Start with Kairos
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-lg px-10 py-7 rounded-2xl border-2 hover:bg-primary/5"
            >
              Explore Features
            </Button>
          </div>

          {/* Social proof */}
          <div 
            className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground animate-fade-in"
            style={{ animationDelay: '600ms' }}
          >
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 border-2 border-background"></div>
                ))}
              </div>
              <span>500+ beta users</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Powered by Google Gemini 2.5</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-500 fill-red-500" />
              <span>Privacy-first platform</span>
            </div>
          </div>

          {/* Beta notice */}
          <Badge 
            variant="outline" 
            className="text-sm py-3 px-6 bg-card/50 backdrop-blur-sm border-border animate-fade-in"
            style={{ animationDelay: '800ms' }}
          >
            🚀 Limited beta spots available • Request access now
          </Badge>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="relative pb-12 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary/30 rounded-full mx-auto flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-primary rounded-full"></div>
        </div>
      </div>
    </div>
  );
}