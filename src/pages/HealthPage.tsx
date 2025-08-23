import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { Heart, Activity, Thermometer, Pill } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HealthPage = () => {
  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Health</h1>
          <p className="text-muted-foreground">Monitor your wellbeing and health metrics</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DashboardCard
            title="Quick Log"
            description="Record health data"
            icon={Activity}
          >
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Heart className="h-4 w-4 mr-2" />
                Log Vitals
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Pill className="h-4 w-4 mr-2" />
                Medication
              </Button>
            </div>
          </DashboardCard>
          
          <DashboardCard
            title="Today's Vitals"
            description="Health measurements"
            icon={Heart}
          >
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Heart Rate</span>
                <span className="font-semibold">72 bpm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Blood Pressure</span>
                <span className="font-semibold">120/80</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Weight</span>
                <span className="font-semibold">165 lbs</span>
              </div>
            </div>
          </DashboardCard>
          
          <DashboardCard
            title="Medications"
            description="Today's schedule"
            icon={Pill}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-accent/30 rounded-lg">
                <span className="text-sm">Vitamin D</span>
                <span className="text-xs text-green-600">✓ Taken</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-accent/30 rounded-lg">
                <span className="text-sm">Omega-3</span>
                <span className="text-xs text-muted-foreground">8:00 PM</span>
              </div>
            </div>
          </DashboardCard>
        </div>
        
        <div className="bg-accent/20 border border-border rounded-lg p-6 text-center">
          <p className="text-muted-foreground mb-3">
            💡 Try asking Kairos: "Log my blood pressure as 120/80" or "Remind me to take vitamins at 8am"
          </p>
          <Button variant="secondary">
            Start Health Chat
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default HealthPage;