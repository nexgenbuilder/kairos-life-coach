import React from 'react';
import { Brain, Shield, Zap, Users, Globe, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function FeaturesShowcase() {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Intelligence",
      description: "Google Gemini 2.5 integration for natural conversations, task automation, and smart insights across all your data.",
      gradient: "from-purple-500/20 to-pink-500/20"
    },
    {
      icon: Users,
      title: "Shared Spaces",
      description: "Create collaborative workspaces for family, teams, or organizations with granular permission controls.",
      gradient: "from-blue-500/20 to-cyan-500/20"
    },
    {
      icon: Zap,
      title: "Modular Platform",
      description: "Enable only what you need: Money, Health, Fitness, Tasks, Calendar, Social, and 10+ more modules.",
      gradient: "from-orange-500/20 to-yellow-500/20"
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Your data stays yours. Enterprise-grade security with role-based access and end-to-end encryption.",
      gradient: "from-green-500/20 to-emerald-500/20"
    },
    {
      icon: Globe,
      title: "Live Search Integration",
      description: "Real-time web search powered by AI for up-to-date information and contextual assistance.",
      gradient: "from-indigo-500/20 to-purple-500/20"
    },
    {
      icon: TrendingUp,
      title: "Unified Dashboard",
      description: "All your life data in one place. Track finances, health, tasks, and more with beautiful visualizations.",
      gradient: "from-red-500/20 to-pink-500/20"
    }
  ];

  return (
    <section id="features" className="py-12 sm:py-16 md:py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12 md:mb-16 space-y-3 sm:space-y-4 px-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
            Everything you need to{' '}
            <span className="text-primary">
              manage life
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
            A complete platform that adapts to your needs, powered by cutting-edge AI
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="group p-4 sm:p-6 md:p-8 hover:shadow-lg transition-all duration-500 hover:-translate-y-2 border-border bg-card/95 backdrop-blur-sm"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-foreground" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-foreground">{feature.title}</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-medium">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
