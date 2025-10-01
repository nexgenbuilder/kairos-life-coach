import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { SmartChatInterface } from '@/components/chat/SmartChatInterface';
import { QuickActionsBar } from '@/components/hub/QuickActionsBar';
import { SmartSuggestionsRow } from '@/components/hub/SmartSuggestionsRow';
import { MiniDashGrid } from '@/components/hub/MiniDashGrid';
import { TaskSheet } from '@/components/hub/TaskSheet';
import { ExpenseSheet } from '@/components/hub/ExpenseSheet';
import { LeadSheet } from '@/components/hub/LeadSheet';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { activeContext, loading: orgLoading } = useOrganization();
  const navigate = useNavigate();
  const [taskSheetOpen, setTaskSheetOpen] = useState(false);
  const [expenseSheetOpen, setExpenseSheetOpen] = useState(false);
  const [leadSheetOpen, setLeadSheetOpen] = useState(false);
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    console.log('[Index] Auth loading:', authLoading, 'Org loading:', orgLoading, 'User:', !!user, 'ActiveContext:', !!activeContext);
    
    // Wait for both auth and org to finish loading before making navigation decisions
    if (authLoading || orgLoading) {
      console.log('[Index] Still loading, waiting...');
      return;
    }

    // Prevent multiple redirects
    if (hasRedirected) {
      console.log('[Index] Already redirected, skipping');
      return;
    }

    // If no user, go to auth page
    if (!user) {
      console.log('[Index] No user, redirecting to /auth');
      setHasRedirected(true);
      navigate("/auth", { replace: true });
      return;
    }

    // If user exists but no active context, go to onboarding
    if (!activeContext) {
      console.log('[Index] User exists but no active context, redirecting to /onboarding');
      setHasRedirected(true);
      navigate("/onboarding", { replace: true });
      return;
    }

    console.log('[Index] All good, showing dashboard');
  }, [user, authLoading, orgLoading, activeContext, navigate, hasRedirected]);

  // Show loading while auth or org is loading
  if (authLoading || orgLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if we're missing user or context (navigation will handle it)
  if (!user || !activeContext) {
    return null;
  }

  return (
    <AppLayout>
      <div className="flex flex-col lg:flex-row gap-0 min-h-[calc(100vh-3.5rem)]">
        {/* Left: Conversational Hub - Mobile Full Width, Desktop 60% */}
        <div className="flex-1 flex flex-col lg:w-[60%] border-b lg:border-b-0 lg:border-r border-border">
          {/* Quick Actions Bar */}
          <QuickActionsBar
            onCreateTask={() => setTaskSheetOpen(true)}
            onPlanDay={() => navigate('/today')}
            onLogExpense={() => setExpenseSheetOpen(true)}
            onLogWorkout={() => navigate('/fitness')}
            onAddLead={() => setLeadSheetOpen(true)}
            className="border-b border-border flex-shrink-0"
          />

          {/* Smart Suggestions */}
          <SmartSuggestionsRow
            onPlanDay={() => navigate('/today')}
            onCreateTask={() => setTaskSheetOpen(true)}
            onLogExpense={() => setExpenseSheetOpen(true)}
            className="border-b border-border py-2 flex-shrink-0"
          />

          {/* Chat Interface */}
          <div className="flex-1 min-h-0">
            <SmartChatInterface className="h-full" />
          </div>
        </div>

        {/* Right: Mini Dashboard - Mobile Below, Desktop 40% */}
        <div className="w-full lg:w-[40%] bg-muted/30 min-h-[400px] lg:min-h-0">
          <div className="lg:sticky lg:top-0 lg:max-h-[calc(100vh-3.5rem)] lg:overflow-y-auto">
            <div className="p-4 pb-3 border-b border-border">
              <h2 className="text-lg font-semibold">Quick Overview</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Tap cards to explore modules
              </p>
            </div>
            <MiniDashGrid />
          </div>
        </div>
      </div>

      {/* Modal Sheets */}
      <TaskSheet open={taskSheetOpen} onOpenChange={setTaskSheetOpen} />
      <ExpenseSheet open={expenseSheetOpen} onOpenChange={setExpenseSheetOpen} />
      <LeadSheet open={leadSheetOpen} onOpenChange={setLeadSheetOpen} />
    </AppLayout>
  );
};

export default Index;
