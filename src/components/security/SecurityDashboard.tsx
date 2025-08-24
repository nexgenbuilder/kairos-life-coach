import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Shield, AlertTriangle, Activity, Clock, Users, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SecurityAlert {
  id: string;
  table_name: string;
  operation: string;
  new_data: any;
  created_at: string;
}

interface AuditSummary {
  [key: string]: number;
}

export const SecurityDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [auditSummary, setAuditSummary] = useState<AuditSummary>({});
  const [totalAuditLogs, setTotalAuditLogs] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSecurityData();
    }
  }, [user]);

  const fetchSecurityData = async () => {
    try {
      setLoading(true);
      
      // Fetch security alerts
      const { data: alertsData, error: alertsError } = await supabase.functions.invoke('security-monitor', {
        body: { action: 'get_security_alerts' }
      });

      if (alertsError) {
        console.error('Error fetching security alerts:', alertsError);
      } else {
        setAlerts(alertsData.alerts || []);
      }

      // Fetch audit summary
      const { data: summaryData, error: summaryError } = await supabase.functions.invoke('security-monitor', {
        body: { action: 'get_audit_summary' }
      });

      if (summaryError) {
        console.error('Error fetching audit summary:', summaryError);
      } else {
        setAuditSummary(summaryData.summary || {});
        setTotalAuditLogs(summaryData.total || 0);
      }
    } catch (error) {
      console.error('Error fetching security data:', error);
      toast({
        title: "Error",
        description: "Failed to load security data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const cleanupSecurityData = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('security-monitor', {
        body: { action: 'cleanup_data' }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Security data cleanup completed",
      });
      
      // Refresh data
      fetchSecurityData();
    } catch (error) {
      console.error('Error cleaning up security data:', error);
      toast({
        title: "Error",
        description: "Failed to cleanup security data",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getAlertSeverity = (alert: SecurityAlert) => {
    if (alert.operation === 'UNUSUAL_ACCESS_PATTERN') {
      return 'high';
    }
    return 'medium';
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading security data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Shield className="h-6 w-6" />
          Security Dashboard
        </h2>
        <Button onClick={cleanupSecurityData} variant="outline">
          <Clock className="mr-2 h-4 w-4" />
          Cleanup Old Data
        </Button>
      </div>

      {/* Security Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.length}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Audit Events</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAuditLogs}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Protected Tables</CardTitle>
            <Lock className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(auditSummary).filter(key => !key.includes('SECURITY_ALERT')).length}
            </div>
            <p className="text-xs text-muted-foreground">With audit logging</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Status</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active</div>
            <p className="text-xs text-muted-foreground">Authentication secure</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts">Security Alerts</TabsTrigger>
          <TabsTrigger value="audit">Audit Summary</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Security Alerts</CardTitle>
              <CardDescription>
                Security events and anomalies detected in your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <div className="text-center py-6">
                  <Shield className="mx-auto h-12 w-12 text-green-500 mb-2" />
                  <h3 className="font-semibold text-lg">No Security Alerts</h3>
                  <p className="text-muted-foreground">Your account is secure with no recent alerts</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.map((alert) => {
                    const severity = getAlertSeverity(alert);
                    return (
                      <Alert key={alert.id} className="border-l-4 border-l-orange-500">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="ml-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <strong>Unusual Access Pattern Detected</strong>
                              <p className="text-sm text-muted-foreground mt-1">
                                High frequency access to {alert.new_data?.table} - {alert.new_data?.count} requests in 10 minutes
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(alert.created_at)}
                              </p>
                            </div>
                            <Badge variant={getAlertColor(severity) as any}>
                              {severity.toUpperCase()}
                            </Badge>
                          </div>
                        </AlertDescription>
                      </Alert>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Access Summary</CardTitle>
              <CardDescription>
                Overview of database operations and data access patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(auditSummary).length === 0 ? (
                <p className="text-center text-muted-foreground py-6">
                  No audit data available
                </p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {Object.entries(auditSummary)
                    .filter(([key]) => !key.includes('SECURITY_ALERT'))
                    .map(([operation, count]) => {
                      const [table, op] = operation.split('-');
                      return (
                        <div key={operation} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{table}</p>
                            <p className="text-sm text-muted-foreground">{op}</p>
                          </div>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Recommendations</CardTitle>
              <CardDescription>
                Best practices to enhance your account security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <Alert>
                  <Lock className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Strong Authentication:</strong> Your account uses secure authentication with proper session management.
                  </AlertDescription>
                </Alert>
                
                <Alert>
                  <Activity className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Data Monitoring:</strong> All sensitive data access is being logged and monitored for unusual patterns.
                  </AlertDescription>
                </Alert>
                
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Input Validation:</strong> All user inputs are sanitized and validated to prevent security vulnerabilities.
                  </AlertDescription>
                </Alert>
                
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Rate Limiting:</strong> API requests are rate-limited to prevent abuse and ensure service availability.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};