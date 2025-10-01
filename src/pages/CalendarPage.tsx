import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import CalendarComponent from '@/components/calendar/CalendarComponent';

const CalendarPage = () => {
  return (
    <AppLayout>
      <div className="container mx-auto p-4 sm:p-6 max-w-full overflow-x-hidden">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Calendar
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            Manage your schedule and upcoming events
          </p>
        </div>

        <CalendarComponent />
      </div>
    </AppLayout>
  );
};

export default CalendarPage;