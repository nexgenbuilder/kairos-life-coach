import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export function LoadingDiagnostic() {
  const { user, loading: authLoading } = useAuth();
  const { activeContext, loading: orgLoading, error: orgError } = useOrganization();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const checks = [
    {
      label: 'Authentication',
      status: authLoading ? 'loading' : user ? 'success' : 'error',
      message: authLoading ? 'Checking authentication...' : user ? `Authenticated as ${user.email}` : 'Not authenticated'
    },
    {
      label: 'Organization Context',
      status: orgLoading ? 'loading' : activeContext ? 'success' : 'error',
      message: orgLoading ? 'Loading organization...' : activeContext ? `Loaded: ${activeContext.name}` : orgError || 'No active context'
    }
  ];

  return (
    <Card className="p-6 max-w-md mx-auto">
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Loading Diagnostic</h3>
          <p className="text-sm text-muted-foreground">Elapsed time: {elapsed}s</p>
        </div>

        <div className="space-y-3">
          {checks.map((check) => (
            <div key={check.label} className="flex items-start gap-3">
              {check.status === 'loading' && <Loader2 className="h-5 w-5 animate-spin text-primary shrink-0 mt-0.5" />}
              {check.status === 'success' && <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />}
              {check.status === 'error' && <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">{check.label}</span>
                  <Badge variant={check.status === 'success' ? 'default' : check.status === 'error' ? 'destructive' : 'secondary'} className="text-xs">
                    {check.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{check.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
