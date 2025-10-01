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
    <section className="py-12 sm:py-16 md:py-24 bg-gradient-to-b from-background via-primary/5 to-background">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12 md:mb-16 space-y-3 sm:space-y-4 px-4">
          <Badge variant="secondary" className="mb-3 sm:mb-4 text-xs sm:text-sm">Shared Spaces</Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
            Collaborate with{' '}
            <span className="text-primary">
              anyone, anywhere
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
            Create organizations, invite members, and control exactly who can see and do what
          </p>
        </div>

        {/* Use Cases */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12 md:mb-16">
          {useCases.map((useCase, index) => (
            <Card 
              key={index}
              className="p-4 sm:p-6 md:p-8 hover:shadow-lg transition-all duration-500 hover:-translate-y-2 border-border bg-card/95 backdrop-blur-sm"
            >
              <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br ${useCase.color} flex items-center justify-center mb-4 sm:mb-6`}>
                <useCase.icon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-foreground" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-foreground">{useCase.title}</h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 leading-relaxed font-medium">{useCase.description}</p>
              <Badge variant="outline" className="mt-2 text-xs sm:text-sm">{useCase.members}</Badge>
            </Card>
          ))}
        </div>

        {/* Permission System */}
        <Card className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8 bg-card/95 border-2 border-primary/20 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4 sm:mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground">Granular Permission Controls</h3>
              <p className="text-sm sm:text-base text-muted-foreground font-medium">Fine-tune access for every module and member</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {permissions.map((perm, index) => (
              <div 
                key={index}
                className="flex flex-col items-center p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl bg-background/50 border border-border hover:border-primary/50 transition-colors"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-muted flex items-center justify-center mb-2 sm:mb-3">
                  <perm.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${perm.color}`} />
                </div>
                <span className="font-semibold text-sm sm:text-base">{perm.label}</span>
                <span className="text-xs text-muted-foreground mt-1">Permission</span>
              </div>
            ))}
          </div>

          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-xs sm:text-sm text-muted-foreground text-center">
              <span className="font-semibold text-foreground">Per-module control:</span> Set different permissions for Money, Health, Tasks, and every other module independently
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
}
