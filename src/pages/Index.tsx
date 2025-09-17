import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { HeroSection } from '@/components/HeroSection';
import { SmartChatInterface } from '@/components/chat/SmartChatInterface';
import { OrganizationSetup } from '@/components/organization/OrganizationSetup';
import { SharedSpacesOnboarding } from '@/components/organization/SharedSpacesOnboarding';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';

const Index = () => {
  const { user, loading } = useAuth();
  const { activeContext, loading: orgLoading } = useOrganization();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading || orgLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  // Show shared spaces onboarding if user doesn't have an active context
  if (user && !activeContext) {
    return <SharedSpacesOnboarding onComplete={() => window.location.reload()} />;
  }

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        {/* Hero section for first-time visitors */}
        <div className="border-b border-border">
          <HeroSection />
        </div>
        
        {/* Main chat interface */}
        <div className="flex-1 min-h-[500px]">
          <SmartChatInterface />
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
