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
  can_view?: boolean;
  can_edit?: boolean;
  can_admin?: boolean;
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        console.log('[useOrganization] No user, skipping fetch');
        setLoading(false);
        setActiveContext(null);
        setUserContexts([]);
        setMembership(null);
        setModuleSettings([]);
        return;
      }

      console.log('[useOrganization] Fetching user data for:', user.id);
      setLoading(true);
      setError(null);

      try {
        // Get user's contexts
        const { data: contextsData, error: contextsError } = await supabase
          .rpc('get_user_contexts', { user_uuid: user.id });

        if (contextsError) {
          console.error('[useOrganization] Error fetching user contexts:', contextsError);
          setError('Failed to load contexts');
        } else {
          console.log('[useOrganization] User contexts:', contextsData);
          setUserContexts(contextsData || []);
        }

        // Get active context
        const { data: activeContextId, error: activeError } = await supabase
          .rpc('get_user_active_context', { user_uuid: user.id });

        if (activeError) {
          console.error('[useOrganization] Error fetching active context:', activeError);
          setError('Failed to load active context');
        } else if (activeContextId) {
          console.log('[useOrganization] Active context ID:', activeContextId);
          // Get active context details
          const { data: contextData, error: contextError } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', activeContextId)
            .maybeSingle();

          if (contextError) {
            console.error('[useOrganization] Error fetching context details:', contextError);
            setError('Failed to load workspace details');
          } else if (contextData) {
            console.log('[useOrganization] Context data loaded:', contextData);
            setActiveContext({
              ...contextData,
              type: contextData.type as Group['type']
            });
          } else {
            console.log('[useOrganization] No context data found for ID:', activeContextId);
          }

          // Get membership details
          const { data: membershipData, error: membershipError } = await supabase
            .from('organization_memberships')
            .select('*')
            .eq('user_id', user.id)
            .eq('organization_id', activeContextId)
            .eq('is_active', true)
            .maybeSingle();

          if (membershipError) {
            console.error('[useOrganization] Error fetching membership:', membershipError);
            setError('Failed to load membership details');
          } else if (membershipData) {
            console.log('[useOrganization] Membership data loaded');
            setMembership({
              ...membershipData,
              group_id: membershipData.organization_id
            });
          } else {
            console.log('[useOrganization] No membership found');
          }

          // Get module settings
          const { data: settingsData, error: settingsError } = await supabase
            .from('module_permissions')
            .select('*')
            .eq('organization_id', activeContextId);

          if (settingsError) {
            console.error('[useOrganization] Error fetching module settings:', settingsError);
            setError('Failed to load module settings');
          } else {
            console.log('[useOrganization] Module settings loaded:', settingsData?.length || 0);
            setModuleSettings((settingsData || []).map(setting => ({
              ...setting,
              group_id: setting.organization_id,
              visibility: (setting.visibility as ModuleSetting['visibility']) || 'all_members',
              is_shared: setting.is_shared ?? true,
              can_view: setting.can_view ?? true,
              can_edit: setting.can_edit ?? true,
              can_admin: setting.can_admin ?? false
            })));
          }
        } else {
          console.log('[useOrganization] No active context found');
          // User has no active context - they need onboarding
          setActiveContext(null);
        }
      } catch (error) {
        console.error('[useOrganization] Error fetching user data:', error);
        setError('Failed to load user data');
      } finally {
        console.log('[useOrganization] Finished loading, activeContext:', activeContext?.id || 'none');
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const hasModuleAccess = (moduleName: string) => {
    if (loading) return false; // Hide all during loading to prevent flash
    if (!activeContext) return false; // No access without context
    
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

  const createGroup = async (
    name: string,
    type: Group['type'],
    description?: string,
    modules?: string[],
    discoverable?: boolean
  ): Promise<{ success: boolean; groupId?: string; error?: string }> => {
    if (!user) return { success: false, error: 'User not authenticated' };

    try {
      console.log('[useOrganization] Creating group:', { name, type, description, modules, discoverable });
      
      // Ensure user is authenticated
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return { success: false, error: 'User not authenticated' };

      // Create group
      const { data: groupData, error: groupError } = await supabase
        .from('organizations')
        .insert({
          name,
          type,
          description,
          created_by: currentUser.id,
          visibility: discoverable ? 'public' : 'private',
          discoverable: discoverable || false,
        })
        .select()
        .single();

      if (groupError) {
        console.error('[useOrganization] Error creating group:', groupError);
        return { success: false, error: groupError.message };
      }

      console.log('[useOrganization] Group created:', groupData.id);

      // Create membership for creator
      const { error: membershipError } = await supabase
        .from('organization_memberships')
        .insert({
          organization_id: groupData.id,
          user_id: user.id,
          role: 'owner',
        });

      if (membershipError) {
        console.error('[useOrganization] Error creating membership:', membershipError);
        return { success: false, error: membershipError.message };
      }

      console.log('[useOrganization] Membership created');

      // Set all other contexts to inactive first
      const { error: deactivateError } = await supabase
        .from('user_contexts')
        .update({ is_active: false })
        .eq('user_id', user.id);

      if (deactivateError) {
        console.error('[useOrganization] Error deactivating contexts:', deactivateError);
        return { success: false, error: deactivateError.message };
      }

      // Add to user contexts and set as active
      const { error: contextError } = await supabase
        .from('user_contexts')
        .insert({
          user_id: user.id,
          group_id: groupData.id,
          is_active: true,
        });

      if (contextError) {
        console.error('[useOrganization] Error creating context:', contextError);
        return { success: false, error: contextError.message };
      }

      console.log('[useOrganization] User context created and activated');

      // Create module permissions if modules are provided
      if (modules && modules.length > 0) {
        console.log('[useOrganization] Creating module permissions for:', modules);
        
        const modulePermissions = modules.map(moduleName => ({
          organization_id: groupData.id,
          module_name: moduleName,
          is_enabled: true,
          is_shared: true,
          can_view: true,
          can_edit: true,
          can_admin: false,
          visibility: 'all_members',
        }));

        const { error: permissionsError } = await supabase
          .from('module_permissions')
          .insert(modulePermissions);

        if (permissionsError) {
          console.error('[useOrganization] Error creating module permissions:', permissionsError);
          return { success: false, error: permissionsError.message };
        }

        console.log('[useOrganization] Module permissions created successfully');
      }
      
      return { success: true, groupId: groupData.id };
    } catch (error: any) {
      console.error('[useOrganization] Error creating group:', error);
      return { success: false, error: error.message || 'Unknown error' };
    }
  };

  const updateModuleSetting = async (moduleName: string, settings: Partial<ModuleSetting>) => {
    if (!activeContext || !isAdmin()) {
      throw new Error('Unauthorized');
    }

    try {
      // Check if permission exists
      const { data: existingPermission } = await supabase
        .from('module_permissions')
        .select('id')
        .eq('organization_id', activeContext.id)
        .eq('module_name', moduleName)
        .single();

      let error;
      if (existingPermission) {
        // Update existing permission
        const { error: updateError } = await supabase
          .from('module_permissions')
          .update(settings)
          .eq('organization_id', activeContext.id)
          .eq('module_name', moduleName);
        error = updateError;
      } else {
        // Insert new permission
        const { error: insertError } = await supabase
          .from('module_permissions')
          .insert({
            organization_id: activeContext.id,
            module_name: moduleName,
            is_enabled: true,
            is_shared: true,
            visibility: 'all_members',
            ...settings,
          });
        error = insertError;
      }

      if (error) throw error;

      // Refetch module settings to ensure UI is in sync
      const { data: updatedSettings, error: fetchError } = await supabase
        .from('module_permissions')
        .select('*')
        .eq('organization_id', activeContext.id);

      if (fetchError) throw fetchError;

      // Update local state with fresh data from database
      setModuleSettings((updatedSettings || []).map(setting => ({
        ...setting,
        group_id: setting.organization_id,
        visibility: (setting.visibility as ModuleSetting['visibility']) || 'all_members',
        is_shared: setting.is_shared ?? true,
        can_view: setting.can_view ?? true,
        can_edit: setting.can_edit ?? true,
        can_admin: setting.can_admin ?? false
      })));

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
    error,
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
        { name: 'connections', shared: false, visibility: 'private' },
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
        { name: 'connections', shared: true, visibility: 'all_members' },
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