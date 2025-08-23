import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  TrendingDown, 
  CheckCircle, 
  Clock, 
  Play, 
  DollarSign,
  Target,
  Calendar,
  Activity
} from 'lucide-react';

interface DashboardStats {
  tasks: {
    inactive: number;
    active: number;
    completed: number;
    total: number;
  };
  finance: {
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    monthlyIncome: number;
    monthlyExpenses: number;
  };
}

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    tasks: { inactive: 0, active: 0, completed: 0, total: 0 },
    finance: { totalIncome: 0, totalExpenses: 0, balance: 0, monthlyIncome: 0, monthlyExpenses: 0 }
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardStats = async () => {
    if (!user) return;

    try {
      // Fetch task statistics
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('status, created_at, activated_at, completed_at')
        .eq('user_id', user.id);

      if (tasksError) throw tasksError;

      const taskStats = {
        inactive: tasksData?.filter(t => t.status === 'inactive' || t.status === 'todo').length || 0,
        active: tasksData?.filter(t => t.status === 'active').length || 0,
        completed: tasksData?.filter(t => t.status === 'completed').length || 0,
        total: tasksData?.length || 0
      };

      // Fetch income statistics
      const { data: incomeData, error: incomeError } = await supabase
        .from('income')
        .select('amount, date')
        .eq('user_id', user.id);

      if (incomeError) throw incomeError;

      // Fetch expense statistics
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('amount, date')
        .eq('user_id', user.id);

      if (expensesError) throw expensesError;

      const totalIncome = incomeData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
      const totalExpenses = expensesData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;

      // Calculate monthly figures (current month)
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      const monthlyIncome = incomeData?.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
      }).reduce((sum, item) => sum + Number(item.amount), 0) || 0;

      const monthlyExpenses = expensesData?.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
      }).reduce((sum, item) => sum + Number(item.amount), 0) || 0;

      const financeStats = {
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses,
        monthlyIncome,
        monthlyExpenses
      };

      setStats({
        tasks: taskStats,
        finance: financeStats
      });

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardStats();
    }
  }, [user]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="text-center">Loading dashboard...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your productivity and finances</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.finance.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${stats.finance.balance.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.finance.balance >= 0 ? 'Positive' : 'Negative'} balance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.tasks.active}</div>
              <p className="text-xs text-muted-foreground">
                Currently in progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                +${stats.finance.monthlyIncome.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                This month's earnings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                -${stats.finance.monthlyExpenses.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                This month's spending
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Module Dashboards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tasks Dashboard */}
          <DashboardCard 
            title="Tasks Overview" 
            description="Your task management summary"
            icon={Target}
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Tasks</span>
                <span className="text-lg font-bold">{stats.tasks.total}</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">Inactive</span>
                  </div>
                  <span className="font-medium">{stats.tasks.inactive}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Play className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Active</span>
                  </div>
                  <span className="font-medium">{stats.tasks.active}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Completed</span>
                  </div>
                  <span className="font-medium">{stats.tasks.completed}</span>
                </div>
              </div>

              {stats.tasks.total > 0 && (
                <div className="pt-2 border-t">
                  <div className="text-sm text-muted-foreground">
                    Completion Rate: {Math.round((stats.tasks.completed / stats.tasks.total) * 100)}%
                  </div>
                </div>
              )}
            </div>
          </DashboardCard>

          {/* Finance Dashboard */}
          <DashboardCard 
            title="Finance Overview" 
            description="Your financial summary"
            icon={DollarSign}
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Net Worth</span>
                <span className={`text-lg font-bold ${stats.finance.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${stats.finance.balance.toFixed(2)}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Total Income</span>
                  </div>
                  <span className="font-medium text-green-600">
                    +${stats.finance.totalIncome.toFixed(2)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-500" />
                    <span className="text-sm">Total Expenses</span>
                  </div>
                  <span className="font-medium text-red-600">
                    -${stats.finance.totalExpenses.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t">
                <div className="text-sm text-muted-foreground">
                  Monthly Balance: 
                  <span className={`ml-1 font-medium ${(stats.finance.monthlyIncome - stats.finance.monthlyExpenses) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${(stats.finance.monthlyIncome - stats.finance.monthlyExpenses).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>
    </AppLayout>
  );
};

export default DashboardPage;