import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useUserRole = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<string>('member');
  const [activeContextRole, setActiveContextRole] = useState<string>('member');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setRole('member');
        setActiveContextRole('member');
        setLoading(false);
        return;
      }

      try {
        // Get active context role
        const { data: activeContextId, error: activeError } = await supabase
          .rpc('get_user_active_context', { user_uuid: user.id });

        if (activeError) {
          console.error('Error fetching active context:', activeError);
        } else if (activeContextId) {
          const { data: membershipData, error: membershipError } = await supabase
            .from('organization_memberships')
            .select('role')
            .eq('user_id', user.id)
            .eq('organization_id', activeContextId)
            .eq('is_active', true)
            .single();

          if (membershipError) {
            console.error('Error fetching active context role:', membershipError);
            setActiveContextRole('member');
          } else {
            setActiveContextRole(membershipData?.role || 'member');
          }
        }

        // Get profile role (legacy support)
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile role:', profileError);
          setRole('member');
        } else {
          setRole(profileData?.role || 'member');
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setRole('member');
        setActiveContextRole('member');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  return { 
    role, 
    activeContextRole,
    loading, 
    isAdmin: role === 'admin' || activeContextRole === 'admin' || activeContextRole === 'owner',
    isContextAdmin: activeContextRole === 'admin' || activeContextRole === 'owner',
    // Legacy support
    organizationRole: activeContextRole,
    isOrgAdmin: activeContextRole === 'admin' || activeContextRole === 'owner'
  };
};