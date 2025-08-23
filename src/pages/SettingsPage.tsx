import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { GoogleCalendarSettings } from '@/components/settings/GoogleCalendarSettings';
import { NotificationSettings } from '@/components/notifications/NotificationSettings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Calendar, Bell, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const SettingsPage = () => {
  const { user } = useAuth();

  return (
    <AppLayout>
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your account preferences and integrations
          </p>
        </div>

        <Tabs defaultValue="integrations" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Integrations
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Account
            </TabsTrigger>
          </TabsList>

          <TabsContent value="integrations" className="mt-6">
            <div className="space-y-6">
              <GoogleCalendarSettings />
              
              {/* Placeholder for future integrations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    More Integrations Coming Soon
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We're working on adding more integrations to help you connect all your productivity tools.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <div className="flex justify-center">
              <NotificationSettings />
            </div>
          </TabsContent>

          <TabsContent value="account" className="mt-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <p className="text-muted-foreground">{user?.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">User ID</label>
                    <p className="text-muted-foreground font-mono text-xs">{user?.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Account Created</label>
                    <p className="text-muted-foreground">
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Future account settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Additional account preferences will be available here soon.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;