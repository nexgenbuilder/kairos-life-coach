import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { UserPlus, Check, X, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';

interface JoinRequest {
  id: string;
  user_id: string;
  message: string | null;
  status: string;
  created_at: string;
  reviewed_at: string | null;
  user_profile: {
    full_name: string;
    avatar_url: string | null;
  } | null;
}

export const JoinRequestsManager: React.FC = () => {
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  
  const { activeContext, isAdmin } = useOrganization();
  const { toast } = useToast();

  useEffect(() => {
    if (activeContext && isAdmin()) {
      fetchJoinRequests();
    }
  }, [activeContext, isAdmin]);

  const fetchJoinRequests = async () => {
    if (!activeContext) return;
    
    try {
      const { data: requestsData, error: requestsError } = await supabase
        .from('space_join_requests')
        .select('*')
        .eq('space_id', activeContext.id)
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;

      // Fetch user profiles separately
      if (requestsData && requestsData.length > 0) {
        const userIds = requestsData.map(r => r.user_id);
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url')
          .in('user_id', userIds);

        if (profilesError) throw profilesError;

        // Combine the data
        const requestsWithProfiles = requestsData.map(request => ({
          ...request,
          user_profile: profilesData?.find(p => p.user_id === request.user_id) || null
        }));

        setRequests(requestsWithProfiles);
      } else {
        setRequests([]);
      }
    } catch (error) {
      console.error('Error fetching join requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessRequest = async (requestId: string, approve: boolean) => {
    setProcessing(requestId);
    try {
      const { data, error } = await supabase.rpc('process_join_request', {
        request_id: requestId,
        approve: approve
      });

      if (error) throw error;

      if (!data) {
        throw new Error('Failed to process request');
      }

      toast({
        title: approve ? "Request approved" : "Request declined",
        description: approve 
          ? "The user has been added to your space."
          : "The join request has been declined.",
      });

      fetchJoinRequests();
    } catch (error) {
      console.error('Error processing request:', error);
      toast({
        title: "Error processing request",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'approved':
        return <Badge variant="default">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Declined</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!activeContext || !isAdmin()) {
    return null;
  }

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const processedRequests = requests.filter(r => r.status !== 'pending');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          Join Requests
        </CardTitle>
        <CardDescription>
          Manage requests to join your {activeContext.type}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <p className="text-muted-foreground">Loading requests...</p>
        ) : requests.length === 0 ? (
          <p className="text-muted-foreground">No join requests yet.</p>
        ) : (
          <>
            {pendingRequests.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Pending Requests ({pendingRequests.length})</h4>
                <div className="space-y-3">
                  {pendingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-start justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div>
                            <p className="font-medium">
                              {request.user_profile?.full_name || 'Unknown User'}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {new Date(request.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        {request.message && (
                          <p className="text-sm text-muted-foreground mt-2">
                            "{request.message}"
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleProcessRequest(request.id, true)}
                          disabled={processing === request.id}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleProcessRequest(request.id, false)}
                          disabled={processing === request.id}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Decline
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {processedRequests.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Processed Requests</h4>
                <div className="space-y-2">
                  {processedRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-3 border rounded-lg bg-muted/50"
                    >
                      <div>
                        <p className="font-medium">
                          {request.user_profile?.full_name || 'Unknown User'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {request.reviewed_at 
                            ? `Reviewed ${new Date(request.reviewed_at).toLocaleDateString()}`
                            : 'Reviewed'}
                        </p>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
