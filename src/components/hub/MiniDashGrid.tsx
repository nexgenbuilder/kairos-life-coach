import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ListChecks, PieChart, PhoneCall, Flame, Calendar, Heart, Video, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import { useDashboardConfig } from '@/hooks/useDashboardConfig';
import { Skeleton } from '@/components/ui/skeleton';

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

const CARD_CONFIG: Record<string, { icon: React.ElementType; title: string; route: string }> = {
  today_tasks: { icon: ListChecks, title: 'Today', route: '/tasks' },
  spend_week: { icon: PieChart, title: 'Spend This Week', route: '/money' },
  leads: { icon: PhoneCall, title: 'Leads', route: '/crm' },
  fitness_streak: { icon: Flame, title: 'Fitness Streak', route: '/fitness' },
  upcoming_events: { icon: Calendar, title: 'Upcoming Events', route: '/calendar' },
  health_metrics: { icon: Heart, title: 'Health Summary', route: '/health' },
  content_performance: { icon: Video, title: 'Content Performance', route: '/creators' },
  crypto_portfolio: { icon: TrendingUp, title: 'Crypto Portfolio', route: '/crypto' },
};

interface MiniDashGridProps {
  className?: string;
}

export function MiniDashGrid({ className }: MiniDashGridProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeContext } = useOrganization();
  const { getEnabledCards, loading: configLoading } = useDashboardConfig();
  const [cards, setCards] = useState<DashCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !activeContext || configLoading) return;

    const fetchMetrics = async () => {
      try {
        const enabledCards = getEnabledCards();
        const orgId = activeContext.type === 'individual' ? null : activeContext.id;
        
        const fetchedCards: DashCard[] = await Promise.all(
          enabledCards.map(async (configCard) => {
            const config = CARD_CONFIG[configCard.id];
            let metric = { value: '0', caption: '' };

            try {
              switch (configCard.id) {
                case 'today_tasks': {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  
                  let query = supabase
                    .from('tasks')
                    .select('id, status')
                    .eq('user_id', user.id)
                    .gte('created_at', today.toISOString());
                  
                  if (orgId) query = query.eq('organization_id', orgId);
                  
                  const { data: tasks } = await query;
                  const completedTasks = tasks?.filter(t => t.status === 'done').length || 0;
                  const totalTasks = tasks?.length || 0;
                  metric = { value: `${completedTasks}/${totalTasks}`, caption: 'tasks' };
                  break;
                }
                
                case 'spend_week': {
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  
                  let query = supabase
                    .from('expenses')
                    .select('amount')
                    .eq('user_id', user.id)
                    .gte('date', weekAgo.toISOString());
                  
                  if (orgId) query = query.eq('organization_id', orgId);
                  
                  const { data: expenses } = await query;
                  const weeklySpend = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;
                  metric = { value: `$${Math.round(weeklySpend)}`, caption: 'this week' };
                  break;
                }
                
                case 'leads': {
                  let query = supabase
                    .from('deals')
                    .select('id, stage')
                    .eq('user_id', user.id);
                  
                  if (orgId) query = query.eq('organization_id', orgId);
                  
                  const { data: deals } = await query;
                  const activeLeads = deals?.filter(d => d.stage !== 'closed').length || 0;
                  metric = { value: `${activeLeads}`, caption: 'active' };
                  break;
                }
                
                case 'fitness_streak': {
                  let query = supabase
                    .from('fitness_workouts')
                    .select('workout_date')
                    .eq('user_id', user.id)
                    .order('workout_date', { ascending: false })
                    .limit(7);
                  
                  if (orgId) query = query.eq('organization_id', orgId);
                  
                  const { data: workouts } = await query;
                  metric = { value: `${workouts?.length || 0}`, caption: 'days' };
                  break;
                }
                
                case 'upcoming_events': {
                  const now = new Date();
                  let query = supabase
                    .from('events')
                    .select('id')
                    .eq('user_id', user.id)
                    .gte('start_time', now.toISOString())
                    .limit(10);
                  
                  if (orgId) query = query.eq('organization_id', orgId);
                  
                  const { data: events } = await query;
                  metric = { value: `${events?.length || 0}`, caption: 'upcoming' };
                  break;
                }
                
                case 'health_metrics': {
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  
                  let query = supabase
                    .from('health_metrics')
                    .select('id')
                    .eq('user_id', user.id)
                    .gte('date', weekAgo.toISOString());
                  
                  if (orgId) query = query.eq('organization_id', orgId);
                  
                  const { data: metrics } = await query;
                  metric = { value: `${metrics?.length || 0}`, caption: 'logged' };
                  break;
                }
                
                case 'content_performance': {
                  let query = supabase
                    .from('content_catalog')
                    .select('view_count')
                    .eq('user_id', user.id)
                    .eq('status', 'published');
                  
                  if (orgId) query = query.eq('organization_id', orgId);
                  
                  const { data: content } = await query;
                  const totalViews = content?.reduce((sum, c) => sum + (c.view_count || 0), 0) || 0;
                  metric = { value: `${totalViews}`, caption: 'views' };
                  break;
                }
                
                case 'crypto_portfolio': {
                  let query = supabase
                    .from('crypto_portfolio')
                    .select('quantity, current_price_cents')
                    .eq('user_id', user.id);
                  
                  if (orgId) query = query.eq('organization_id', orgId);
                  
                  const { data: portfolio } = await query;
                  const totalValue = portfolio?.reduce((sum, p) => 
                    sum + (Number(p.quantity) * (Number(p.current_price_cents) / 100)), 0
                  ) || 0;
                  metric = { value: `$${Math.round(totalValue)}`, caption: 'portfolio' };
                  break;
                }
              }
            } catch (err) {
              console.error(`Error fetching ${configCard.id}:`, err);
            }

            return {
              id: configCard.id,
              icon: config.icon,
              title: config.title,
              metric,
              route: config.route,
            };
          })
        );

        setCards(fetchedCards);
      } catch (error) {
        console.error('Error fetching metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('dashboard-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${user.id}` },
        () => fetchMetrics()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, activeContext, configLoading, getEnabledCards]);

  if (loading || configLoading) {
    return (
      <div className={cn("grid grid-cols-2 gap-3 p-3 md:p-4", className)}>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-3 md:p-4">
              <div className="flex flex-col gap-2 md:gap-3">
                <Skeleton className="h-4 w-4 md:h-5 md:w-5" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className={cn("p-6 text-center", className)}>
        <p className="text-sm text-muted-foreground">
          No dashboard cards enabled. Configure your dashboard in Settings.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-2 gap-3 p-3 md:p-4", className)}>
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.id}
            className="cursor-pointer hover:shadow-glow-soft transition-smooth hover:scale-105 active:scale-95"
            onClick={() => navigate(card.route)}
          >
            <CardContent className="p-3 md:p-4">
              <div className="flex flex-col gap-2 md:gap-3">
                <div className="flex items-center justify-between">
                  <Icon className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                </div>
                <div>
                  <div className="text-xl md:text-2xl font-bold">{card.metric.value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 md:mt-1">
                    {card.title}
                    {card.metric.caption && ` • ${card.metric.caption}`}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
