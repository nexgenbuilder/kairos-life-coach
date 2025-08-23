import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { HeroSection } from '@/components/HeroSection';
import { ChatInterface } from '@/components/chat/ChatInterface';

const Index = () => {
  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        {/* Hero section for first-time visitors */}
        <div className="border-b border-border">
          <HeroSection />
        </div>
        
        {/* Main chat interface */}
        <div className="flex-1 min-h-[500px]">
          <ChatInterface />
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
