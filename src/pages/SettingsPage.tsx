import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GoogleCalendarSettings } from '@/components/settings/GoogleCalendarSettings';
import { NotificationSettings } from '@/components/notifications/NotificationSettings';
import { SecurityDashboard } from '@/components/security/SecurityDashboard';
import { OrganizationManagement } from '@/components/organization/OrganizationManagement';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Link,
  Building2
} from 'lucide-react';
import { useOrganization } from '@/hooks/useOrganization';

const SettingsPage = () => {
  const { isAdmin } = useOrganization();

  return (
    <AppLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account preferences and integrations
          </p>
        </div>

        <Tabs defaultValue="organization" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="organization" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Organization
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              Integrations
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="general" className="flex items-center gap-2">
              <SettingsIcon className="h-4 w-4" />
              General
            </TabsTrigger>
          </TabsList>

          <TabsContent value="organization" className="space-y-6">
            {isAdmin() ? (
              <OrganizationManagement />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Organization Settings</CardTitle>
                  <CardDescription>
                    Only organization administrators can manage these settings.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Contact your organization administrator to make changes to organization settings.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            <GoogleCalendarSettings />
            
            <Card>
              <CardHeader>
                <CardTitle>More Integrations</CardTitle>
                <CardDescription>
                  Additional integrations will be available soon
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We're working on adding more integrations to help you connect your favorite tools.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <NotificationSettings />
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <SecurityDashboard />
          </TabsContent>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  General application preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  General settings will be available in a future update.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;