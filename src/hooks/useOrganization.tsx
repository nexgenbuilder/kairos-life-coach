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
    let mounted = true;
    let retryCount = 0;
    const MAX_RETRIES = 3;

    const fetchUserData = async () => {
      if (!user) {
        if (mounted) {
          console.log('[Organization] No user, clearing state');
          setLoading(false);
          setActiveContext(null);
          setUserContexts([]);
          setMembership(null);
          setModuleSettings([]);
        }
        return;
      }

      try {
        if (mounted) {
          setLoading(true);
          setError(null);
          console.log('[Organization] Loading user data...');
        }

        // Parallel fetch: user contexts and active context
        const [contextsResult, activeContextResult] = await Promise.all([
          supabase.rpc('get_user_contexts', { user_uuid: user.id }),
          supabase.rpc('get_user_active_context', { user_uuid: user.id })
        ]);

        if (!mounted) return;

        if (contextsResult.error) {
          throw new Error(`Failed to fetch contexts: ${contextsResult.error.message}`);
        }
        
        if (activeContextResult.error) {
          throw new Error(`Failed to fetch active context: ${activeContextResult.error.message}`);
        }

        const contexts = contextsResult.data || [];
        const activeContextId = activeContextResult.data;

        console.log('[Organization] Loaded contexts:', contexts.length, 'Active:', activeContextId);
        setUserContexts(contexts);

        if (activeContextId) {
          // Parallel fetch: context details, membership, and module settings
          const [contextResult, membershipResult, settingsResult] = await Promise.all([
            supabase.from('organizations').select('*').eq('id', activeContextId).maybeSingle(),
            supabase.from('organization_memberships').select('*').eq('user_id', user.id).eq('organization_id', activeContextId).eq('is_active', true).maybeSingle(),
            supabase.from('module_permissions').select('*').eq('organization_id', activeContextId)
          ]);

          if (!mounted) return;

          if (contextResult.error) throw contextResult.error;
          if (membershipResult.error) throw membershipResult.error;
          if (settingsResult.error) throw settingsResult.error;

          if (contextResult.data) {
            console.log('[Organization] Loaded active context:', contextResult.data.name);
            setActiveContext({
              ...contextResult.data,
              type: contextResult.data.type as Group['type']
            });
          }

          if (membershipResult.data) {
            setMembership({
              ...membershipResult.data,
              group_id: membershipResult.data.organization_id
            });
          }

          setModuleSettings((settingsResult.data || []).map(setting => ({
            ...setting,
            group_id: setting.organization_id,
            visibility: (setting.visibility as ModuleSetting['visibility']) || 'all_members',
            is_shared: setting.is_shared ?? true,
            can_view: setting.can_view ?? true,
            can_edit: setting.can_edit ?? true,
            can_admin: setting.can_admin ?? false
          })));
        } else {
          setActiveContext(null);
        }
      } catch (err) {
        if (!mounted) return;
        
        console.error('[Organization] Error loading user data:', err);
        
        // Retry with exponential backoff
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 5000);
          console.log(`[Organization] Retrying in ${delay}ms (attempt ${retryCount}/${MAX_RETRIES})`);
          setTimeout(() => fetchUserData(), delay);
          return;
        }
        
        setError(err instanceof Error ? err.message : 'Failed to load organization data');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchUserData();

    return () => {
      mounted = false;
    };
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

    let createdGroupId: string | null = null;

    try {
      console.log('[useOrganization] ===== Starting space creation =====');
      console.log('[useOrganization] Parameters:', { name, type, description, modules, discoverable });
      
      // Ensure user is authenticated
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        console.error('[useOrganization] No authenticated user found');
        return { success: false, error: 'User not authenticated' };
      }
      console.log('[useOrganization] Authenticated user:', currentUser.id);

      // Step 1: Create organization
      console.log('[useOrganization] Step 1: Creating organization...');
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
        console.error('[useOrganization] ❌ Organization creation failed:', groupError);
        return { success: false, error: `Failed to create organization: ${groupError.message}` };
      }

      createdGroupId = groupData.id;
      console.log('[useOrganization] ✅ Organization created:', groupData.id);

      // Step 2: Create membership with ON CONFLICT handling
      console.log('[useOrganization] Step 2: Creating membership...');
      const { error: membershipError } = await supabase
        .from('organization_memberships')
        .upsert({
          organization_id: groupData.id,
          user_id: currentUser.id,
          role: 'owner',
          is_active: true,
        }, {
          onConflict: 'organization_id,user_id',
          ignoreDuplicates: false
        });

      if (membershipError) {
        console.error('[useOrganization] ❌ Membership creation failed:', membershipError);
        return { success: false, error: `Failed to create membership: ${membershipError.message}` };
      }
      console.log('[useOrganization] ✅ Membership created');

      // Step 3: Deactivate other contexts
      console.log('[useOrganization] Step 3: Deactivating other contexts...');
      const { error: deactivateError } = await supabase
        .from('user_contexts')
        .update({ is_active: false })
        .eq('user_id', currentUser.id);

      if (deactivateError) {
        console.error('[useOrganization] ❌ Context deactivation failed:', deactivateError);
        return { success: false, error: `Failed to deactivate contexts: ${deactivateError.message}` };
      }
      console.log('[useOrganization] ✅ Other contexts deactivated');

      // Step 4: Create new context with ON CONFLICT handling
      console.log('[useOrganization] Step 4: Creating user context...');
      const { error: contextError } = await supabase
        .from('user_contexts')
        .upsert({
          user_id: currentUser.id,
          group_id: groupData.id,
          is_active: true,
        }, {
          onConflict: 'user_id,group_id',
          ignoreDuplicates: false
        });

      if (contextError) {
        console.error('[useOrganization] ❌ Context creation failed:', contextError);
        return { success: false, error: `Failed to create context: ${contextError.message}` };
      }
      console.log('[useOrganization] ✅ User context created and activated');

      // Step 5: Create module permissions
      if (modules && modules.length > 0) {
        console.log('[useOrganization] Step 5: Creating module permissions for:', modules);
        
        const modulePermissions = modules.map(moduleName => ({
          organization_id: groupData.id,
          module_name: moduleName,
          is_enabled: true,
          is_shared: true,
          can_view: true,
          can_edit: true,
          can_admin: false,
          visibility: 'all_members' as const,
        }));

        console.log('[useOrganization] Inserting permissions:', modulePermissions);

        const { data: insertedPermissions, error: permissionsError } = await supabase
          .from('module_permissions')
          .insert(modulePermissions)
          .select();

        if (permissionsError) {
          console.error('[useOrganization] ❌ Module permissions creation failed:', permissionsError);
          return { success: false, error: `Failed to create module permissions: ${permissionsError.message}` };
        }

        console.log('[useOrganization] ✅ Module permissions created:', insertedPermissions?.length || 0);
      } else {
        console.log('[useOrganization] No modules to create');
      }
      
      console.log('[useOrganization] ===== Space creation completed successfully =====');
      return { success: true, groupId: groupData.id };
      
    } catch (error: any) {
      console.error('[useOrganization] ❌ Fatal error during space creation:', error);
      
      // Attempt cleanup if we created the organization
      if (createdGroupId) {
        console.log('[useOrganization] Attempting cleanup of organization:', createdGroupId);
        try {
          await supabase.from('module_permissions').delete().eq('organization_id', createdGroupId);
          await supabase.from('user_contexts').delete().eq('group_id', createdGroupId);
          await supabase.from('organization_memberships').delete().eq('organization_id', createdGroupId);
          await supabase.from('organizations').delete().eq('id', createdGroupId);
          console.log('[useOrganization] Cleanup completed');
        } catch (cleanupError) {
          console.error('[useOrganization] Cleanup failed:', cleanupError);
        }
      }
      
      return { success: false, error: error.message || 'Unknown error occurred' };
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