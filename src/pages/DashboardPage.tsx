import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  CheckCircle, 
  Clock, 
  Play, 
  DollarSign,
  Target,
  Calendar,
  Activity,
  Users,
  Heart,
  Briefcase,
  User,
  Video,
  Building,
  Package,
  Plane,
  MessageCircle,
  Gift,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Sparkles,
  CalendarDays,
  MapPin
} from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

interface AllModuleStats {
  // Core Stats
  tasks: {
    inactive: number;
    active: number;
    completed: number;
    total: number;
    completionRate: number;
  };
  finance: {
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    monthlyBalance: number;
  };
  
  // Business Module
  business: {
    totalContacts: number;
    inventory: number;
    lowStockItems: number;
    monthlyRevenue: number;
    monthlyExpenses: number;
    profitMargin: number;
    recentDeals: number;
  };
  
  // Social Module
  social: {
    totalContacts: number;
    friends: number;
    colleagues: number;
    recentInteractions: number;
    upcomingBirthdays: number;
    needsFollowUp: number;
  };
  
  // Professional Module
  professional: {
    totalContacts: number;
    workSchedules: number;
    ptoRequests: number;
    weeklyEarnings: number;
    hoursWorkedThisWeek: number;
    pendingPTO: number;
  };
  
  // Love Module
  love: {
    totalContacts: number;
    family: number;
    significantOthers: number;
    upcomingCelebrations: number;
    keyDates: number;
    needsAttention: number;
  };
  
  // Creators Module
  creators: {
    totalPlatforms: number;
    totalFollowers: number;
    totalContent: number;
    publishedContent: number;
    monthlyRevenue: number;
    totalEngagement: number;
    upcomingLivestreams: number;
  };
  
  // Health & Calendar
  health: {
    recentActivities: number;
    upcomingEvents: number;
    todaysEvents: number;
    thisWeekEvents: number;
  };
}

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AllModuleStats>({
    tasks: { inactive: 0, active: 0, completed: 0, total: 0, completionRate: 0 },
    finance: { totalIncome: 0, totalExpenses: 0, balance: 0, monthlyIncome: 0, monthlyExpenses: 0, monthlyBalance: 0 },
    business: { totalContacts: 0, inventory: 0, lowStockItems: 0, monthlyRevenue: 0, monthlyExpenses: 0, profitMargin: 0, recentDeals: 0 },
    social: { totalContacts: 0, friends: 0, colleagues: 0, recentInteractions: 0, upcomingBirthdays: 0, needsFollowUp: 0 },
    professional: { totalContacts: 0, workSchedules: 0, ptoRequests: 0, weeklyEarnings: 0, hoursWorkedThisWeek: 0, pendingPTO: 0 },
    love: { totalContacts: 0, family: 0, significantOthers: 0, upcomingCelebrations: 0, keyDates: 0, needsAttention: 0 },
    creators: { totalPlatforms: 0, totalFollowers: 0, totalContent: 0, publishedContent: 0, monthlyRevenue: 0, totalEngagement: 0, upcomingLivestreams: 0 },
    health: { recentActivities: 0, upcomingEvents: 0, todaysEvents: 0, thisWeekEvents: 0 }
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchAllModuleStats = async () => {
    if (!user) return;

    try {
      // Parallel queries for all modules
      const queries = await Promise.allSettled([
        // Tasks
        supabase.from('tasks').select('status, created_at, activated_at, completed_at').eq('user_id', user.id),
        
        // Finance
        supabase.from('income').select('amount, date').eq('user_id', user.id),
        supabase.from('expenses').select('amount, date').eq('user_id', user.id),
        
        // Business
        supabase.from('people').select('*').eq('user_id', user.id).in('type', ['client', 'supplier', 'partner', 'vendor']),
        supabase.from('inventory').select('quantity').eq('user_id', user.id),
        supabase.from('business_revenue').select('amount_cents, date').eq('user_id', user.id),
        supabase.from('business_expenses').select('amount_cents, date').eq('user_id', user.id),
        supabase.from('deals').select('*').eq('user_id', user.id),
        
        // Social
        supabase.from('people').select('*').eq('user_id', user.id).in('type', ['friend', 'colleague', 'acquaintance']),
        supabase.from('interactions').select('*').eq('user_id', user.id).eq('module', 'social').gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        
        // Professional
        supabase.from('people').select('*').eq('user_id', user.id).in('type', ['hr', 'manager', 'coworker', 'client', 'vendor', 'mentor']),
        supabase.from('work_schedules').select('*').eq('user_id', user.id),
        supabase.from('pto_requests').select('*').eq('user_id', user.id),
        
        // Love
        supabase.from('people').select('*').eq('user_id', user.id).in('type', ['family', 'partner', 'spouse', 'child', 'parent', 'sibling', 'relative']),
        supabase.from('key_dates').select('*').eq('user_id', user.id),
        
        // Creators
        supabase.from('content_platforms').select('*').eq('user_id', user.id),
        supabase.from('content_catalog').select('*').eq('user_id', user.id),
        supabase.from('content_income').select('amount_cents, date').eq('user_id', user.id),
        supabase.from('livestream_schedules').select('*').eq('user_id', user.id),
        
        // Health & Calendar
        supabase.from('events').select('*').eq('user_id', user.id)
      ]);

      // Process results
      const [
        tasksResult, incomeResult, expensesResult,
        businessContactsResult, inventoryResult, businessRevenueResult, businessExpensesResult, dealsResult,
        socialContactsResult, socialInteractionsResult,
        professionalContactsResult, workSchedulesResult, ptoRequestsResult,
        loveContactsResult, keyDatesResult,
        contentPlatformsResult, contentCatalogResult, contentIncomeResult, livestreamResult,
        eventsResult
      ] = queries;

      // Calculate current date ranges
      const today = new Date();
      const startOfWeek = new Date(today.getTime() - today.getDay() * 24 * 60 * 60 * 1000);
      const endOfWeek = new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000);
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

      // Process Tasks
      const tasksData = tasksResult.status === 'fulfilled' ? tasksResult.value.data || [] : [];
      const taskStats = {
        inactive: tasksData.filter(t => t.status === 'inactive' || t.status === 'todo').length,
        active: tasksData.filter(t => t.status === 'active').length,
        completed: tasksData.filter(t => t.status === 'completed').length,
        total: tasksData.length,
        completionRate: tasksData.length > 0 ? Math.round((tasksData.filter(t => t.status === 'completed').length / tasksData.length) * 100) : 0
      };

      // Process Finance
      const incomeData = incomeResult.status === 'fulfilled' ? incomeResult.value.data || [] : [];
      const expensesData = expensesResult.status === 'fulfilled' ? expensesResult.value.data || [] : [];
      
      const totalIncome = incomeData.reduce((sum, item) => sum + Number(item.amount), 0);
      const totalExpenses = expensesData.reduce((sum, item) => sum + Number(item.amount), 0);
      
      const monthlyIncome = incomeData.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
      }).reduce((sum, item) => sum + Number(item.amount), 0);
      
      const monthlyExpenses = expensesData.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
      }).reduce((sum, item) => sum + Number(item.amount), 0);

      // Process Business
      const businessContacts = businessContactsResult.status === 'fulfilled' ? businessContactsResult.value.data || [] : [];
      const inventory = inventoryResult.status === 'fulfilled' ? inventoryResult.value.data || [] : [];
      const businessRevenue = businessRevenueResult.status === 'fulfilled' ? businessRevenueResult.value.data || [] : [];
      const businessExpenses = businessExpensesResult.status === 'fulfilled' ? businessExpensesResult.value.data || [] : [];
      const deals = dealsResult.status === 'fulfilled' ? dealsResult.value.data || [] : [];
      
      const monthlyBizRevenue = businessRevenue.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
      }).reduce((sum, item) => sum + (item.amount_cents / 100), 0);
      
      const monthlyBizExpenses = businessExpenses.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
      }).reduce((sum, item) => sum + (item.amount_cents / 100), 0);

      // Process Social
      const socialContacts = socialContactsResult.status === 'fulfilled' ? socialContactsResult.value.data || [] : [];
      const socialInteractions = socialInteractionsResult.status === 'fulfilled' ? socialInteractionsResult.value.data || [] : [];
      
      const upcomingBirthdays = socialContacts.filter(contact => {
        if (!contact.birthday) return false;
        const birthday = new Date(contact.birthday);
        const thisYearBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
        return thisYearBirthday >= today && thisYearBirthday <= thirtyDaysFromNow;
      }).length;

      // Process Professional
      const professionalContacts = professionalContactsResult.status === 'fulfilled' ? professionalContactsResult.value.data || [] : [];
      const workSchedules = workSchedulesResult.status === 'fulfilled' ? workSchedulesResult.value.data || [] : [];
      const ptoRequests = ptoRequestsResult.status === 'fulfilled' ? ptoRequestsResult.value.data || [] : [];
      
      let weeklyEarnings = 0;
      let hoursWorked = 0;
      
      workSchedules.forEach(schedule => {
        const scheduleStart = new Date(schedule.start_time);
        const scheduleEnd = new Date(schedule.end_time);
        
        if (scheduleStart >= startOfWeek && scheduleStart <= endOfWeek) {
          const duration = (scheduleEnd.getTime() - scheduleStart.getTime()) / (1000 * 60 * 60);
          hoursWorked += duration;
          
          if (schedule.hourly_rate_cents) {
            weeklyEarnings += (duration * schedule.hourly_rate_cents) / 100;
          } else if (schedule.daily_rate_cents) {
            weeklyEarnings += schedule.daily_rate_cents / 100;
          } else if (schedule.salary_weekly_cents) {
            weeklyEarnings += schedule.salary_weekly_cents / 100;
          }
        }
      });

      // Process Love
      const loveContacts = loveContactsResult.status === 'fulfilled' ? loveContactsResult.value.data || [] : [];
      const keyDates = keyDatesResult.status === 'fulfilled' ? keyDatesResult.value.data || [] : [];
      
      const upcomingCelebrations = keyDates.filter(keyDate => {
        const date = new Date(keyDate.date_value);
        const thisYearDate = new Date(today.getFullYear(), date.getMonth(), date.getDate());
        return thisYearDate >= today && thisYearDate <= thirtyDaysFromNow;
      }).length;

      // Process Creators
      const contentPlatforms = contentPlatformsResult.status === 'fulfilled' ? contentPlatformsResult.value.data || [] : [];
      const contentCatalog = contentCatalogResult.status === 'fulfilled' ? contentCatalogResult.value.data || [] : [];
      const contentIncome = contentIncomeResult.status === 'fulfilled' ? contentIncomeResult.value.data || [] : [];
      const livestreams = livestreamResult.status === 'fulfilled' ? livestreamResult.value.data || [] : [];
      
      const totalFollowers = contentPlatforms.reduce((sum, p) => sum + p.followers_count, 0);
      const totalEngagement = contentCatalog.reduce((sum, c) => sum + c.like_count + c.comment_count, 0);
      const creatorMonthlyRevenue = contentIncome.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
      }).reduce((sum, item) => sum + (item.amount_cents / 100), 0);
      
      const upcomingLivestreams = livestreams.filter(stream => 
        new Date(stream.scheduled_start) >= today && stream.status === 'scheduled'
      ).length;

      // Process Health & Events
      const events = eventsResult.status === 'fulfilled' ? eventsResult.value.data || [] : [];
      const todaysEvents = events.filter(event => {
        const eventDate = new Date(event.start_time);
        return eventDate.toDateString() === today.toDateString();
      }).length;
      
      const thisWeekEvents = events.filter(event => {
        const eventDate = new Date(event.start_time);
        return eventDate >= startOfWeek && eventDate <= endOfWeek;
      }).length;
      
      const upcomingEvents = events.filter(event => {
        const eventDate = new Date(event.start_time);
        return eventDate >= today;
      }).length;

      // Set all stats
      setStats({
        tasks: taskStats,
        finance: {
          totalIncome,
          totalExpenses,
          balance: totalIncome - totalExpenses,
          monthlyIncome,
          monthlyExpenses,
          monthlyBalance: monthlyIncome - monthlyExpenses
        },
        business: {
          totalContacts: businessContacts.length,
          inventory: inventory.length,
          lowStockItems: inventory.filter(item => item.quantity < 10).length,
          monthlyRevenue: monthlyBizRevenue,
          monthlyExpenses: monthlyBizExpenses,
          profitMargin: monthlyBizRevenue > 0 ? Math.round(((monthlyBizRevenue - monthlyBizExpenses) / monthlyBizRevenue) * 100) : 0,
          recentDeals: deals.filter(deal => new Date(deal.created_at) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length
        },
        social: {
          totalContacts: socialContacts.length,
          friends: socialContacts.filter(c => c.type === 'friend').length,
          colleagues: socialContacts.filter(c => c.type === 'colleague').length,
          recentInteractions: socialInteractions.length,
          upcomingBirthdays,
          needsFollowUp: socialContacts.filter(contact => {
            if (!contact.last_interaction_at) return true;
            return new Date(contact.last_interaction_at) < new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
          }).length
        },
        professional: {
          totalContacts: professionalContacts.length,
          workSchedules: workSchedules.length,
          ptoRequests: ptoRequests.length,
          weeklyEarnings,
          hoursWorkedThisWeek: Math.round(hoursWorked * 100) / 100,
          pendingPTO: ptoRequests.filter(p => p.status === 'pending').length
        },
        love: {
          totalContacts: loveContacts.length,
          family: loveContacts.filter(c => ['family', 'parent', 'sibling', 'child', 'relative'].includes(c.type)).length,
          significantOthers: loveContacts.filter(c => ['partner', 'spouse'].includes(c.type)).length,
          upcomingCelebrations,
          keyDates: keyDates.length,
          needsAttention: loveContacts.filter(contact => {
            if (!contact.last_interaction_at) return true;
            return new Date(contact.last_interaction_at) < new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
          }).length
        },
        creators: {
          totalPlatforms: contentPlatforms.length,
          totalFollowers,
          totalContent: contentCatalog.length,
          publishedContent: contentCatalog.filter(c => c.status === 'published').length,
          monthlyRevenue: creatorMonthlyRevenue,
          totalEngagement,
          upcomingLivestreams
        },
        health: {
          recentActivities: events.filter(event => 
            event.title.toLowerCase().includes('workout') || 
            event.title.toLowerCase().includes('exercise') ||
            event.title.toLowerCase().includes('fitness')
          ).length,
          upcomingEvents,
          todaysEvents,
          thisWeekEvents
        }
      });

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAllModuleStats();
    }
  }, [user]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="text-center">Loading comprehensive dashboard...</div>
        </div>
      </AppLayout>
    );
  }

  const quickActions = [
    { label: 'Add Task', href: '/tasks', icon: Target },
    { label: 'Log Income', href: '/money', icon: TrendingUp },
    { label: 'Add Contact', href: '/social', icon: Users },
    { label: 'Schedule Event', href: '/calendar', icon: Calendar }
  ];

  return (
    <AppLayout>
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Life Dashboard
            </h1>
            <p className="text-muted-foreground text-lg">
              Complete overview of your personal and professional life
            </p>
          </div>
          
          <div className="flex gap-2">
            {quickActions.map((action) => (
              <Link key={action.label} to={action.href}>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <action.icon className="h-4 w-4" />
                  {action.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.finance.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(stats.finance.balance)}
              </div>
              <p className="text-xs text-muted-foreground">
                Monthly: {formatCurrency(stats.finance.monthlyBalance)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.tasks.active}</div>
              <p className="text-xs text-muted-foreground">
                {stats.tasks.completionRate}% completion rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.social.totalContacts + stats.professional.totalContacts + stats.love.totalContacts + stats.business.totalContacts}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all networks
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.health.thisWeekEvents}</div>
              <p className="text-xs text-muted-foreground">
                {stats.health.todaysEvents} today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weekly Hours</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.professional.hoursWorkedThisWeek}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(stats.professional.weeklyEarnings)} earned
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Module Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="business">Business</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
            <TabsTrigger value="professional">Professional</TabsTrigger>
            <TabsTrigger value="love">Love</TabsTrigger>
            <TabsTrigger value="creators">Creators</TabsTrigger>
            <TabsTrigger value="health">Health</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Tasks Overview */}
              <DashboardCard title="Tasks & Productivity" description="Your task management summary" icon={Target}>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Total Tasks</span>
                    <span className="font-bold">{stats.tasks.total}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-yellow-600">{stats.tasks.inactive}</div>
                      <div className="text-xs text-muted-foreground">Inactive</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-blue-600">{stats.tasks.active}</div>
                      <div className="text-xs text-muted-foreground">Active</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600">{stats.tasks.completed}</div>
                      <div className="text-xs text-muted-foreground">Completed</div>
                    </div>
                  </div>
                  <Link to="/tasks">
                    <Button variant="outline" size="sm" className="w-full">
                      View Tasks <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </DashboardCard>

              {/* Finance Overview */}
              <DashboardCard title="Finance Overview" description="Your financial summary" icon={DollarSign}>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Net Worth</span>
                    <span className={`font-bold ${stats.finance.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(stats.finance.balance)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-green-600">{formatCurrency(stats.finance.monthlyIncome)}</div>
                      <div className="text-xs text-muted-foreground">Monthly Income</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-red-600">{formatCurrency(stats.finance.monthlyExpenses)}</div>
                      <div className="text-xs text-muted-foreground">Monthly Expenses</div>
                    </div>
                  </div>
                  <Link to="/money">
                    <Button variant="outline" size="sm" className="w-full">
                      View Finances <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </DashboardCard>
            </div>
          </TabsContent>

          <TabsContent value="business" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Business Contacts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.business.totalContacts}</div>
                  <p className="text-sm text-muted-foreground">Total business relationships</p>
                  <Link to="/business" className="mt-2 inline-block">
                    <Button variant="outline" size="sm">View Contacts</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Inventory Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.business.inventory}</div>
                  <p className="text-sm text-muted-foreground">
                    {stats.business.lowStockItems} low stock items
                  </p>
                  {stats.business.lowStockItems > 0 && (
                    <Badge variant="destructive" className="mt-1">Low Stock Alert</Badge>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Monthly Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Revenue</span>
                      <span className="font-bold text-green-600">{formatCurrency(stats.business.monthlyRevenue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Expenses</span>
                      <span className="font-bold text-red-600">{formatCurrency(stats.business.monthlyExpenses)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-sm font-medium">Profit Margin</span>
                      <span className="font-bold">{stats.business.profitMargin}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="social" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Social Network
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.social.totalContacts}</div>
                  <div className="text-sm text-muted-foreground">
                    {stats.social.friends} friends • {stats.social.colleagues} colleagues
                  </div>
                  <Link to="/social" className="mt-2 inline-block">
                    <Button variant="outline" size="sm">View Network</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.social.recentInteractions}</div>
                  <p className="text-sm text-muted-foreground">Interactions this month</p>
                  {stats.social.needsFollowUp > 0 && (
                    <Badge variant="outline" className="mt-1">
                      {stats.social.needsFollowUp} need follow-up
                    </Badge>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="h-5 w-5" />
                    Upcoming Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.social.upcomingBirthdays}</div>
                  <p className="text-sm text-muted-foreground">Birthdays next 30 days</p>
                  {stats.social.upcomingBirthdays > 0 && (
                    <Badge className="mt-1">Don't forget!</Badge>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="professional" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Work Network
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.professional.totalContacts}</div>
                  <p className="text-sm text-muted-foreground">Professional contacts</p>
                  <Link to="/professional" className="mt-2 inline-block">
                    <Button variant="outline" size="sm">View Network</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    This Week
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.professional.hoursWorkedThisWeek}</div>
                  <p className="text-sm text-muted-foreground">Hours worked</p>
                  <div className="text-lg font-bold text-green-600 mt-1">
                    {formatCurrency(stats.professional.weeklyEarnings)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plane className="h-5 w-5" />
                    PTO Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.professional.ptoRequests}</div>
                  <p className="text-sm text-muted-foreground">Total requests</p>
                  {stats.professional.pendingPTO > 0 && (
                    <Badge variant="outline" className="mt-1">
                      {stats.professional.pendingPTO} pending
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="love" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Loved Ones
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.love.totalContacts}</div>
                  <div className="text-sm text-muted-foreground">
                    {stats.love.family} family • {stats.love.significantOthers} partners
                  </div>
                  <Link to="/love" className="mt-2 inline-block">
                    <Button variant="outline" size="sm">View Family</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5" />
                    Important Dates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.love.keyDates}</div>
                  <p className="text-sm text-muted-foreground">Total key dates</p>
                  {stats.love.upcomingCelebrations > 0 && (
                    <Badge className="mt-1">
                      {stats.love.upcomingCelebrations} upcoming
                    </Badge>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Needs Attention
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.love.needsAttention}</div>
                  <p className="text-sm text-muted-foreground">Haven't contacted recently</p>
                  {stats.love.needsAttention > 0 && (
                    <Badge variant="outline" className="mt-1">Reach out!</Badge>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="creators" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="h-5 w-5" />
                    Platform Reach
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.creators.totalFollowers.toLocaleString()}</div>
                  <p className="text-sm text-muted-foreground">
                    Across {stats.creators.totalPlatforms} platforms
                  </p>
                  <Link to="/creators" className="mt-2 inline-block">
                    <Button variant="outline" size="sm">View Analytics</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Content Library
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.creators.totalContent}</div>
                  <p className="text-sm text-muted-foreground">
                    {stats.creators.publishedContent} published
                  </p>
                  <div className="text-lg font-bold text-purple-600 mt-1">
                    {stats.creators.totalEngagement.toLocaleString()} interactions
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Creator Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {formatCurrency(stats.creators.monthlyRevenue)}
                  </div>
                  <p className="text-sm text-muted-foreground">This month's earnings</p>
                  {stats.creators.upcomingLivestreams > 0 && (
                    <Badge className="mt-1">
                      {stats.creators.upcomingLivestreams} streams scheduled
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="health" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Fitness Activities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.health.recentActivities}</div>
                  <p className="text-sm text-muted-foreground">Recent workout sessions</p>
                  <Link to="/fitness" className="mt-2 inline-block">
                    <Button variant="outline" size="sm">View Fitness</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Calendar Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.health.upcomingEvents}</div>
                  <p className="text-sm text-muted-foreground">
                    {stats.health.todaysEvents} today • {stats.health.thisWeekEvents} this week
                  </p>
                  <Link to="/calendar" className="mt-2 inline-block">
                    <Button variant="outline" size="sm">View Calendar</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Health Tracking
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">Coming Soon</div>
                  <p className="text-sm text-muted-foreground">Health metrics integration</p>
                  <Link to="/health" className="mt-2 inline-block">
                    <Button variant="outline" size="sm">View Health</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <div className="grid gap-4">
              {/* Priority Alerts */}
              {stats.business.lowStockItems > 0 && (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <div>
                        <h4 className="font-medium text-red-800">Low Stock Alert</h4>
                        <p className="text-sm text-red-600">{stats.business.lowStockItems} items need restocking</p>
                      </div>
                      <Link to="/business" className="ml-auto">
                        <Button variant="outline" size="sm">Check Inventory</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}

              {stats.social.upcomingBirthdays > 0 && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Gift className="h-5 w-5 text-blue-600" />
                      <div>
                        <h4 className="font-medium text-blue-800">Upcoming Birthdays</h4>
                        <p className="text-sm text-blue-600">{stats.social.upcomingBirthdays} birthdays in the next 30 days</p>
                      </div>
                      <Link to="/social" className="ml-auto">
                        <Button variant="outline" size="sm">View Contacts</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}

              {(stats.social.needsFollowUp + stats.love.needsAttention) > 0 && (
                <Card className="border-yellow-200 bg-yellow-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <MessageCircle className="h-5 w-5 text-yellow-600" />
                      <div>
                        <h4 className="font-medium text-yellow-800">Follow-up Needed</h4>
                        <p className="text-sm text-yellow-600">
                          {stats.social.needsFollowUp + stats.love.needsAttention} contacts haven't been reached out to recently
                        </p>
                      </div>
                      <Link to="/social" className="ml-auto">
                        <Button variant="outline" size="sm">Review Contacts</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}

              {stats.professional.pendingPTO > 0 && (
                <Card className="border-purple-200 bg-purple-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Plane className="h-5 w-5 text-purple-600" />
                      <div>
                        <h4 className="font-medium text-purple-800">Pending PTO</h4>
                        <p className="text-sm text-purple-600">{stats.professional.pendingPTO} PTO requests awaiting approval</p>
                      </div>
                      <Link to="/professional" className="ml-auto">
                        <Button variant="outline" size="sm">Check Status</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* If no alerts */}
              {stats.business.lowStockItems === 0 && 
               stats.social.upcomingBirthdays === 0 && 
               (stats.social.needsFollowUp + stats.love.needsAttention) === 0 && 
               stats.professional.pendingPTO === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">All Clear!</h3>
                    <p className="text-muted-foreground">No urgent items require your attention right now.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default DashboardPage;