import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import ExpenseForm from '@/components/expenses/ExpenseForm';
import ExpenseList from '@/components/expenses/ExpenseList';

const MoneyPage = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleExpenseAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <AppLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Money Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Track your expenses and manage your finances
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ExpenseForm onExpenseAdded={handleExpenseAdded} />
          <ExpenseList refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </AppLayout>
  );
};

export default MoneyPage;