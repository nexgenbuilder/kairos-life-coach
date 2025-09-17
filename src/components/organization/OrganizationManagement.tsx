import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Users, Settings, Shield, Plus, Trash2 } from 'lucide-react';
import { useOrganization } from '@/hooks/useOrganization';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

const AVAILABLE_MODULES = [
  { name: 'today', label: 'Today Dashboard', description: 'Daily overview and quick actions' },
  { name: 'tasks', label: 'Task Management', description: 'Todo lists and project tracking' },
  { name: 'calendar', label: 'Calendar', description: 'Event scheduling and planning' },
  { name: 'money', label: 'Personal Finance', description: 'Income and expense tracking' },
  { name: 'health', label: 'Health Tracker', description: 'Medical records and health metrics' },
  { name: 'fitness', label: 'Fitness Tracker', description: 'Workout and exercise logging' },
  { name: 'social', label: 'Social Network', description: 'Social connections and interactions' },
  { name: 'love', label: 'Relationships', description: 'Personal relationship management' },
  { name: 'business', label: 'Business Management', description: 'Business operations and tracking' },
  { name: 'professional', label: 'Professional CRM', description: 'Sales pipeline and contact management' },
  { name: 'creators', label: 'Content Creation', description: 'Creator tools and analytics' },
  { name: 'crypto', label: 'Crypto Portfolio', description: 'Cryptocurrency tracking' },
  { name: 'stocks', label: 'Stock Portfolio', description: 'Stock market investments' },
  { name: 'news', label: 'News Feed', description: 'Personalized news and updates' },
];

interface OrganizationMember {
  id: string;
  user_id: string;
  role: string;
  is_active: boolean;
  joined_at: string;
  profiles: {
    full_name: string;
  };
}

export const OrganizationManagement: React.FC = () => {
  const { organization, modulePermissions, updateModulePermission } = useOrganization();
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMembers = async () => {
      if (!organization) return;

      try {
        // First get memberships
        const { data: memberships, error: membershipError } = await supabase
          .from('organization_memberships')
          .select('*')
          .eq('organization_id', organization.id)
          .eq('is_active', true);

        if (membershipError) {
          console.error('Error fetching memberships:', membershipError);
          return;
        }

        // Then get profiles for each member
        const memberData = await Promise.all(
          (memberships || []).map(async (membership) => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('user_id', membership.user_id)
              .single();

            return {
              ...membership,
              profiles: profile || { full_name: 'Unknown User' }
            };
          })
        );

        setMembers(memberData);
      } catch (error) {
        console.error('Error fetching members:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [organization]);

  const handleModuleToggle = async (moduleName: string, isEnabled: boolean) => {
    try {
      await updateModulePermission(moduleName, isEnabled);
      toast({
        title: isEnabled ? 'Module enabled' : 'Module disabled',
        description: `${moduleName} has been ${isEnabled ? 'enabled' : 'disabled'} for your organization.`,
      });
    } catch (error) {
      toast({
        title: 'Error updating module',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleInviteUser = async () => {
    if (!inviteEmail || !organization) return;

    try {
      const { error } = await supabase
        .from('organization_invitations')
        .insert({
          organization_id: organization.id,
          email: inviteEmail.trim().toLowerCase(),
          role: 'member',
          invited_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Invitation already sent",
            description: "This user has already been invited to this organization.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }

      toast({
        title: 'Invitation sent',
        description: `${inviteEmail} has been invited. They can accept it in their Settings page when they sign up or log in.`,
      });
      setInviteEmail('');
    } catch (error) {
      toast({
        title: 'Error sending invitation',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteOrganization = async () => {
    if (!organization) return;

    try {
      // First delete all related data
      await Promise.all([
        supabase.from('organization_memberships').delete().eq('organization_id', organization.id),
        supabase.from('organization_invitations').delete().eq('organization_id', organization.id),
        supabase.from('module_permissions').delete().eq('organization_id', organization.id),
        supabase.from('user_contexts').delete().eq('group_id', organization.id)
      ]);

      // Then delete the organization
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', organization.id);

      if (error) throw error;

      toast({
        title: 'Organization deleted',
        description: 'The organization has been permanently deleted.',
      });

      // Reload the page to update the context
      window.location.reload();
    } catch (error) {
      toast({
        title: 'Error deleting organization',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (!organization) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Organization Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No organization found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Organization Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Organization Settings
          </CardTitle>
          <CardDescription>
            Manage your organization's basic information and settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Organization Name</Label>
            <p className="text-lg font-semibold">{organization.name}</p>
          </div>
          {organization.description && (
            <div>
              <Label className="text-sm font-medium">Description</Label>
              <p className="text-muted-foreground">{organization.description}</p>
            </div>
          )}
          
          {/* Danger Zone */}
          <div className="pt-6 border-t border-destructive/20">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-destructive">Danger Zone</Label>
                <p className="text-sm text-muted-foreground">
                  Permanently delete this organization and all its data.
                </p>
              </div>
              {!showDeleteConfirm ? (
                <Button 
                  variant="destructive" 
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Organization
                </Button>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-destructive font-medium">
                    Are you sure? This action cannot be undone.
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      variant="destructive" 
                      onClick={handleDeleteOrganization}
                    >
                      Yes, Delete Forever
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Module Permissions */}
      <Card>
        <CardHeader>
          <CardTitle>Module Permissions</CardTitle>
          <CardDescription>
            Control which modules are available to your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AVAILABLE_MODULES.map((module) => {
              const permission = modulePermissions.find(p => p.module_name === module.name);
              const isEnabled = permission?.is_enabled ?? false;

              return (
                <div
                  key={module.name}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <h4 className="font-medium">{module.label}</h4>
                    <p className="text-sm text-muted-foreground">{module.description}</p>
                  </div>
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={(checked) => handleModuleToggle(module.name, checked)}
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members
          </CardTitle>
          <CardDescription>
            Manage your organization's team members and their roles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Invite Section */}
          <div className="flex gap-2">
            <Input
              placeholder="Enter email address to invite"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              type="email"
            />
            <Button onClick={handleInviteUser} disabled={!inviteEmail}>
              <Plus className="h-4 w-4 mr-2" />
              Invite
            </Button>
          </div>

          {/* Members List */}
          {loading ? (
            <p className="text-muted-foreground">Loading members...</p>
          ) : (
            <div className="space-y-2">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{member.profiles.full_name || 'Unknown User'}</p>
                    <p className="text-sm text-muted-foreground">
                      Joined {new Date(member.joined_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                      {member.role === 'admin' ? 'Admin' : 'Sales Agent'}
                    </Badge>
                    {member.role === 'admin' && (
                      <Shield className="h-4 w-4 text-primary" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};