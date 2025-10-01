import React from 'react';
import { MessageSquare, AtSign, Heart, Users, Globe, Lock, Palette } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function SocialFeaturesSection() {
  const socialFeatures = [
    {
      icon: MessageSquare,
      title: "Space-Specific Feeds",
      description: "Each shared space has its own feed. Share updates, thoughts, and content within your communities, not personal feeds.",
      badge: "Per Space"
    },
    {
      icon: AtSign,
      title: "@Mentions",
      description: "Tag connections in posts and comments. Everyone mentioned gets notified instantly.",
      badge: "Interactive"
    },
    {
      icon: Heart,
      title: "Likes & Comments",
      description: "Engage with your community through likes and threaded comments. Build meaningful conversations.",
      badge: "Real-time"
    },
    {
      icon: Globe,
      title: "Public Discovery",
      description: "Browse and join public communities. Connect with like-minded people in discoverable spaces.",
      badge: "Open"
    },
    {
      icon: Lock,
      title: "Private Spaces",
      description: "Keep your teams private. Invite-only access with approval workflows for new members.",
      badge: "Secure"
    },
    {
      icon: Users,
      title: "Smart Connections",
      description: "Automatic connection discovery across all your spaces. Auto-categorize by Social, Community, Groups, or Work/Business.",
      badge: "Automatic"
    },
    {
      icon: Palette,
      title: "Space Branding",
      description: "Customize each space with your brand. Upload logos, set colors, choose fonts, and create a unique branded experience.",
      badge: "White-Label"
    }
  ];

  return (
    <section className="py-12 sm:py-16 md:py-24 bg-gradient-to-b from-secondary/5 to-background">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12 md:mb-16 space-y-3 sm:space-y-4 px-4">
          <Badge className="mb-4 px-4 py-2 text-sm">
            <MessageSquare className="h-4 w-4 mr-2" />
            Social Collaboration
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
            Connect & collaborate{' '}
            <span className="text-primary">
              like never before
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto font-medium">
            Kairos isn't just about managing your life—it's about connecting with others. 
            Share modules, collaborate in spaces, and build communities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {socialFeatures.map((feature, index) => (
            <Card 
              key={index}
              className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-card/95 border-2 hover:border-primary/30"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <Badge variant="outline" className="text-xs">
                  {feature.badge}
                </Badge>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>

        {/* Visual Demo */}
        <div className="mt-12 sm:mt-16 max-w-5xl mx-auto">
          <Card className="p-8 bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/20">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-foreground">
                  Feed Example
                </h3>
                <div className="space-y-3">
                  <Card className="p-4 bg-card">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30"></div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold">Sarah Johnson</p>
                        <p className="text-xs text-muted-foreground mb-2">2 hours ago</p>
                        <p className="text-sm">Just hit my quarterly revenue goal! 🎉 Thanks <span className="text-primary font-semibold">@TeamMarketing</span> for the amazing campaign.</p>
                        <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" /> 12 likes
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" /> 5 comments
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4 bg-card">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/30 to-cyan-500/30"></div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold">Mike Chen</p>
                        <p className="text-xs text-muted-foreground mb-2">5 hours ago</p>
                        <p className="text-sm">Who's up for the team hike this weekend? <span className="text-primary font-semibold">@Sarah</span> <span className="text-primary font-semibold">@Alex</span></p>
                        <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" /> 8 likes
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" /> 12 comments
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-foreground">
                  Key Features
                </h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MessageSquare className="h-3 w-3 text-primary" />
                    </div>
                    <span><strong>Rich Posts:</strong> Text, images, links, and rich media support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <AtSign className="h-3 w-3 text-primary" />
                    </div>
                    <span><strong>@Mentions:</strong> Tag anyone in your spaces with instant notifications</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Heart className="h-3 w-3 text-primary" />
                    </div>
                    <span><strong>Engagement:</strong> Like and comment on posts in real-time</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Lock className="h-3 w-3 text-primary" />
                    </div>
                    <span><strong>Privacy:</strong> Feed only available in shared spaces you control</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}