import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { Dumbbell, Target, TrendingUp, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FitnessPage = () => {
  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Fitness</h1>
          <p className="text-muted-foreground">Track workouts, set goals, and stay active</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DashboardCard
            title="Quick Log"
            description="Record your workout"
            icon={Dumbbell}
          >
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Play className="h-4 w-4 mr-2" />
                Start Workout
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Dumbbell className="h-4 w-4 mr-2" />
                Log Exercise
              </Button>
            </div>
          </DashboardCard>
          
          <DashboardCard
            title="Today's Progress"
            description="Daily activity"
            icon={Target}
          >
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Steps</span>
                <span className="font-semibold">8,247</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Calories</span>
                <span className="font-semibold">420</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '82%' }}></div>
              </div>
            </div>
          </DashboardCard>
          
          <DashboardCard
            title="Weekly Goal"
            description="Workout consistency"
            icon={TrendingUp}
          >
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Workouts</span>
                <span className="font-semibold">4/5</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '80%' }}></div>
              </div>
              <p className="text-xs text-muted-foreground">1 more to reach goal</p>
            </div>
          </DashboardCard>
        </div>
        
        <div className="bg-accent/20 border border-border rounded-lg p-6 text-center">
          <p className="text-muted-foreground mb-3">
            💡 Try asking Kairos: "Log a 30-minute run" or "What's my weekly fitness progress?"
          </p>
          <Button variant="secondary">
            Start Fitness Chat
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default FitnessPage;