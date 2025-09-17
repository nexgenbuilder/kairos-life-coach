import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SharedSpacesOnboarding } from '@/components/organization/SharedSpacesOnboarding';

const OnboardingPage = () => {
  const navigate = useNavigate();
  
  return <SharedSpacesOnboarding onComplete={() => navigate('/')} />;
};

export default OnboardingPage;