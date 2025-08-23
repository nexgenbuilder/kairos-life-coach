import React, { useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource?: any;
}

const CalendarComponent: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: '1',
      title: 'Sample Meeting',
      start: new Date(),
      end: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
    },
  ]);

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    const title = window.prompt('New Event name');
    if (title) {
      setEvents([
        ...events,
        {
          id: Date.now().toString(),
          title,
          start,
          end,
        },
      ]);
    }
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    if (window.confirm(`Delete event '${event.title}'?`)) {
      setEvents(events.filter(e => e.id !== event.id));
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Calendar</CardTitle>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Event
          </Button>
        </div>
      </CardHeader>
      <CardContent className="h-[600px]">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          className="h-full"
          views={['month', 'week', 'day', 'agenda']}
          defaultView="month"
        />
      </CardContent>
    </Card>
  );
};

export default CalendarComponent;