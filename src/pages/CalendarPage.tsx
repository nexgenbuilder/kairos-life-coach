import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { Calendar, Clock, MapPin, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const CalendarPage = () => {
  const upcomingEvents = [
    { id: 1, title: 'Team standup', time: '9:00 AM', type: 'meeting' },
    { id: 2, title: 'Lunch with Sarah', time: '12:30 PM', type: 'personal' },
    { id: 3, title: 'Dentist appointment', time: '3:00 PM', type: 'health' },
  ];

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">Manage your schedule and never miss an event</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DashboardCard
            title="Quick Add"
            description="Schedule an event"
            icon={Calendar}
          >
            <Button className="w-full bg-primary-gradient hover:opacity-90">
              <Calendar className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </DashboardCard>
          
          <DashboardCard
            title="Today's Agenda"
            description="3 events scheduled"
            icon={Clock}
          >
            <div className="space-y-2">
              {upcomingEvents.map(event => (
                <div key={event.id} className="flex items-center gap-2 p-2 bg-accent/30 rounded-lg">
                  <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{event.title}</p>
                    <p className="text-xs text-muted-foreground">{event.time}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {event.type}
                  </Badge>
                </div>
              ))}
            </div>
          </DashboardCard>
          
          <DashboardCard
            title="This Week"
            description="Schedule overview"
            icon={MapPin}
          >
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Meetings</span>
                <span className="font-semibold">8</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Personal</span>
                <span className="font-semibold">4</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Health</span>
                <span className="font-semibold">2</span>
              </div>
            </div>
          </DashboardCard>
        </div>
        
        <div className="bg-accent/20 border border-border rounded-lg p-6 text-center">
          <p className="text-muted-foreground mb-3">
            💡 Try asking Kairos: "Schedule a meeting with John tomorrow at 2pm" or "What's on my calendar today?"
          </p>
          <Button variant="secondary">
            Start Calendar Chat
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default CalendarPage;