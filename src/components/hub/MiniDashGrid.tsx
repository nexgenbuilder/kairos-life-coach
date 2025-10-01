import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ListChecks, PieChart, PhoneCall, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface DashCard {
  id: string;
  icon: React.ElementType;
  title: string;
  metric: {
    value: string;
    caption: string;
  };
  route: string;
}

interface MiniDashGridProps {
  className?: string;
}

export function MiniDashGrid({ className }: MiniDashGridProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cards, setCards] = useState<DashCard[]>([
    {
      id: 'today_tasks',
      icon: ListChecks,
      title: 'Today',
      metric: { value: '0/0', caption: 'tasks' },
      route: '/tasks'
    },
    {
      id: 'spend_week',
      icon: PieChart,
      title: 'Spend This Week',
      metric: { value: '$0', caption: 'Money' },
      route: '/money'
    },
    {
      id: 'leads',
      icon: PhoneCall,
      title: 'Leads',
      metric: { value: '0', caption: 'contacts' },
      route: '/crm'
    },
    {
      id: 'streak',
      icon: Flame,
      title: 'Fitness Streak',
      metric: { value: '0', caption: 'days' },
      route: '/fitness'
    }
  ]);

  useEffect(() => {
    if (!user) return;

    const fetchMetrics = async () => {
      try {
        // Fetch today's tasks
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const { data: tasks } = await supabase
          .from('tasks')
          .select('id, status')
          .eq('user_id', user.id)
          .gte('created_at', today.toISOString());

        const completedTasks = tasks?.filter(t => t.status === 'done').length || 0;
        const totalTasks = tasks?.length || 0;

        // Fetch this week's expenses
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const { data: expenses } = await supabase
          .from('expenses')
          .select('amount')
          .eq('user_id', user.id)
          .gte('date', weekAgo.toISOString());

        const weeklySpend = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;

        // Fetch fitness streak (placeholder - could be enhanced)
        const { data: workouts } = await supabase
          .from('fitness_workouts')
          .select('workout_date')
          .eq('user_id', user.id)
          .order('workout_date', { ascending: false })
          .limit(7);

        const streak = workouts?.length || 0;

        // Update cards
        setCards(prev => prev.map(card => {
          if (card.id === 'today_tasks') {
            return { ...card, metric: { value: `${completedTasks}/${totalTasks}`, caption: 'tasks' } };
          }
          if (card.id === 'spend_week') {
            return { ...card, metric: { value: `$${Math.round(weeklySpend)}`, caption: 'Money' } };
          }
          if (card.id === 'streak') {
            return { ...card, metric: { value: `${streak}`, caption: 'days' } };
          }
          return card;
        }));
      } catch (error) {
        console.error('Error fetching metrics:', error);
      }
    };

    fetchMetrics();
    
    // Set up real-time subscription for tasks
    const tasksChannel = supabase
      .channel('tasks-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${user.id}` },
        () => fetchMetrics()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tasksChannel);
    };
  }, [user]);

  return (
    <div className={cn("grid grid-cols-2 gap-3 p-4", className)}>
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.id}
            className="cursor-pointer hover:shadow-glow-soft transition-all hover:scale-105"
            onClick={() => navigate(card.route)}
          >
            <CardContent className="p-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{card.metric.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{card.title}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
