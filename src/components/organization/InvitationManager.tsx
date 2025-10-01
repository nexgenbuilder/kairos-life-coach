import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Mail, UserPlus, Trash2, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';

interface PendingInvitation {
  id: string;
  email: string;
  role: string;
  created_at: string;
  expires_at: string;
  accepted_at: string | null;
}

export const InvitationManager: React.FC = () => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'member' | 'admin'>('member');
  const [isInviting, setIsInviting] = useState(false);
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { activeContext, isAdmin } = useOrganization();
  const { toast } = useToast();

  useEffect(() => {
    if (activeContext && isAdmin()) {
      fetchPendingInvitations();
    }
  }, [activeContext, isAdmin]);

  const fetchPendingInvitations = async () => {
    if (!activeContext) return;
    
    try {
      const { data, error } = await supabase
        .from('organization_invitations')
        .select('*')
        .eq('organization_id', activeContext.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingInvitations(data || []);
    } catch (error) {
      console.error('Error fetching invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async () => {
    if (!activeContext || !email.trim()) return;
    
    setIsInviting(true);
    try {
      const { error } = await supabase
        .from('organization_invitations')
        .insert({
          organization_id: activeContext.id,
          email: email.trim().toLowerCase(),
          role,
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
        title: "Invitation sent!",
        description: `${email} has been invited to join your ${activeContext.type}.`,
      });

      setEmail('');
      setRole('member');
      fetchPendingInvitations();
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Error sending invitation",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsInviting(false);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('organization_invitations')
        .delete()
        .eq('id', invitationId);

      if (error) throw error;

      toast({
        title: "Invitation cancelled",
        description: "The invitation has been cancelled.",
      });

      fetchPendingInvitations();
    } catch (error) {
      console.error('Error cancelling invitation:', error);
      toast({
        title: "Error cancelling invitation",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!activeContext || !isAdmin()) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          Invite Members
        </CardTitle>
        <CardDescription>
          Invite people to join your {activeContext.type}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="colleague@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={(value: 'member' | 'admin') => setRole(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Button 
          onClick={handleInviteUser}
          disabled={isInviting || !email.trim()}
          className="w-full md:w-auto"
        >
          {isInviting ? 'Sending...' : (
            <>
              <Mail className="w-4 h-4 mr-2" />
              Send Invitation
            </>
          )}
        </Button>

        {pendingInvitations.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium mb-3">Sent Invitations</h4>
            <div className="space-y-2">
              {pendingInvitations.map((invitation) => {
                const isExpired = new Date(invitation.expires_at) < new Date();
                const isAccepted = invitation.accepted_at !== null;
                const isPending = !isAccepted && !isExpired;
                
                return (
                  <div
                    key={invitation.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div>
                        <p className="font-medium">{invitation.email}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {isAccepted 
                            ? `Accepted ${new Date(invitation.accepted_at).toLocaleDateString()}`
                            : isExpired
                            ? `Expired ${new Date(invitation.expires_at).toLocaleDateString()}`
                            : `Expires ${new Date(invitation.expires_at).toLocaleDateString()}`
                          }
                        </div>
                      </div>
                      <Badge variant="secondary">{invitation.role}</Badge>
                      {isAccepted && <Badge variant="default">Accepted</Badge>}
                      {isExpired && <Badge variant="destructive">Expired</Badge>}
                      {isPending && <Badge variant="outline">Pending</Badge>}
                    </div>
                    {!isAccepted && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancelInvitation(invitation.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};