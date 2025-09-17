import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GoogleCalendarSettings } from '@/components/settings/GoogleCalendarSettings';
import { NotificationSettings } from '@/components/notifications/NotificationSettings';
import { SecurityDashboard } from '@/components/security/SecurityDashboard';
import { OrganizationManagement } from '@/components/organization/OrganizationManagement';
import { InvitationManager } from '@/components/organization/InvitationManager';
import { ModulePermissionsManager } from '@/components/organization/ModulePermissionsManager';
import { PendingInvitations } from '@/components/organization/PendingInvitations';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Link,
  Building2
} from 'lucide-react';
import { useOrganization } from '@/hooks/useOrganization';

const SettingsPage = () => {
  const { activeContext, isAdmin } = useOrganization();

  return (
    <AppLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account preferences and integrations
          </p>
        </div>
         
        {/* Show pending invitations for all users */}
        <PendingInvitations />

        <Tabs defaultValue={activeContext?.type === 'individual' ? 'general' : 'organization'} className="space-y-6">
          <TabsList className={`grid w-full ${activeContext?.type === 'individual' ? 'grid-cols-4' : 'grid-cols-5'}`}>
            {activeContext?.type !== 'individual' && (
              <TabsTrigger value="organization" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                {activeContext?.type === 'organization' ? 'Organization' : 'Group'}
              </TabsTrigger>
            )}
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

          {activeContext?.type !== 'individual' && (
            <TabsContent value="organization" className="space-y-6">
              {isAdmin() ? (
                <div className="space-y-6">
                  <InvitationManager />
                  <ModulePermissionsManager />
                  <OrganizationManagement />
                </div>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>{activeContext?.type === 'organization' ? 'Organization' : 'Group'} Settings</CardTitle>
                    <CardDescription>
                      Only {activeContext?.type === 'organization' ? 'organization' : 'group'} administrators can manage these settings.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Contact your {activeContext?.type === 'organization' ? 'organization' : 'group'} administrator to make changes to these settings.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          )}

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