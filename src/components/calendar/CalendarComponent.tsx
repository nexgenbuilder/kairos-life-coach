import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, Calendar as CalendarIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
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
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadEvents();
      checkGoogleConnection();
    }
  }, [user]);

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;

      const formattedEvents = data.map(event => ({
        id: event.id,
        title: event.title,
        start: new Date(event.start_time),
        end: new Date(event.end_time),
        resource: event,
      }));

      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error loading events:', error);
      toast.error('Failed to load events');
    }
  };

  const checkGoogleConnection = async () => {
    try {
      const { data } = await supabase
        .from('user_google_tokens')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      setIsConnected(!!data);
    } catch (error) {
      setIsConnected(false);
    }
  };

  const connectGoogleCalendar = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('google-auth', {
        body: { action: 'getAuthUrl' }
      });

      if (error) throw error;

      window.open(data.authUrl, '_blank', 'width=500,height=600');
      
      // Listen for auth completion
      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
          setIsConnected(true);
          syncFromGoogle();
          window.removeEventListener('message', handleMessage);
        }
      };
      window.addEventListener('message', handleMessage);
    } catch (error) {
      console.error('Error connecting Google Calendar:', error);
      toast.error('Failed to connect Google Calendar');
    } finally {
      setIsLoading(false);
    }
  };

  const syncFromGoogle = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('google-calendar-sync', {
        body: { action: 'syncFromGoogle' }
      });

      if (error) throw error;

      toast.success(`Synced ${data.synced} events from Google Calendar`);
      loadEvents();
    } catch (error) {
      console.error('Error syncing from Google:', error);
      toast.error('Failed to sync from Google Calendar');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSlot = async ({ start, end }: { start: Date; end: Date }) => {
    const title = window.prompt('New Event name');
    if (!title) return;

    try {
      setIsLoading(true);
      
      if (isConnected) {
        // Create in Google Calendar and sync back
        const { data, error } = await supabase.functions.invoke('google-calendar-sync', {
          body: {
            action: 'createEvent',
            eventData: {
              title,
              start_time: start.toISOString(),
              end_time: end.toISOString(),
            }
          }
        });

        if (error) throw error;
        
        toast.success('Event created and synced to Google Calendar');
      } else {
        // Create locally only
        const { data, error } = await supabase
          .from('events')
          .insert({
            user_id: user?.id,
            title,
            start_time: start.toISOString(),
            end_time: end.toISOString(),
            is_synced_with_google: false,
          })
          .select()
          .single();

        if (error) throw error;
        
        toast.success('Event created');
      }

      loadEvents();
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectEvent = async (event: CalendarEvent) => {
    if (!window.confirm(`Delete event '${event.title}'?`)) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', event.id);

      if (error) throw error;

      toast.success('Event deleted');
      loadEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Calendar</CardTitle>
          <div className="flex gap-2">
            {!isConnected ? (
              <Button 
                size="sm" 
                variant="outline" 
                className="gap-2"
                onClick={connectGoogleCalendar}
                disabled={isLoading}
              >
                <CalendarIcon className="h-4 w-4" />
                Connect Google
              </Button>
            ) : (
              <Button 
                size="sm" 
                variant="outline" 
                className="gap-2"
                onClick={syncFromGoogle}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Sync
              </Button>
            )}
          </div>
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