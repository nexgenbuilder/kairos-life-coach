import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireOnboarding?: boolean;
}

export function ProtectedRoute({ children, requireOnboarding = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const [showTimeout, setShowTimeout] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (loading) {
      const startTime = Date.now();
      
      const elapsedTimer = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      
      const timeoutTimer = setTimeout(() => {
        setShowTimeout(true);
      }, 45000); // Show timeout message after 45 seconds
      
      return () => {
        clearInterval(elapsedTimer);
        clearTimeout(timeoutTimer);
      };
    } else {
      setShowTimeout(false);
      setElapsed(0);
    }
  }, [loading]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground mb-2">Loading authentication...</p>
          <p className="text-xs text-muted-foreground/60">{elapsed}s elapsed</p>
          
          {showTimeout && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <AlertCircle className="h-5 w-5 text-warning mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-3">
                Authentication is taking longer than expected. This might indicate a connectivity issue.
              </p>
              <div className="flex gap-2 justify-center">
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline"
                  size="sm"
                >
                  Refresh Page
                </Button>
                <Button 
                  onClick={() => window.location.href = '/auth'} 
                  variant="outline"
                  size="sm"
                >
                  Return to Login
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Redirect to landing page if not authenticated
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
