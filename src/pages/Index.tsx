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
  const { user, loading } = useAuth();
  const { activeContext, loading: orgLoading } = useOrganization();
  const navigate = useNavigate();
  const [taskSheetOpen, setTaskSheetOpen] = useState(false);
  const [expenseSheetOpen, setExpenseSheetOpen] = useState(false);
  const [leadSheetOpen, setLeadSheetOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    } else if (!orgLoading && user && !activeContext) {
      navigate("/onboarding");
    }
  }, [user, loading, navigate, orgLoading, activeContext]);

  if (loading || orgLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!user || orgLoading || !activeContext) {
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
            className="border-b border-border"
          />

          {/* Smart Suggestions */}
          <SmartSuggestionsRow
            onPlanDay={() => navigate('/today')}
            onCreateTask={() => setTaskSheetOpen(true)}
            onLogExpense={() => setExpenseSheetOpen(true)}
            className="border-b border-border py-2"
          />

          {/* Chat Interface */}
          <div className="flex-1 overflow-hidden">
            <SmartChatInterface className="h-full" />
          </div>
        </div>

        {/* Right: Mini Dashboard - Mobile Below, Desktop 40% */}
        <div className="lg:w-[40%] bg-muted/30">
          <div className="sticky top-0">
            <div className="p-4 border-b border-border">
              <h2 className="text-lg font-semibold">Quick Overview</h2>
              <p className="text-sm text-muted-foreground">
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
