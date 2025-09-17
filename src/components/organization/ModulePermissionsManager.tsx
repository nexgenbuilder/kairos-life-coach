import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Settings, Eye, Edit, Shield } from 'lucide-react';
import { useOrganization } from '@/hooks/useOrganization';

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

interface ModulePermission {
  module_name: string;
  is_enabled: boolean;
  is_shared: boolean;
  can_view: boolean;
  can_edit: boolean;
  can_admin: boolean;
  visibility: 'all_members' | 'admin_only' | 'private';
}

export const ModulePermissionsManager: React.FC = () => {
  const [permissions, setPermissions] = useState<ModulePermission[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { activeContext, moduleSettings, isAdmin, updateModuleSetting } = useOrganization();
  const { toast } = useToast();

  useEffect(() => {
    if (activeContext && moduleSettings) {
      // Convert moduleSettings to permissions format
      const permissionMap = new Map(
        moduleSettings.map(setting => [setting.module_name, setting])
      );

      const allPermissions = AVAILABLE_MODULES.map(module => {
        const existing = permissionMap.get(module.name);
        return {
          module_name: module.name,
          is_enabled: existing?.is_enabled ?? false,
          is_shared: existing?.is_shared ?? true,
          can_view: existing?.can_view ?? true,
          can_edit: existing?.can_edit ?? true,
          can_admin: existing?.can_admin ?? false,
          visibility: existing?.visibility ?? 'all_members' as const,
        };
      });

      setPermissions(allPermissions);
      setLoading(false);
    }
  }, [activeContext, moduleSettings]);

  const handlePermissionChange = async (
    moduleName: string, 
    field: keyof ModulePermission, 
    value: boolean | string
  ) => {
    if (!isAdmin()) return;

    try {
      await updateModuleSetting(moduleName, { [field]: value });
      
      setPermissions(prev => 
        prev.map(p => 
          p.module_name === moduleName 
            ? { ...p, [field]: value }
            : p
        )
      );

      toast({
        title: "Settings updated",
        description: `Module permissions have been updated.`,
      });
    } catch (error) {
      console.error('Error updating permission:', error);
      toast({
        title: "Error updating settings",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!activeContext || !isAdmin()) {
    return null;
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Module Permissions
        </CardTitle>
        <CardDescription>
          Control which modules are available and how members can use them
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {permissions.map((permission) => {
          const module = AVAILABLE_MODULES.find(m => m.name === permission.module_name);
          if (!module) return null;

          return (
            <div
              key={permission.module_name}
              className="border rounded-lg p-4 space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{module.label}</h4>
                    {permission.is_enabled && (
                      <Badge variant={permission.is_shared ? "default" : "secondary"}>
                        {permission.is_shared ? "Shared" : "Admin Only"}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{module.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={permission.is_enabled}
                    onCheckedChange={(checked) => 
                      handlePermissionChange(permission.module_name, 'is_enabled', checked)
                    }
                  />
                  <Label htmlFor={`${permission.module_name}-enabled`} className="text-sm">
                    Enabled
                  </Label>
                </div>
              </div>

              {permission.is_enabled && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-3 border-t">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={permission.is_shared}
                      onCheckedChange={(checked) => 
                        handlePermissionChange(permission.module_name, 'is_shared', checked)
                      }
                    />
                    <Label className="text-sm flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      Shared Access
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={permission.can_view}
                      onCheckedChange={(checked) => 
                        handlePermissionChange(permission.module_name, 'can_view', checked)
                      }
                    />
                    <Label className="text-sm flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      Can View
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={permission.can_edit}
                      onCheckedChange={(checked) => 
                        handlePermissionChange(permission.module_name, 'can_edit', checked)
                      }
                    />
                    <Label className="text-sm flex items-center gap-1">
                      <Edit className="w-3 h-3" />
                      Can Edit
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={permission.can_admin}
                      onCheckedChange={(checked) => 
                        handlePermissionChange(permission.module_name, 'can_admin', checked)
                      }
                    />
                    <Label className="text-sm flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Can Admin
                    </Label>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};