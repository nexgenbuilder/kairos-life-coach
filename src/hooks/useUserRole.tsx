import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useUserRole = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<string>('sales_agent');
  const [organizationRole, setOrganizationRole] = useState<string>('sales_agent');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setRole('sales_agent');
        setOrganizationRole('sales_agent');
        setLoading(false);
        return;
      }

      try {
        // Get organization role from membership
        const { data: membershipData, error: membershipError } = await supabase
          .from('organization_memberships')
          .select('role')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single();

        if (membershipError) {
          console.error('Error fetching organization role:', membershipError);
          setOrganizationRole('sales_agent');
        } else {
          setOrganizationRole(membershipData?.role || 'sales_agent');
        }

        // Get profile role (legacy support)
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile role:', profileError);
          setRole('sales_agent');
        } else {
          setRole(profileData?.role || 'sales_agent');
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setRole('sales_agent');
        setOrganizationRole('sales_agent');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  return { 
    role, 
    organizationRole,
    loading, 
    isAdmin: role === 'admin' || organizationRole === 'admin',
    isOrgAdmin: organizationRole === 'admin'
  };
};