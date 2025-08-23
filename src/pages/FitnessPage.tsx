import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import FitnessTracker from '@/components/fitness/FitnessTracker';

const FitnessPage = () => {
  return (
    <AppLayout>
      <div className="container mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Fitness Tracking
          </h1>
          <p className="text-muted-foreground mt-2">
            Log your workouts and track your fitness progress
          </p>
        </div>

        <FitnessTracker />
      </div>
    </AppLayout>
  );
};

export default FitnessPage;