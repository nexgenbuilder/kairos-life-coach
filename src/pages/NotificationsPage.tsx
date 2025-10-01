import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { NotificationSettings } from '@/components/notifications/NotificationSettings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Settings } from 'lucide-react';

const NotificationsPage = () => {
  const [activeTab, setActiveTab] = useState('notifications');

  return (
    <AppLayout>
      <div className="container mx-auto p-4 sm:p-6 max-w-4xl overflow-x-hidden">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Notifications
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            Manage your notifications and reminders
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="notifications" className="flex items-center gap-2 text-xs sm:text-sm">
              <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Notifications</span>
              <span className="xs:hidden">Alerts</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2 text-xs sm:text-sm">
              <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="mt-4 sm:mt-6">
            <div className="flex justify-center">
              <NotificationCenter onSettingsClick={() => setActiveTab('settings')} />
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-4 sm:mt-6">
            <div className="flex justify-center">
              <NotificationSettings />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default NotificationsPage;