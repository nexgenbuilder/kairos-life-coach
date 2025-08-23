import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar, RefreshCw, LinkIcon, Unlink, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export const GoogleCalendarSettings: React.FC = () => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [autoSync, setAutoSync] = useState(true);

  useEffect(() => {
    if (user) {
      checkGoogleConnection();
      loadSettings();
    }
  }, [user]);

  const loadSettings = () => {
    const settings = localStorage.getItem(`calendar_settings_${user?.id}`);
    if (settings) {
      const parsed = JSON.parse(settings);
      setAutoSync(parsed.autoSync ?? true);
      if (parsed.lastSyncTime) {
        setLastSyncTime(new Date(parsed.lastSyncTime));
      }
    }
  };

  const saveSettings = (newSettings: any) => {
    if (!user) return;
    const settings = {
      autoSync,
      lastSyncTime: lastSyncTime?.toISOString(),
      ...newSettings
    };
    localStorage.setItem(`calendar_settings_${user.id}`, JSON.stringify(settings));
  };

  const checkGoogleConnection = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_google_tokens')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error checking Google connection:', error);
        return;
      }

      setIsConnected(data && data.length > 0);
    } catch (error) {
      console.error('Error checking Google connection:', error);
    }
  };

  const connectGoogleCalendar = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('google-auth', {
        body: { action: 'getAuthUrl' }
      });

      if (error) throw error;

      if (data?.authUrl) {
        window.open(data.authUrl, '_blank', 'width=500,height=600');
        toast({
          title: 'Google Calendar',
          description: 'Please complete the authorization in the popup window, then refresh this page.',
        });
      }
    } catch (error) {
      console.error('Error connecting to Google Calendar:', error);
      toast({
        title: 'Connection Failed',
        description: 'Failed to connect to Google Calendar. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectGoogleCalendar = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_google_tokens')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setIsConnected(false);
      toast({
        title: 'Disconnected',
        description: 'Google Calendar has been disconnected.',
      });
    } catch (error) {
      console.error('Error disconnecting Google Calendar:', error);
      toast({
        title: 'Error',
        description: 'Failed to disconnect Google Calendar.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const syncFromGoogle = async () => {
    if (!user || !isConnected) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('google-calendar-sync', {
        body: { action: 'syncFromGoogle' }
      });

      if (error) throw error;

      const now = new Date();
      setLastSyncTime(now);
      saveSettings({ lastSyncTime: now.toISOString() });

      toast({
        title: 'Sync Complete',
        description: `Synced ${data?.eventsCount || 0} events from Google Calendar.`,
      });
    } catch (error) {
      console.error('Error syncing from Google Calendar:', error);
      toast({
        title: 'Sync Failed',
        description: 'Failed to sync with Google Calendar.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Google Calendar Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-base font-medium">Connection Status</Label>
            <div className="flex items-center gap-2">
              {isConnected ? (
                <>
                  <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                  {lastSyncTime && (
                    <span className="text-sm text-muted-foreground">
                      Last sync: {lastSyncTime.toLocaleDateString()} at {lastSyncTime.toLocaleTimeString()}
                    </span>
                  )}
                </>
              ) : (
                <Badge variant="secondary">
                  Not Connected
                </Badge>
              )}
            </div>
          </div>
          
          {isConnected ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={syncFromGoogle}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Sync Now
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={disconnectGoogleCalendar}
                disabled={isLoading}
              >
                <Unlink className="h-4 w-4 mr-2" />
                Disconnect
              </Button>
            </div>
          ) : (
            <Button
              onClick={connectGoogleCalendar}
              disabled={isLoading}
            >
              <LinkIcon className="h-4 w-4 mr-2" />
              Connect Google Calendar
            </Button>
          )}
        </div>

        {/* Auto Sync Settings */}
        {isConnected && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="auto-sync" className="text-base font-medium">
                  Automatic Sync
                </Label>
                <p className="text-sm text-muted-foreground">
                  Automatically sync events when creating or viewing calendar
                </p>
              </div>
              <Switch
                id="auto-sync"
                checked={autoSync}
                onCheckedChange={(checked) => {
                  setAutoSync(checked);
                  saveSettings({ autoSync: checked });
                }}
              />
            </div>
          </div>
        )}

        {/* Instructions */}
        {!isConnected && (
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Getting Started</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Connect your Google Calendar to sync events between Kairos and Google Calendar.
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• View your Google Calendar events in Kairos</li>
              <li>• Create events that sync to Google Calendar</li>
              <li>• Get reminders for all your scheduled events</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};