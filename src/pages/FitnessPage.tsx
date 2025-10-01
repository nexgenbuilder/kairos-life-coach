import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import FitnessTracker from '@/components/fitness/FitnessTracker';

const FitnessPage = () => {
  return (
    <AppLayout>
      <div className="container mx-auto p-4 sm:p-6 max-w-full overflow-x-hidden">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Fitness Tracking
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            Log your workouts and track your fitness progress
          </p>
        </div>

        <FitnessTracker />
      </div>
    </AppLayout>
  );
};

export default FitnessPage;