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
      <div className="container mx-auto py-4 sm:py-6 md:py-8 px-3 sm:px-4">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Manage your account preferences and integrations
          </p>
        </div>
         
        {/* Show pending invitations for all users */}
        <PendingInvitations />

        <Tabs defaultValue={activeContext?.type === 'individual' ? 'modules' : 'organization'} className="space-y-4 sm:space-y-6">
          <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
            <TabsList className="inline-flex w-auto min-w-full sm:w-full h-auto flex-nowrap sm:flex-wrap p-1 gap-1">
              {activeContext?.type !== 'individual' && (
                <TabsTrigger value="organization" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 whitespace-nowrap">
                  <Building2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">{activeContext?.type === 'organization' ? 'Organization' : 'Space'}</span>
                  <span className="sm:hidden">{activeContext?.type === 'organization' ? 'Org' : 'Space'}</span>
                </TabsTrigger>
              )}
              {activeContext?.type === 'individual' && (
                <TabsTrigger value="modules" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 whitespace-nowrap">
                  <SettingsIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                  Modules
                </TabsTrigger>
              )}
              <TabsTrigger value="integrations" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 whitespace-nowrap">
                <Link className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Integrations</span>
                <span className="sm:hidden">Integr.</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 whitespace-nowrap">
                <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Notifications</span>
                <span className="sm:hidden">Notifs</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 whitespace-nowrap">
                <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                Security
              </TabsTrigger>
              <TabsTrigger value="general" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 whitespace-nowrap">
                <SettingsIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                General
              </TabsTrigger>
            </TabsList>
          </div>

          {activeContext?.type === 'individual' && (
            <TabsContent value="modules" className="space-y-6">
              <ModulePermissionsManager />
            </TabsContent>
          )}

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
                    <CardTitle>{activeContext?.type === 'organization' ? 'Organization' : 'Space'} Settings</CardTitle>
                    <CardDescription>
                      Only {activeContext?.type === 'organization' ? 'organization' : 'space'} administrators can manage these settings.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Contact your {activeContext?.type === 'organization' ? 'organization' : 'space'} administrator to make changes to these settings.
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