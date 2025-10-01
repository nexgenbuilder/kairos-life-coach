import React from 'react';
import { UserPlus, Settings, MessageSquare, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      icon: UserPlus,
      title: "Sign Up & Complete Profile",
      description: "Request beta access and create your account. Complete your profile with your name and avatar—required for all social features.",
      color: "from-blue-500/20 to-cyan-500/20"
    },
    {
      number: "02",
      icon: Settings,
      title: "Create Your Space",
      description: "Set up a private space or create a public community. Choose visibility, enable modules, and configure permissions for members.",
      color: "from-purple-500/20 to-pink-500/20"
    },
    {
      number: "03",
      icon: MessageSquare,
      title: "Collaborate & Connect",
      description: "Share posts in the Feed, @mention connections, and collaborate in real-time. Join public communities or invite members to private spaces.",
      color: "from-pink-500/20 to-rose-500/20"
    },
    {
      number: "04",
      icon: TrendingUp,
      title: "AI-Powered Insights",
      description: "Chat with Kairos AI, track your goals, and optimize your workflows. AI learns from you and your community to provide personalized insights.",
      color: "from-green-500/20 to-emerald-500/20"
    }
  ];

  return (
    <section className="py-12 sm:py-16 md:py-24 bg-gradient-to-b from-primary/10 to-background">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12 md:mb-16 space-y-3 sm:space-y-4 px-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
            Get started in{' '}
            <span className="text-primary">
              4 simple steps
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
            From signup to collaborative AI-powered management in under 5 minutes
          </p>
        </div>

        <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6 md:space-y-8">
          {steps.map((step, index) => (
            <Card 
              key={index}
              className="relative overflow-hidden hover:shadow-lg transition-all duration-500 sm:hover:-translate-x-2 bg-card/95"
            >
              {/* Step Number Background */}
              <div className="absolute top-0 right-0 text-[120px] sm:text-[160px] md:text-[200px] font-bold text-muted/5 leading-none select-none">
                {step.number}
              </div>

              <div className="relative p-4 sm:p-6 md:p-8 flex flex-col md:flex-row gap-4 sm:gap-6 items-start">
                {/* Icon */}
                <div className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center`}>
                  <step.icon className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 text-foreground" />
                </div>

                {/* Content */}
                <div className="flex-1 space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-xs sm:text-sm font-bold text-muted-foreground">STEP {step.number}</span>
                    <div className="h-px flex-1 bg-border"></div>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground">{step.title}</h3>
                  <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed font-medium">
                    {step.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Video Demo Placeholder */}
        <div className="mt-8 sm:mt-12 md:mt-16 max-w-4xl mx-auto">
          <Card className="p-2 bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/30">
            <div className="aspect-video rounded-lg bg-muted flex items-center justify-center">
              <div className="text-center space-y-2 sm:space-y-3 px-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                  <MessageSquare className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 text-primary" />
                </div>
                <p className="text-sm sm:text-base text-muted-foreground">Watch the demo video</p>
                <p className="text-xs sm:text-sm text-muted-foreground">(Coming Soon)</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
