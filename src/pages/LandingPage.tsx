import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HeroSection } from '@/components/HeroSection';
import { FeaturesShowcase } from '@/components/landing/FeaturesShowcase';
import { ModulesExplorer } from '@/components/landing/ModulesExplorer';
import { SharedSpacesDemo } from '@/components/landing/SharedSpacesDemo';
import { SpaceBrandingShowcase } from '@/components/landing/SpaceBrandingShowcase';
import { SocialFeaturesSection } from '@/components/landing/SocialFeaturesSection';
import { AICapabilitiesSection } from '@/components/landing/AICapabilitiesSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { AccessSection } from '@/components/landing/AccessSection';
import { FooterSection } from '@/components/landing/FooterSection';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { PageLoading } from '@/components/ui/loading-spinner';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoading message="Loading Kairos..." />;
  }

  return (
    <div className="min-h-screen">
      {/* Authenticated User Banner */}
      {user && (
        <div className="sticky top-0 z-50 bg-primary/90 backdrop-blur-sm border-b border-primary/20">
          <div className="container mx-auto px-6 py-3 flex items-center justify-between">
            <p className="text-sm text-primary-foreground">
              Welcome back! You're already logged in.
            </p>
            <Button
              onClick={() => navigate('/dashboard')}
              variant="secondary"
              size="sm"
              className="flex items-center gap-2"
            >
              Go to Dashboard
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <HeroSection />

      {/* Features Showcase */}
      <div id="features">
        <FeaturesShowcase />
      </div>

      {/* Modules Explorer */}
      <div id="modules">
        <ModulesExplorer />
      </div>

      {/* Shared Spaces Demo */}
      <SharedSpacesDemo />

      {/* Space Branding Showcase */}
      <SpaceBrandingShowcase />

      {/* Social Features */}
      <SocialFeaturesSection />

      {/* AI Capabilities */}
      <div id="ai">
        <AICapabilitiesSection />
      </div>

      {/* How It Works */}
      <HowItWorksSection />

      {/* Access Section */}
      <AccessSection />

      {/* Footer */}
      <FooterSection />
    </div>
  );
};

export default LandingPage;