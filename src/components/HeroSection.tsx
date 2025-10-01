import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Heart, LogIn, UserPlus, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { HeroContinuousMotion } from './HeroContinuousMotion';
import { motion, useReducedMotion } from 'framer-motion';

export function HeroSection() {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  const scrollToAccess = () => {
    document.getElementById('access')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="relative overflow-hidden bg-gradient-to-br from-background via-primary/5 to-secondary/5 min-h-screen flex flex-col">
      {/* Continuous motion system */}
      <HeroContinuousMotion intensity="med" />
      
      {/* Navigation */}
      <nav className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center space-x-3 group"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-md transition-all">
              <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <h1 className="font-bold text-xl sm:text-2xl text-primary">
              Kairos
            </h1>
          </button>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/auth')}
              className="hidden sm:flex items-center gap-2"
              size="sm"
            >
              <LogIn className="h-4 w-4" />
              <span>Sign In</span>
            </Button>
            <Button 
              onClick={() => navigate('/signup')}
              className="flex items-center gap-1.5 sm:gap-2 bg-primary hover:bg-primary/90 text-primary-foreground transition-colors text-sm sm:text-base px-3 sm:px-4"
              size="sm"
            >
              <UserPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Get Started</span>
              <span className="xs:hidden">Start</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero content */}
      <div className="relative flex-1 flex items-center justify-center px-4 sm:px-6">
        <div className="max-w-5xl mx-auto w-full text-center space-y-8 sm:space-y-12">
          {/* Badge */}
          <div 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-secondary/10 backdrop-blur-sm rounded-full px-4 sm:px-6 py-2 sm:py-3 border border-primary/20 shadow-sm animate-fade-in"
          >
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium whitespace-nowrap">Private Beta • AI-Powered Life OS + White-Label Spaces</span>
          </div>
          
          {/* Main heading with staggered animation */}
          <div className="space-y-4 sm:space-y-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <motion.h1
              className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-foreground drop-shadow-sm px-4"
              animate={
                shouldReduceMotion
                  ? {}
                  : {
                      textShadow: [
                        "0 0 0 hsla(248, 53%, 58%, 0)",
                        "0 0 24px hsla(248, 53%, 58%, 0.55)",
                        "0 0 0 hsla(248, 53%, 58%, 0)",
                      ],
                    }
              }
              transition={{ duration: 8, ease: "easeInOut", repeat: Infinity }}
            >
              Meet{' '}
              <span className="kairos-accent text-primary">
                Kairos
              </span>
            </motion.h1>
            <p className="text-base sm:text-xl md:text-2xl lg:text-3xl text-muted-foreground max-w-4xl mx-auto leading-relaxed font-medium px-4">
              The AI for your life — coach, planner, partner.
              <br className="hidden sm:block" />
              <span className="text-foreground font-semibold">Manage everything, collaborate with anyone, personalize every space.</span>
            </p>
          </div>
          
          {/* CTA Buttons */}
          <div 
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center animate-fade-in px-4"
            style={{ animationDelay: '400ms' }}
          >
            <Button 
              size="lg"
              onClick={scrollToAccess}
              className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all text-base sm:text-lg px-8 sm:px-10 py-6 sm:py-7 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 w-full sm:w-auto"
            >
              Start with Kairos
              <ArrowRight className="ml-2 h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-base sm:text-lg px-8 sm:px-10 py-6 sm:py-7 rounded-xl sm:rounded-2xl border-2 hover:bg-primary/5 w-full sm:w-auto"
            >
              Explore Features
            </Button>
          </div>

          {/* Social proof */}
          <div 
            className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8 text-xs sm:text-sm text-muted-foreground animate-fade-in px-4"
            style={{ animationDelay: '600ms' }}
          >
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 border-2 border-background"></div>
                ))}
              </div>
              <span className="whitespace-nowrap">500+ beta users</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
              <span className="whitespace-nowrap">Powered by Google Gemini 2.5</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500 fill-red-500 flex-shrink-0" />
              <span className="whitespace-nowrap">Privacy-first platform</span>
            </div>
          </div>

          {/* Beta notice */}
          <Badge 
            variant="outline" 
            className="text-xs sm:text-sm py-2 sm:py-3 px-4 sm:px-6 bg-card/50 backdrop-blur-sm border-border animate-fade-in mx-4"
            style={{ animationDelay: '800ms' }}
          >
            🚀 Limited beta spots available • Request access now
          </Badge>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="relative pb-12"
        animate={shouldReduceMotion ? {} : { y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-7 h-12 rounded-full border-2 border-primary/30 flex items-start justify-center p-1">
          <motion.div
            className="w-2 h-2 bg-primary rounded-full"
            animate={shouldReduceMotion ? {} : { y: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
}