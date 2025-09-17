import React from 'react';
import { SharedSpacesOnboarding } from '@/components/organization/SharedSpacesOnboarding';

const OnboardingPage = () => {
  return <SharedSpacesOnboarding onComplete={() => window.location.reload()} />;
};

export default OnboardingPage;