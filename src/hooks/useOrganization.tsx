import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Organization {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  settings: any;
  created_at: string;
  updated_at: string;
}

interface OrganizationMembership {
  id: string;
  organization_id: string;
  user_id: string;
  role: string;
  is_active: boolean;
  joined_at: string;
}

interface ModulePermission {
  id: string;
  organization_id: string;
  module_name: string;
  is_enabled: boolean;
  settings: any;
}

export const useOrganization = () => {
  const { user } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [membership, setMembership] = useState<OrganizationMembership | null>(null);
  const [modulePermissions, setModulePermissions] = useState<ModulePermission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrganizationData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Get user's organization membership
        const { data: membershipData, error: membershipError } = await supabase
          .from('organization_memberships')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single();

        if (membershipError) {
          console.error('Error fetching membership:', membershipError);
          setLoading(false);
          return;
        }

        setMembership(membershipData);

        if (membershipData?.organization_id) {
          // Get organization details
          const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', membershipData.organization_id)
            .single();

          if (orgError) {
            console.error('Error fetching organization:', orgError);
          } else {
            setOrganization(orgData);
          }

          // Get module permissions
          const { data: permissionsData, error: permissionsError } = await supabase
            .from('module_permissions')
            .select('*')
            .eq('organization_id', membershipData.organization_id);

          if (permissionsError) {
            console.error('Error fetching module permissions:', permissionsError);
          } else {
            setModulePermissions(permissionsData || []);
          }
        }
      } catch (error) {
        console.error('Error fetching organization data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizationData();
  }, [user]);

  const hasModuleAccess = (moduleName: string) => {
    return modulePermissions.some(
      (permission) => permission.module_name === moduleName && permission.is_enabled
    );
  };

  const isAdmin = () => {
    return membership?.role === 'admin';
  };

  const createOrganization = async (name: string, description?: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Create organization
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name,
          description,
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // Create membership for the creator (as admin)
      const { error: membershipError } = await supabase
        .from('organization_memberships')
        .insert({
          organization_id: orgData.id,
          user_id: user.id,
          role: 'admin',
        });

      if (membershipError) throw membershipError;

      // Enable all modules by default for new organizations
      const defaultModules = [
        'professional', 'tasks', 'calendar', 'money', 'health', 
        'fitness', 'creators', 'crypto', 'stocks', 'news'
      ];

      const { error: permissionsError } = await supabase
        .from('module_permissions')
        .insert(
          defaultModules.map(module => ({
            organization_id: orgData.id,
            module_name: module,
            is_enabled: true,
          }))
        );

      if (permissionsError) throw permissionsError;

      // Update profile with organization
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ organization_id: orgData.id })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      return orgData;
    } catch (error) {
      console.error('Error creating organization:', error);
      throw error;
    }
  };

  const joinOrganization = async (organizationId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Create membership
      const { error: membershipError } = await supabase
        .from('organization_memberships')
        .insert({
          organization_id: organizationId,
          user_id: user.id,
          role: 'sales_agent',
        });

      if (membershipError) throw membershipError;

      // Update profile with organization
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ organization_id: organizationId })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      return true;
    } catch (error) {
      console.error('Error joining organization:', error);
      throw error;
    }
  };

  const updateModulePermission = async (moduleName: string, isEnabled: boolean) => {
    if (!organization || !isAdmin()) {
      throw new Error('Unauthorized');
    }

    try {
      const { error } = await supabase
        .from('module_permissions')
        .upsert({
          organization_id: organization.id,
          module_name: moduleName,
          is_enabled: isEnabled,
        });

      if (error) throw error;

      // Update local state
      setModulePermissions(prev => {
        const existing = prev.find(p => p.module_name === moduleName);
        if (existing) {
          return prev.map(p => 
            p.module_name === moduleName 
              ? { ...p, is_enabled: isEnabled }
              : p
          );
        } else {
          return [...prev, {
            id: '', // Will be updated on refresh
            organization_id: organization.id,
            module_name: moduleName,
            is_enabled: isEnabled,
            settings: {},
          }];
        }
      });

      return true;
    } catch (error) {
      console.error('Error updating module permission:', error);
      throw error;
    }
  };

  return {
    organization,
    membership,
    modulePermissions,
    loading,
    hasModuleAccess,
    isAdmin,
    createOrganization,
    joinOrganization,
    updateModulePermission,
  };
};