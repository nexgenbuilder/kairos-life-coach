import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import HealthTracker from '@/components/health/HealthTracker';

const HealthPage = () => {
  return (
    <AppLayout>
      <div className="container mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Health Tracking
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor your health metrics and wellness journey
          </p>
        </div>

        <HealthTracker />
      </div>
    </AppLayout>
  );
};

export default HealthPage;