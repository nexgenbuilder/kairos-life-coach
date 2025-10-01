import React from 'react';
import { Users, Building2, Globe, Shield, Eye, Edit, Trash, Crown, Lock, MessageSquare, UserPlus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function SharedSpacesDemo() {
  const useCases = [
    {
      icon: Users,
      title: "Family Spaces",
      description: "Private space for sharing calendars, expenses, health data, and tasks. Feed module for family updates.",
      gradient: "from-pink-500/20 to-rose-500/20",
      members: "2-10 members",
      visibility: "Private",
      badge: "Invite-Only"
    },
    {
      icon: Building2,
      title: "Team Workspaces",
      description: "Private or public teams for business collaboration. Share modules, feed updates, and manage permissions.",
      gradient: "from-blue-500/20 to-cyan-500/20",
      members: "5-50 members",
      visibility: "Private/Public",
      badge: "Flexible"
    },
    {
      icon: Globe,
      title: "Public Communities",
      description: "Discoverable communities anyone can join. Fitness groups, investment clubs, or interest-based communities.",
      gradient: "from-purple-500/20 to-indigo-500/20",
      members: "10-1000+ members",
      visibility: "Public",
      badge: "Discoverable"
    }
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
              className="p-4 sm:p-6 hover:shadow-lg transition-all duration-500 hover:-translate-y-2 border-border bg-card/95 backdrop-blur-sm"
            >
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${useCase.gradient} flex items-center justify-center mb-4 sm:mb-6`}>
                <useCase.icon className="h-6 w-6 sm:h-7 sm:w-7 text-foreground" />
              </div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold text-foreground">{useCase.title}</h3>
                <useCase.icon className="h-8 w-8 text-primary" />
              </div>
              <div className="flex gap-2 mb-3">
                <Badge variant="outline" className="text-xs">
                  {useCase.visibility === 'Public' ? <Globe className="h-3 w-3 mr-1" /> : <Lock className="h-3 w-3 mr-1" />}
                  {useCase.visibility}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {useCase.badge}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {useCase.description}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-3 border-t">
                <Users className="h-3 w-3" />
                <span>{useCase.members}</span>
              </div>
            </Card>
          ))}
        </div>

        {/* Permission & Features System */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/20">
            <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Permission Levels
            </h3>
            <div className="space-y-3">
              {[
                { icon: Eye, label: "View", desc: "Read-only access to module data" },
                { icon: Edit, label: "Edit", desc: "Create and modify records" },
                { icon: Trash, label: "Delete", desc: "Remove records and data" },
                { icon: Crown, label: "Admin", desc: "Full control including settings" }
              ].map((perm, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-card border">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <perm.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{perm.label}</p>
                    <p className="text-xs text-muted-foreground">{perm.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-secondary/5 to-primary/5 border-2 border-secondary/20">
            <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Social Features
            </h3>
            <div className="space-y-3">
              {[
                { icon: MessageSquare, label: "Feed Module", desc: "Share posts and updates (shared spaces only)" },
                { icon: Users, label: "Member Directory", desc: "Browse members with profiles and roles" },
                { icon: Globe, label: "Public Discovery", desc: "Join discoverable communities" },
                { icon: UserPlus, label: "Join Requests", desc: "Approval workflow for new members" }
              ].map((feature, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-card border">
                  <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="h-4 w-4 text-secondary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{feature.label}</p>
                    <p className="text-xs text-muted-foreground">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
