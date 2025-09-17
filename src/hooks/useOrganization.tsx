import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Group {
  id: string;
  name: string;
  description?: string;
  type: 'individual' | 'family' | 'team' | 'organization' | 'project';
  logo_url?: string;
  settings: any;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface GroupMembership {
  id: string;
  group_id: string;
  user_id: string;
  role: string;
  is_active: boolean;
  joined_at: string;
}

interface ModuleSetting {
  id: string;
  group_id: string;
  module_name: string;
  is_enabled: boolean;
  is_shared: boolean;
  visibility: 'all_members' | 'admin_only' | 'private';
  settings: any;
}

interface UserContext {
  group_id: string;
  group_name: string;
  group_type: string;
  role: string;
}

export const useOrganization = () => {
  const { user } = useAuth();
  const [activeContext, setActiveContext] = useState<Group | null>(null);
  const [userContexts, setUserContexts] = useState<UserContext[]>([]);
  const [membership, setMembership] = useState<GroupMembership | null>(null);
  const [moduleSettings, setModuleSettings] = useState<ModuleSetting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Get user's contexts
        const { data: contextsData, error: contextsError } = await supabase
          .rpc('get_user_contexts', { user_uuid: user.id });

        if (contextsError) {
          console.error('Error fetching user contexts:', contextsError);
        } else {
          setUserContexts(contextsData || []);
        }

        // Get active context
        const { data: activeContextId, error: activeError } = await supabase
          .rpc('get_user_active_context', { user_uuid: user.id });

        if (activeError) {
          console.error('Error fetching active context:', activeError);
        } else if (activeContextId) {
          // Get active context details
          const { data: contextData, error: contextError } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', activeContextId)
            .single();

          if (contextError) {
            console.error('Error fetching context details:', contextError);
          } else {
            setActiveContext({
              ...contextData,
              type: contextData.type as Group['type']
            });
          }

          // Get membership details
          const { data: membershipData, error: membershipError } = await supabase
            .from('organization_memberships')
            .select('*')
            .eq('user_id', user.id)
            .eq('organization_id', activeContextId)
            .eq('is_active', true)
            .single();

          if (membershipError) {
            console.error('Error fetching membership:', membershipError);
          } else {
            setMembership({
              ...membershipData,
              group_id: membershipData.organization_id
            });
          }

          // Get module settings
          const { data: settingsData, error: settingsError } = await supabase
            .from('module_permissions')
            .select('*')
            .eq('organization_id', activeContextId);

          if (settingsError) {
            console.error('Error fetching module settings:', settingsError);
          } else {
            setModuleSettings((settingsData || []).map(setting => ({
              ...setting,
              group_id: setting.organization_id,
              visibility: (setting.visibility as ModuleSetting['visibility']) || 'all_members',
              is_shared: setting.is_shared ?? true
            })));
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const hasModuleAccess = (moduleName: string) => {
    if (!activeContext) return true; // Show all when no context
    if (loading) return false; // Hide all during loading to prevent flash
    
    const setting = moduleSettings.find(s => s.module_name === moduleName);
    if (!setting) return false;
    
    // Module must be enabled
    if (!setting.is_enabled) return false;
    
    // If shared, all members can access
    if (setting.is_shared) return true;
    
    // If not shared, only admins/owners can access
    return membership?.role === 'admin' || membership?.role === 'owner';
  };

  const isAdmin = () => {
    return membership?.role === 'admin' || membership?.role === 'owner';
  };

  const switchContext = async (contextId: string) => {
    try {
      const { data: success, error } = await supabase
        .rpc('switch_user_context', { 
          new_context_id: contextId, 
          user_uuid: user?.id 
        });

      if (error) throw error;
      
      if (success) {
        // Refresh the page to load new context
        window.location.reload();
      }
      
      return success;
    } catch (error) {
      console.error('Error switching context:', error);
      throw error;
    }
  };

  const createGroup = async (name: string, type: Group['type'], description?: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Create group
      const { data: groupData, error: groupError } = await supabase
        .from('organizations')
        .insert({
          name,
          type,
          description,
          created_by: user.id,
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // Create membership for creator
      const { error: membershipError } = await supabase
        .from('organization_memberships')
        .insert({
          organization_id: groupData.id,
          user_id: user.id,
          role: 'owner',
        });

      if (membershipError) throw membershipError;

      // Add to user contexts
      const { error: contextError } = await supabase
        .from('user_contexts')
        .insert({
          user_id: user.id,
          group_id: groupData.id,
          is_active: false,
        });

      if (contextError) throw contextError;

      // Create default module settings based on group type
      const defaultModules = getDefaultModulesForType(type);
      
      const { error: modulesError } = await supabase
        .from('module_permissions')
        .insert(
          defaultModules.map(module => ({
            organization_id: groupData.id,
            module_name: module.name,
            is_enabled: true,
            is_shared: module.shared,
            visibility: module.visibility,
          }))
        );

      if (modulesError) throw modulesError;

      return groupData;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  };

  const updateModuleSetting = async (moduleName: string, settings: Partial<ModuleSetting>) => {
    if (!activeContext || !isAdmin()) {
      throw new Error('Unauthorized');
    }

    try {
      const { error } = await supabase
        .from('module_permissions')
        .upsert({
          organization_id: activeContext.id,
          module_name: moduleName,
          ...settings,
        });

      if (error) throw error;

      // Update local state
      setModuleSettings(prev => {
        const existing = prev.find(s => s.module_name === moduleName);
        if (existing) {
          return prev.map(s => 
            s.module_name === moduleName 
              ? { ...s, ...settings }
              : s
          );
        } else {
          return [...prev, {
            id: '',
            group_id: activeContext.id,
            module_name: moduleName,
            is_enabled: true,
            is_shared: true,
            visibility: 'all_members',
            settings: {},
            ...settings,
          }];
        }
      });

      return true;
    } catch (error) {
      console.error('Error updating module setting:', error);
      throw error;
    }
  };

  // Legacy organization interface for backwards compatibility
  const organization = activeContext;

  return {
    // New shared spaces interface
    activeContext,
    userContexts,
    membership,
    moduleSettings,
    loading,
    hasModuleAccess,
    isAdmin,
    switchContext,
    createGroup,
    updateModuleSetting,
    
    // Legacy organization interface
    organization,
    modulePermissions: moduleSettings,
    createOrganization: (name: string, description?: string) => 
      createGroup(name, 'organization', description),
    joinOrganization: async () => { throw new Error('Use createGroup instead'); },
    updateModulePermission: (moduleName: string, isEnabled: boolean) =>
      updateModuleSetting(moduleName, { is_enabled: isEnabled }),
  };
};

function getDefaultModulesForType(type: Group['type']) {
  const baseModules = [
    { name: 'today', shared: true, visibility: 'all_members' },
    { name: 'tasks', shared: true, visibility: 'all_members' },
    { name: 'calendar', shared: true, visibility: 'all_members' },
  ];

  switch (type) {
    case 'individual':
      return [
        ...baseModules,
        { name: 'money', shared: false, visibility: 'private' },
        { name: 'health', shared: false, visibility: 'private' },
        { name: 'fitness', shared: false, visibility: 'private' },
        { name: 'social', shared: false, visibility: 'private' },
        { name: 'love', shared: false, visibility: 'private' },
        { name: 'creators', shared: false, visibility: 'private' },
        { name: 'crypto', shared: false, visibility: 'private' },
        { name: 'stocks', shared: false, visibility: 'private' },
        { name: 'news', shared: false, visibility: 'private' },
      ];
    
    case 'family':
      return [
        ...baseModules,
        { name: 'money', shared: true, visibility: 'all_members' },
        { name: 'health', shared: false, visibility: 'private' },
        { name: 'fitness', shared: true, visibility: 'all_members' },
        { name: 'social', shared: true, visibility: 'all_members' },
        { name: 'news', shared: true, visibility: 'all_members' },
      ];
    
    case 'team':
    case 'project':
      return [
        ...baseModules,
        { name: 'professional', shared: true, visibility: 'all_members' },
        { name: 'creators', shared: true, visibility: 'all_members' },
        { name: 'business', shared: true, visibility: 'all_members' },
      ];
    
    case 'organization':
      return [
        ...baseModules,
        { name: 'professional', shared: true, visibility: 'admin_only' },
        { name: 'business', shared: true, visibility: 'admin_only' },
        { name: 'money', shared: true, visibility: 'admin_only' },
        { name: 'creators', shared: true, visibility: 'all_members' },
        { name: 'crypto', shared: true, visibility: 'admin_only' },
        { name: 'stocks', shared: true, visibility: 'admin_only' },
      ];
    
    default:
      return baseModules;
  }
}