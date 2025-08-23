import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { DollarSign, TrendingUp, CreditCard, PiggyBank } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MoneyPage = () => {
  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Money</h1>
          <p className="text-muted-foreground">Track expenses, manage budgets, and reach your financial goals</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DashboardCard
            title="Quick Add"
            description="Log an expense or income"
            icon={DollarSign}
          >
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <DollarSign className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="h-4 w-4 mr-2" />
                Add Income
              </Button>
            </div>
          </DashboardCard>
          
          <DashboardCard
            title="This Month"
            description="Your spending overview"
            icon={CreditCard}
          >
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Spent</span>
                <span className="font-semibold">$1,247</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Budget</span>
                <span className="font-semibold">$2,000</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '62%' }}></div>
              </div>
            </div>
          </DashboardCard>
          
          <DashboardCard
            title="Savings Goal"
            description="Emergency fund progress"
            icon={PiggyBank}
          >
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Saved</span>
                <span className="font-semibold">$3,240</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Goal</span>
                <span className="font-semibold">$10,000</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '32%' }}></div>
              </div>
            </div>
          </DashboardCard>
        </div>
        
        <div className="bg-accent/20 border border-border rounded-lg p-6 text-center">
          <p className="text-muted-foreground mb-3">
            💡 Try asking Kairos: "Add $4.50 coffee expense" or "How much did I spend on food this week?"
          </p>
          <Button variant="secondary">
            Start Money Chat
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default MoneyPage;