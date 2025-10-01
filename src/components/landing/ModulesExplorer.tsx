import React, { useState } from 'react';
import { 
  DollarSign, Heart, Dumbbell, CheckSquare, Calendar, 
  MessageSquare, Users, TrendingUp, Bitcoin, Briefcase,
  Sun, Cloud, Bell, Shield, Settings
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

export function ModulesExplorer() {
  const [activeModule, setActiveModule] = useState('feed');

  const modules = [
    { 
      id: 'feed',
      icon: MessageSquare,
      name: 'Feed',
      color: 'text-pink-500',
      description: 'Social collaboration hub for shared spaces. Share updates, @mention connections, and engage in real-time conversations with your teams.'
    },
    { 
      id: 'money', 
      icon: DollarSign, 
      name: 'Money', 
      color: 'text-green-500', 
      description: 'Track income, expenses, budgets, and financial goals with smart categorization and insights.' 
    },
    { id: 'health', icon: Heart, name: 'Health', color: 'text-red-500', description: 'Monitor health metrics, medications, symptoms, and medical appointments in one secure place.' },
    { id: 'fitness', icon: Dumbbell, name: 'Fitness', color: 'text-orange-500', description: 'Log workouts, track progress, set goals, and get AI-powered training recommendations.' },
    { id: 'tasks', icon: CheckSquare, name: 'Tasks', color: 'text-blue-500', description: 'Organize tasks with smart categories, priorities, and AI-powered task suggestions.' },
    { id: 'calendar', icon: Calendar, name: 'Calendar', color: 'text-purple-500', description: 'Unified calendar with Google Calendar sync and intelligent scheduling assistance.' },
    { 
      id: 'connections', 
      icon: Users, 
      name: 'Connections', 
      color: 'text-indigo-500', 
      description: 'Smart connection management across all shared spaces. Browse members, send messages, and organize connections by category.' 
    },
    { id: 'business', icon: Briefcase, name: 'Business', color: 'text-indigo-500', description: 'Business financials, payroll, invoicing, and performance tracking.' },
    { id: 'crypto', icon: Bitcoin, name: 'Crypto', color: 'text-yellow-500', description: 'Track cryptocurrency portfolios and market data in real-time.' },
    { id: 'stocks', icon: TrendingUp, name: 'Stocks', color: 'text-cyan-500', description: 'Monitor stock portfolios and market trends with live data.' },
    { id: 'professional', icon: Briefcase, name: 'Professional', color: 'text-teal-500', description: 'Work schedule management, PTO tracking, and professional development.' },
    { id: 'today', icon: Sun, name: 'Today', color: 'text-amber-500', description: 'Your daily hub with aggregated insights and quick actions across all modules.' },
    { id: 'cloud', icon: Cloud, name: 'Cloud', color: 'text-slate-500', description: 'Secure file storage, sharing, and collaboration with organization members.' },
    { id: 'notifications', icon: Bell, name: 'Notifications', color: 'text-rose-500', description: 'Centralized notification center for all platform activities and updates.' },
    { id: 'security', icon: Shield, name: 'Security', color: 'text-emerald-500', description: 'Security monitoring, activity logs, and account protection features.' },
    { id: 'settings', icon: Settings, name: 'Settings', color: 'text-gray-500', description: 'Customize your experience, manage integrations, and configure preferences.' },
  ];

  const active = modules.find(m => m.id === activeModule) || modules[0];

  return (
    <section className="py-24 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <Badge variant="secondary" className="mb-4">16+ Powerful Modules</Badge>
          <h2 className="text-4xl md:text-5xl font-bold">
            Build your{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              perfect workflow
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Enable only what you need. Toggle modules on or off to create your ideal life management system.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">
          {/* Module Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
            {modules.map((module) => (
              <button
                key={module.id}
                onClick={() => setActiveModule(module.id)}
                className={`p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                  activeModule === module.id
                    ? 'border-primary bg-primary/10 shadow-glow-soft'
                    : 'border-border bg-card hover:border-primary/50'
                }`}
              >
                <module.icon className={`h-8 w-8 mx-auto mb-2 ${module.color}`} />
                <p className="text-xs font-medium text-center">{module.name}</p>
              </button>
            ))}
          </div>

          {/* Active Module Details */}
          <Card className="p-8 border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center`}>
                  <active.icon className={`h-8 w-8 ${active.color}`} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-1">{active.name}</h3>
                  <Badge variant="outline">Module</Badge>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              {active.description}
            </p>
            <div className="space-y-3 pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckSquare className="h-4 w-4 text-primary" />
                <span>AI-powered automation and insights</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4 text-primary" />
                <span>Share with organization members</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4 text-primary" />
                <span>Granular permission controls</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
