import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Mail, Check, X, Building2, Users, Heart, FolderOpen, Briefcase } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface PendingInvitation {
  id: string;
  organization_id: string;
  organization_name: string;
  organization_type: string;
  role: string;
  invited_by_name: string;
  created_at: string;
  expires_at: string;
}

const typeIcons = {
  family: Heart,
  team: Users,
  organization: Building2,
  project: FolderOpen,
  individual: Users,
};

export const PendingInvitations: React.FC = () => {
  const [invitations, setInvitations] = useState<PendingInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchInvitations();
    }
  }, [user]);

  const fetchInvitations = async () => {
    try {
      const { data, error } = await supabase.rpc('get_user_pending_invitations');
      
      if (error) throw error;
      setInvitations(data || []);
    } catch (error) {
      console.error('Error fetching invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async (invitationId: string) => {
    setAccepting(invitationId);
    try {
      const { data: success, error } = await supabase.rpc('accept_organization_invitation', {
        invitation_id: invitationId
      });

      if (error) throw error;

      if (success) {
        toast({
          title: "Invitation accepted!",
          description: "You've successfully joined the organization.",
        });
        
        // Refresh the page to load new context
        window.location.reload();
      } else {
        toast({
          title: "Invalid invitation",
          description: "This invitation may have expired or already been used.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast({
        title: "Error accepting invitation",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setAccepting(null);
    }
  };

  const handleDeclineInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('organization_invitations')
        .delete()
        .eq('id', invitationId);

      if (error) throw error;

      toast({
        title: "Invitation declined",
        description: "The invitation has been declined.",
      });

      fetchInvitations();
    } catch (error) {
      console.error('Error declining invitation:', error);
      toast({
        title: "Error declining invitation",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (invitations.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Pending Invitations
        </CardTitle>
        <CardDescription>
          You have been invited to join these organizations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {invitations.map((invitation) => {
          const IconComponent = typeIcons[invitation.organization_type as keyof typeof typeIcons] || Building2;
          
          return (
            <div
              key={invitation.id}
              className="border rounded-lg p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <IconComponent className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">{invitation.organization_name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Invited by {invitation.invited_by_name || 'Administrator'}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">{invitation.role}</Badge>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Join as a {invitation.role} in this {invitation.organization_type}
              </p>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleAcceptInvitation(invitation.id)}
                  disabled={accepting === invitation.id}
                >
                  {accepting === invitation.id ? 'Accepting...' : (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Accept
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeclineInvitation(invitation.id)}
                  disabled={accepting === invitation.id}
                >
                  <X className="w-4 h-4 mr-1" />
                  Decline
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};