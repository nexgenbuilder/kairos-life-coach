import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { HeroSection } from '@/components/HeroSection';
import { SmartChatInterface } from '@/components/chat/SmartChatInterface';
import { OrganizationSetup } from '@/components/organization/OrganizationSetup';
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
  if (user && !activeContext && !orgLoading) {
    navigate("/onboarding");
    return null;
  }

  return (
    <AppLayout>
      <div className="flex-1 min-h-[500px]">
        <SmartChatInterface />
      </div>
    </AppLayout>
  );
};

export default Index;
