import React from 'react';
import { Users, Shield, Eye, Edit, Trash2, Home, Briefcase, Heart } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function SharedSpacesDemo() {
  const useCases = [
    {
      icon: Home,
      title: "Family Spaces",
      description: "Share calendars, tasks, and expenses with family members. Coordinate schedules and manage household together.",
      color: "from-pink-500/20 to-rose-500/20",
      members: "2-10 members"
    },
    {
      icon: Briefcase,
      title: "Team Workspaces",
      description: "Collaborate on projects, share files, and track team tasks. Perfect for small businesses and startups.",
      color: "from-blue-500/20 to-cyan-500/20",
      members: "5-50 members"
    },
    {
      icon: Heart,
      title: "Community Groups",
      description: "Coordinate activities, share resources, and communicate with clubs, nonprofits, or interest groups.",
      color: "from-purple-500/20 to-indigo-500/20",
      members: "Unlimited"
    }
  ];

  const permissions = [
    { icon: Eye, label: "View", color: "text-blue-500" },
    { icon: Edit, label: "Edit", color: "text-green-500" },
    { icon: Trash2, label: "Delete", color: "text-red-500" },
    { icon: Shield, label: "Admin", color: "text-purple-500" }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-background via-primary/5 to-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <Badge variant="secondary" className="mb-4">Shared Spaces</Badge>
          <h2 className="text-4xl md:text-5xl font-bold">
            Collaborate with{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              anyone, anywhere
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Create organizations, invite members, and control exactly who can see and do what
          </p>
        </div>

        {/* Use Cases */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {useCases.map((useCase, index) => (
            <Card 
              key={index}
              className="p-8 hover:shadow-glow-soft transition-all duration-500 hover:-translate-y-2 border-border/50 backdrop-blur-sm bg-card/50"
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${useCase.color} flex items-center justify-center mb-6`}>
                <useCase.icon className="h-8 w-8 text-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{useCase.title}</h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">{useCase.description}</p>
              <Badge variant="outline" className="mt-2">{useCase.members}</Badge>
            </Card>
          ))}
        </div>

        {/* Permission System */}
        <Card className="max-w-4xl mx-auto p-8 bg-gradient-to-br from-card to-muted/30 border-2 border-primary/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Granular Permission Controls</h3>
              <p className="text-muted-foreground">Fine-tune access for every module and member</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {permissions.map((perm, index) => (
              <div 
                key={index}
                className="flex flex-col items-center p-6 rounded-xl bg-background/50 border border-border hover:border-primary/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                  <perm.icon className={`h-6 w-6 ${perm.color}`} />
                </div>
                <span className="font-semibold">{perm.label}</span>
                <span className="text-xs text-muted-foreground mt-1">Permission</span>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-sm text-muted-foreground text-center">
              <span className="font-semibold text-foreground">Per-module control:</span> Set different permissions for Money, Health, Tasks, and every other module independently
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
}
