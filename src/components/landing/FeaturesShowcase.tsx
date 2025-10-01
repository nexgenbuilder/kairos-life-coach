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
    <section className="py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Everything you need to{' '}
            <span className="text-primary">
              manage life
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
            A complete platform that adapts to your needs, powered by cutting-edge AI
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="group p-8 hover:shadow-lg transition-all duration-500 hover:-translate-y-2 border-border bg-card/95 backdrop-blur-sm"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="h-8 w-8 text-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed font-medium">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
