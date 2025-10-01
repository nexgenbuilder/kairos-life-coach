import React from 'react';
import { Palette, Image, Type, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function SpaceBrandingShowcase() {
  const brandingFeatures = [
    {
      icon: Palette,
      title: "Custom Color Schemes",
      description: "Define your brand colors and apply them across the entire space experience."
    },
    {
      icon: Image,
      title: "Logo & Background Images",
      description: "Upload custom logos and branded background images for a personalized look."
    },
    {
      icon: Type,
      title: "Custom Typography",
      description: "Choose fonts that match your brand identity and apply them consistently."
    },
    {
      icon: Sparkles,
      title: "White-Label Ready",
      description: "Complete customization for businesses and organizations to create their own branded platform."
    }
  ];

  const spaceExamples = [
    {
      name: "Community Church",
      colors: "from-blue-500 to-purple-500",
      description: "Custom spiritual theme with church colors and imagery"
    },
    {
      name: "Tech Startup",
      colors: "from-cyan-500 to-emerald-500",
      description: "Modern tech brand with sleek corporate identity"
    },
    {
      name: "Fitness Studio",
      colors: "from-orange-500 to-red-500",
      description: "Energetic fitness brand with vibrant colors"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <Badge className="mb-4 px-4 py-2">
            <Palette className="h-4 w-4 mr-2" />
            White-Label Platform
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold">
            Your space,{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              your brand
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Create a fully customized experience for your organization, community, or business. 
            Kairos becomes your branded platform.
          </p>
        </div>

        {/* Branding Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {brandingFeatures.map((feature, index) => (
            <Card 
              key={index}
              className="p-6 hover:shadow-lg transition-all hover:-translate-y-1 bg-card border-2 hover:border-primary/30"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>

        {/* Space Examples */}
        <div className="max-w-6xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-8">
            See it in action
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {spaceExamples.map((example, index) => (
              <Card 
                key={index}
                className="overflow-hidden group hover:shadow-xl transition-all"
              >
                <div className={`h-32 bg-gradient-to-br ${example.colors} relative`}>
                  <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-white/90 flex items-center justify-center">
                      <Sparkles className="h-8 w-8 text-gray-800" />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="text-lg font-bold mb-2">{example.name}</h4>
                  <p className="text-sm text-muted-foreground">{example.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Key Benefits */}
        <Card className="mt-16 p-8 bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/20">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">Platform Within a Platform</h3>
              <p className="text-muted-foreground mb-4">
                Kairos isn't just a tool—it's your platform. Create a complete branded experience 
                for your organization where members feel like they're using YOUR app, not a third-party service.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span>Upload custom logos and brand assets</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span>Define your brand color palette</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span>Choose custom fonts and typography</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span>Set background images for immersive experiences</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-4">Admin Control</h3>
              <p className="text-muted-foreground mb-4">
                Space owners and admins have complete control over the look and feel of their spaces. 
                Make changes instantly and see them reflected across all members' experiences.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span>Real-time branding updates</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span>Preview changes before publishing</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span>Different branding for each space</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span>Easy-to-use admin interface</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}