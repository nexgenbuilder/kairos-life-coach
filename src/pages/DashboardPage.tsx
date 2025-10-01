import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { PageLoading } from '@/components/ui/loading-spinner';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
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
  
  // Connections Module (previously Social)
  connections: {
    totalConnections: number;
    socialConnections: number;
    communityConnections: number;
    groupsConnections: number;
    workConnections: number;
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
  
  // Health
  health: {
    recentMetrics: number;
    activeMedications: number;
    latestWeight: string;
    latestBloodPressure: string;
    thisWeekMetrics: number;
  };
  
  // Calendar
  calendar: {
    upcomingEvents: number;
    todaysEvents: number;
    thisWeekEvents: number;
  };
  
  // Fitness Module
  fitness: {
    totalWorkouts: number;
    thisWeekWorkouts: number;
    topExercise: string;
    totalCalories: number;
    activeGoals: number;
    averageWorkoutDuration: number;
  };
}

const DashboardPage = () => {
  const { user } = useAuth();
  const { activeContext, loading: orgLoading } = useOrganization();
  const isMobile = useIsMobile();
  const [stats, setStats] = useState<AllModuleStats>({
    tasks: { inactive: 0, active: 0, completed: 0, total: 0, completionRate: 0 },
    finance: { totalIncome: 0, totalExpenses: 0, balance: 0, monthlyIncome: 0, monthlyExpenses: 0, monthlyBalance: 0 },
    business: { totalContacts: 0, inventory: 0, lowStockItems: 0, monthlyRevenue: 0, monthlyExpenses: 0, profitMargin: 0, recentDeals: 0 },
    connections: { totalConnections: 0, socialConnections: 0, communityConnections: 0, groupsConnections: 0, workConnections: 0, recentInteractions: 0, upcomingBirthdays: 0, needsFollowUp: 0 },
    professional: { totalContacts: 0, workSchedules: 0, ptoRequests: 0, weeklyEarnings: 0, hoursWorkedThisWeek: 0, pendingPTO: 0 },
    love: { totalContacts: 0, family: 0, significantOthers: 0, upcomingCelebrations: 0, keyDates: 0, needsAttention: 0 },
    creators: { totalPlatforms: 0, totalFollowers: 0, totalContent: 0, publishedContent: 0, monthlyRevenue: 0, totalEngagement: 0, upcomingLivestreams: 0 },
    health: { recentMetrics: 0, activeMedications: 0, latestWeight: 'N/A', latestBloodPressure: 'N/A', thisWeekMetrics: 0 },
    calendar: { upcomingEvents: 0, todaysEvents: 0, thisWeekEvents: 0 },
    fitness: { totalWorkouts: 0, thisWeekWorkouts: 0, topExercise: 'None', totalCalories: 0, activeGoals: 0, averageWorkoutDuration: 0 }
  });
  const [isLoading, setIsLoading] = useState(true);

  // Expose refresh function globally for chat interface
  useEffect(() => {
    (window as any).refreshDashboard = fetchAllModuleStats;
    return () => {
      delete (window as any).refreshDashboard;
    };
  }, [user]);

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
        
        // Connections (previously Social)
        supabase.from('connection_categories').select('*').eq('user_id', user.id),
        supabase.from('interactions').select('*').eq('user_id', user.id).eq('module', 'connections').gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        
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
        
        // Health
        supabase.from('health_metrics').select('*').eq('user_id', user.id),
        supabase.from('medications').select('*').eq('user_id', user.id).eq('is_active', true),
        
        // Calendar
        supabase.from('events').select('*').eq('user_id', user.id),
        
        // Fitness
        supabase.from('fitness_workouts').select('*').eq('user_id', user.id),
        supabase.from('fitness_goals').select('*').eq('user_id', user.id).eq('is_active', true)
      ]);

      // Process results
      const [
        tasksResult, incomeResult, expensesResult,
        businessContactsResult, inventoryResult, businessRevenueResult, businessExpensesResult, dealsResult,
        socialContactsResult, socialInteractionsResult,
        professionalContactsResult, workSchedulesResult, ptoRequestsResult,
        loveContactsResult, keyDatesResult,
        contentPlatformsResult, contentCatalogResult, contentIncomeResult, livestreamResult,
        healthMetricsResult, medicationsResult,
        eventsResult, fitnessWorkoutsResult, fitnessGoalsResult
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

      // Process Connections - No longer using people table, just connection_categories
      const socialInteractions = socialInteractionsResult.status === 'fulfilled' ? socialInteractionsResult.value.data || [] : [];
      
      // Get total connections from all shared spaces using the new function
      const { data: connectionsCount } = await supabase
        .rpc('get_user_connections_count');
      
      // Get connections by category
      const { data: connectionsByCategory } = await supabase
        .rpc('get_user_connections_by_category');
      
      const categoryCounts = {
        social: 0,
        community: 0,
        groups: 0,
        work_business: 0
      };
      
      if (connectionsByCategory) {
        connectionsByCategory.forEach((cat: any) => {
          if (cat.category === 'social') categoryCounts.social = Number(cat.count);
          if (cat.category === 'community') categoryCounts.community = Number(cat.count);
          if (cat.category === 'groups') categoryCounts.groups = Number(cat.count);
          if (cat.category === 'work_business') categoryCounts.work_business = Number(cat.count);
        });
      }

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

      // Process Health
      const healthMetrics = healthMetricsResult.status === 'fulfilled' ? healthMetricsResult.value.data || [] : [];
      const medications = medicationsResult.status === 'fulfilled' ? medicationsResult.value.data || [] : [];
      
      const recentMetrics = healthMetrics.filter(metric => {
        const metricDate = new Date(metric.date);
        return metricDate >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      }).length;
      
      const thisWeekMetrics = healthMetrics.filter(metric => {
        const metricDate = new Date(metric.date);
        return metricDate >= startOfWeek && metricDate <= endOfWeek;
      }).length;
      
      const latestWeight = healthMetrics.find(m => m.metric_type === 'weight')?.value || 'N/A';
      const latestBP = healthMetrics.find(m => m.metric_type === 'blood_pressure')?.value || 'N/A';

      // Process Events
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
        connections: {
          totalConnections: connectionsCount || 0,
          socialConnections: categoryCounts.social,
          communityConnections: categoryCounts.community,
          groupsConnections: categoryCounts.groups,
          workConnections: categoryCounts.work_business,
          recentInteractions: socialInteractions.length,
          upcomingBirthdays: 0, // Not tracked in connections
          needsFollowUp: 0 // Not tracked in connections
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
          recentMetrics,
          activeMedications: medications.length,
          latestWeight: latestWeight + (latestWeight !== 'N/A' ? ' lbs' : ''),
          latestBloodPressure: latestBP + (latestBP !== 'N/A' ? ' mmHg' : ''),
          thisWeekMetrics
        },
        calendar: {
          upcomingEvents,
          todaysEvents,
          thisWeekEvents
        },
        fitness: {
          totalWorkouts: fitnessWorkoutsResult.status === 'fulfilled' ? (fitnessWorkoutsResult.value.data || []).length : 0,
          thisWeekWorkouts: fitnessWorkoutsResult.status === 'fulfilled' ? 
            (fitnessWorkoutsResult.value.data || []).filter((w: any) => {
              const workoutDate = new Date(w.workout_date);
              return workoutDate >= startOfWeek && workoutDate <= endOfWeek;
            }).length : 0,
          topExercise: fitnessWorkoutsResult.status === 'fulfilled' ? (() => {
            const workouts = fitnessWorkoutsResult.value.data || [];
            const exerciseCounts: { [key: string]: number } = {};
            workouts.forEach((w: any) => {
              exerciseCounts[w.exercise_name] = (exerciseCounts[w.exercise_name] || 0) + 1;
            });
            return Object.entries(exerciseCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';
          })() : 'None',
          totalCalories: fitnessWorkoutsResult.status === 'fulfilled' ? 
            (fitnessWorkoutsResult.value.data || []).reduce((sum: number, w: any) => sum + (w.calories_burned || 0), 0) : 0,
          activeGoals: fitnessGoalsResult.status === 'fulfilled' ? (fitnessGoalsResult.value.data || []).length : 0,
          averageWorkoutDuration: fitnessWorkoutsResult.status === 'fulfilled' ? (() => {
            const workouts = fitnessWorkoutsResult.value.data || [];
            const workoutsWithDuration = workouts.filter((w: any) => w.duration_minutes);
            return workoutsWithDuration.length > 0 ? 
              Math.round(workoutsWithDuration.reduce((sum: number, w: any) => sum + w.duration_minutes, 0) / workoutsWithDuration.length) : 0;
          })() : 0
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

  // If organization is still loading, show loading state
  if (orgLoading) {
    return (
      <AppLayout>
        <PageLoading message="Loading your workspace..." />
      </AppLayout>
    );
  }

  // If user doesn't have an active context, redirect to onboarding
  if (!orgLoading && !activeContext) {
    return <Navigate to="/onboarding" replace />;
  }

  if (isLoading) {
    return (
      <AppLayout>
        <PageLoading message="Loading comprehensive dashboard..." />
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
      <ErrorBoundary>
      <div className="w-full max-w-full overflow-x-hidden">
      <div className={`${isMobile ? 'p-2 space-y-3' : 'p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 md:space-y-8'} w-full`}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
          <div className="space-y-1 sm:space-y-2">
            <h1 className={`${isMobile ? 'text-xl' : 'text-2xl sm:text-3xl md:text-4xl'} font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent`}>
              Life Dashboard
            </h1>
            <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm sm:text-base md:text-lg'}`}>
              Complete overview of your personal and professional life
            </p>
          </div>
          
          <div className={`flex flex-wrap ${isMobile ? 'gap-1.5' : 'gap-2'}`}>
            {quickActions.map((action) => (
              <Link key={action.label} to={action.href}>
                <Button variant="outline" size={isMobile ? "sm" : "sm"} className={`flex items-center ${isMobile ? 'gap-1 text-xs px-2' : 'gap-1.5 sm:gap-2 text-xs sm:text-sm'}`}>
                  <action.icon className={`${isMobile ? 'h-3 w-3' : 'h-3 w-3 sm:h-4 sm:w-4'}`} />
                  <span className="hidden sm:inline">{action.label}</span>
                  <span className="sm:hidden">{action.label.split(' ')[1] || action.label.split(' ')[0]}</span>
                </Button>
              </Link>
            ))}
          </div>
        </div>

        {/* Key Metrics Overview */}
        <div className={`grid ${isMobile ? 'grid-cols-1 gap-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4'}`}>
          <Card>
            <CardHeader className={`flex flex-row items-center justify-between space-y-0 pb-2 ${isMobile ? 'p-2' : 'p-4 sm:p-6'}`}>
              <CardTitle className="text-xs sm:text-sm font-medium">Net Worth</CardTitle>
              <DollarSign className={`${isMobile ? 'h-3 w-3' : 'h-3 w-3 sm:h-4 sm:w-4'} text-muted-foreground`} />
            </CardHeader>
            <CardContent className={`${isMobile ? 'p-2 pt-0' : 'p-4 pt-0 sm:p-6 sm:pt-0'}`}>
              <div className={`${isMobile ? 'text-base' : 'text-xl sm:text-2xl'} font-bold ${stats.finance.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(stats.finance.balance)}
              </div>
              <p className="text-xs text-muted-foreground">
                Monthly: {formatCurrency(stats.finance.monthlyBalance)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">Active Tasks</CardTitle>
              <Target className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
              <div className="text-xl sm:text-2xl font-bold">{stats.tasks.active}</div>
              <p className="text-xs text-muted-foreground">
                {stats.tasks.completionRate}% completion rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Contacts</CardTitle>
              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
              <div className="text-xl sm:text-2xl font-bold">
                {stats.connections.totalConnections + stats.professional.totalContacts + stats.love.totalContacts + stats.business.totalContacts}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all networks
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">This Week</CardTitle>
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
              <div className="text-xl sm:text-2xl font-bold">{stats.health.thisWeekMetrics}</div>
              <p className="text-xs text-muted-foreground">
                Health metrics this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">Weekly Hours</CardTitle>
              <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
              <div className="text-xl sm:text-2xl font-bold">{stats.professional.hoursWorkedThisWeek}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(stats.professional.weeklyEarnings)} earned
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Module Tabs */}
        <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
          <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
            <TabsList className="inline-flex w-auto min-w-full h-auto p-1 gap-1">
              <TabsTrigger value="overview" className="text-xs sm:text-sm px-2 sm:px-3 whitespace-nowrap">Overview</TabsTrigger>
              <TabsTrigger value="business" className="text-xs sm:text-sm px-2 sm:px-3 whitespace-nowrap">Business</TabsTrigger>
              <TabsTrigger value="social" className="text-xs sm:text-sm px-2 sm:px-3 whitespace-nowrap">Social</TabsTrigger>
              <TabsTrigger value="professional" className="text-xs sm:text-sm px-2 sm:px-3 whitespace-nowrap">Professional</TabsTrigger>
              <TabsTrigger value="love" className="text-xs sm:text-sm px-2 sm:px-3 whitespace-nowrap">Love</TabsTrigger>
              <TabsTrigger value="creators" className="text-xs sm:text-sm px-2 sm:px-3 whitespace-nowrap">Creators</TabsTrigger>
              <TabsTrigger value="health" className="text-xs sm:text-sm px-2 sm:px-3 whitespace-nowrap">Health</TabsTrigger>
              <TabsTrigger value="alerts" className="text-xs sm:text-sm px-2 sm:px-3 whitespace-nowrap">Alerts</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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

          <TabsContent value="business" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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

          <TabsContent value="social" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Connections
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.connections.totalConnections}</div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>{stats.connections.socialConnections} social</div>
                    <div>{stats.connections.workConnections} work/business</div>
                    <div>{stats.connections.communityConnections} community</div>
                  </div>
                  <Link to="/connections" className="mt-2 inline-block">
                    <Button variant="outline" size="sm">View Connections</Button>
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
                  <div className="text-3xl font-bold">{stats.connections.recentInteractions}</div>
                  <p className="text-sm text-muted-foreground">Interactions this month</p>
                  {stats.connections.needsFollowUp > 0 && (
                    <Badge variant="outline" className="mt-1">
                      {stats.connections.needsFollowUp} need follow-up
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
                  <div className="text-3xl font-bold">{stats.connections.upcomingBirthdays}</div>
                  <p className="text-sm text-muted-foreground">Birthdays next 30 days</p>
                  {stats.connections.upcomingBirthdays > 0 && (
                    <Badge className="mt-1">Don't forget!</Badge>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="professional" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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

          <TabsContent value="love" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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

          <TabsContent value="creators" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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

          <TabsContent value="health" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Fitness Tracking
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Total Workouts</p>
                        <p className="text-xl font-bold">{stats.fitness.totalWorkouts}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">This Week</p>
                        <p className="text-xl font-bold">{stats.fitness.thisWeekWorkouts}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Top Exercise</p>
                        <p className="text-sm font-medium truncate">{stats.fitness.topExercise}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Calories Burned</p>
                        <p className="text-xl font-bold">{stats.fitness.totalCalories}</p>
                      </div>
                    </div>
                    <Link to="/fitness" className="mt-2 inline-block">
                      <Button variant="outline" size="sm">View Fitness</Button>
                    </Link>
                  </div>
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
                  <div className="text-3xl font-bold">{stats.calendar.upcomingEvents}</div>
                  <p className="text-sm text-muted-foreground">
                    {stats.calendar.todaysEvents} today • {stats.calendar.thisWeekEvents} this week
                  </p>
                  <Link to="/calendar" className="mt-2 inline-block">
                    <Button variant="outline" size="sm">View Calendar</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Health Tracking
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Recent Metrics</p>
                        <p className="text-xl font-bold">{stats.health.recentMetrics}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Active Medications</p>
                        <p className="text-xl font-bold">{stats.health.activeMedications}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Latest Weight</p>
                        <p className="text-sm font-medium">{stats.health.latestWeight}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Blood Pressure</p>
                        <p className="text-sm font-medium">{stats.health.latestBloodPressure}</p>
                      </div>
                    </div>
                    <Link to="/health" className="mt-2 inline-block">
                      <Button variant="outline" size="sm">View Health</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-3 sm:space-y-4 md:space-y-6">
            <div className="grid gap-3 sm:gap-4">
              {/* Priority Alerts */}
              {stats.business.lowStockItems > 0 && (
                <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                      <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-red-800 dark:text-red-300 text-sm sm:text-base">Low Stock Alert</h4>
                        <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">{stats.business.lowStockItems} items need restocking</p>
                      </div>
                      <Link to="/business" className="w-full sm:w-auto sm:ml-auto">
                        <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs sm:text-sm">Check Inventory</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}

              {stats.connections.upcomingBirthdays > 0 && (
                <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                      <Gift className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-blue-800 dark:text-blue-300 text-sm sm:text-base">Upcoming Birthdays</h4>
                        <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400">{stats.connections.upcomingBirthdays} birthdays in the next 30 days</p>
                      </div>
                      <Link to="/connections" className="w-full sm:w-auto sm:ml-auto">
                        <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs sm:text-sm">View Contacts</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}

              {(stats.connections.needsFollowUp + stats.love.needsAttention) > 0 && (
                <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                      <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-yellow-800 dark:text-yellow-300 text-sm sm:text-base">Follow-up Needed</h4>
                        <p className="text-xs sm:text-sm text-yellow-600 dark:text-yellow-400">
                          {stats.connections.needsFollowUp + stats.love.needsAttention} contacts haven't been reached out to recently
                        </p>
                      </div>
                      <Link to="/connections" className="w-full sm:w-auto sm:ml-auto">
                        <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs sm:text-sm">Review Contacts</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}

              {stats.professional.pendingPTO > 0 && (
                <Card className="border-purple-200 bg-purple-50 dark:border-purple-900 dark:bg-purple-950">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                      <Plane className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-purple-800 dark:text-purple-300 text-sm sm:text-base">Pending PTO</h4>
                        <p className="text-xs sm:text-sm text-purple-600 dark:text-purple-400">{stats.professional.pendingPTO} PTO requests awaiting approval</p>
                      </div>
                      <Link to="/professional" className="w-full sm:w-auto sm:ml-auto">
                        <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs sm:text-sm">Check Status</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* If no alerts */}
              {stats.business.lowStockItems === 0 && 
               stats.connections.upcomingBirthdays === 0 && 
               (stats.connections.needsFollowUp + stats.love.needsAttention) === 0 && 
               stats.professional.pendingPTO === 0 && (
                 <Card>
                   <CardContent className="p-6 sm:p-8 text-center">
                     <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12 text-green-500 mx-auto mb-3 sm:mb-4" />
                     <h3 className="text-base sm:text-lg font-medium mb-2">All Clear!</h3>
                     <p className="text-muted-foreground text-sm sm:text-base">No urgent items require your attention right now.</p>
                   </CardContent>
                 </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
        </div>
      </div>
      </ErrorBoundary>
    </AppLayout>
  );
};

export default DashboardPage;