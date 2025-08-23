import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNotifications } from '@/hooks/useNotifications';
import { Bell, BellOff } from 'lucide-react';

export const NotificationSettings: React.FC = () => {
  const {
    settings,
    permission,
    requestPermission,
    updateSettings
  } = useNotifications();

  const handlePermissionRequest = async () => {
    const granted = await requestPermission();
    if (granted) {
      updateSettings({ browserNotifications: true });
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Browser Notifications */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="browser-notifications" className="text-sm font-medium">
              Browser Notifications
            </Label>
            <Switch
              id="browser-notifications"
              checked={settings.browserNotifications && permission === 'granted'}
              onCheckedChange={(checked) => {
                if (checked && permission !== 'granted') {
                  handlePermissionRequest();
                } else {
                  updateSettings({ browserNotifications: checked });
                }
              }}
              disabled={permission === 'denied'}
            />
          </div>
          
          {permission === 'denied' && (
            <p className="text-xs text-muted-foreground">
              Browser notifications are blocked. Enable them in your browser settings.
            </p>
          )}
          
          {permission === 'default' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handlePermissionRequest}
              className="w-full"
            >
              <Bell className="h-4 w-4 mr-2" />
              Enable Browser Notifications
            </Button>
          )}
        </div>

        {/* Reminder Types */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Reminder Types</h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="task-reminders" className="text-sm">
                Task Reminders
              </Label>
              <Switch
                id="task-reminders"
                checked={settings.taskReminders}
                onCheckedChange={(checked) => updateSettings({ taskReminders: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="event-reminders" className="text-sm">
                Event Reminders
              </Label>
              <Switch
                id="event-reminders"
                checked={settings.eventReminders}
                onCheckedChange={(checked) => updateSettings({ eventReminders: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="workout-reminders" className="text-sm">
                Workout Reminders
              </Label>
              <Switch
                id="workout-reminders"
                checked={settings.workoutReminders}
                onCheckedChange={(checked) => updateSettings({ workoutReminders: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="expense-reminders" className="text-sm">
                Expense Reminders
              </Label>
              <Switch
                id="expense-reminders"
                checked={settings.expenseReminders}
                onCheckedChange={(checked) => updateSettings({ expenseReminders: checked })}
              />
            </div>
          </div>
        </div>

        {/* Reminder Timing */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            Reminder Timing
          </Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Notify me</span>
            <Select
              value={settings.reminderMinutes.toString()}
              onValueChange={(value) => updateSettings({ reminderMinutes: parseInt(value) })}
            >
              <SelectTrigger className="w-auto">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 minutes</SelectItem>
                <SelectItem value="10">10 minutes</SelectItem>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
                <SelectItem value="1440">1 day</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">before</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};