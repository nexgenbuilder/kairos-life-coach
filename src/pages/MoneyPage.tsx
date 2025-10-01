import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import ExpenseForm from '@/components/expenses/ExpenseForm';
import ExpenseList from '@/components/expenses/ExpenseList';
import IncomeForm from '@/components/income/IncomeForm';
import IncomeList from '@/components/income/IncomeList';
import ReceiptProcessor from '@/components/receipt/ReceiptProcessor';

const MoneyPage = () => {
  const [expenseRefreshTrigger, setExpenseRefreshTrigger] = useState(0);
  const [incomeRefreshTrigger, setIncomeRefreshTrigger] = useState(0);

  const handleExpenseAdded = () => {
    setExpenseRefreshTrigger(prev => prev + 1);
  };

  const handleIncomeAdded = () => {
    setIncomeRefreshTrigger(prev => prev + 1);
  };

  return (
    <AppLayout>
      <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Money Management
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            Track your expenses and manage your finances
          </p>
        </div>

        <div className="space-y-6 sm:space-y-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Income Tracking</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <IncomeForm onIncomeAdded={handleIncomeAdded} />
              <IncomeList refreshTrigger={incomeRefreshTrigger} />
            </div>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Expense Tracking</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              <ExpenseForm onExpenseAdded={handleExpenseAdded} />
              <ExpenseList refreshTrigger={expenseRefreshTrigger} />
              <ReceiptProcessor onExpensesAdded={handleExpenseAdded} />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default MoneyPage;