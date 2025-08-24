import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckSquare, Clock, Calendar, Heart, Dumbbell, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { format, isToday, startOfDay, endOfDay } from 'date-fns';

interface TodayItem {
  id: string;
  title: string;
  type: 'task' | 'event' | 'expense' | 'income' | 'workout' | 'meal';
  status?: string;
  time?: string;
  completed?: boolean;
  priority?: string;
  amount?: number;
}

const TodayPage = () => {
  const { user } = useAuth();
  const [todayItems, setTodayItems] = useState<TodayItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadTodayItems();
    }
  }, [user]);

  const loadTodayItems = async () => {
    try {
      setIsLoading(true);
      const today = new Date();
      const startDay = startOfDay(today);
      const endDay = endOfDay(today);

      // Load active tasks
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'active');

      if (tasksError) throw tasksError;

      // Load today's events
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user?.id)
        .gte('start_time', startDay.toISOString())
        .lte('start_time', endDay.toISOString());

      if (eventsError) throw eventsError;

      // Load today's expenses (due dates)
      const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user?.id)
        .eq('date', format(today, 'yyyy-MM-dd'));

      if (expensesError) throw expensesError;

      // Load today's income
      const { data: income, error: incomeError } = await supabase
        .from('income')
        .select('*')
        .eq('user_id', user?.id)
        .gte('date', startDay.toISOString())
        .lte('date', endDay.toISOString());

      if (incomeError) throw incomeError;

      // Load scheduled workouts from localStorage
      const storedWorkouts = localStorage.getItem(`scheduled_workouts_${user?.id}`);
      const scheduledWorkouts = storedWorkouts ? JSON.parse(storedWorkouts) : [];
      
      const todayWorkouts = scheduledWorkouts.filter((workout: any) => 
        workout.scheduled_date === format(today, 'yyyy-MM-dd') && !workout.completed
      );

      // Combine all items
      const items: TodayItem[] = [
        ...(tasks || []).map(task => ({
          id: task.id,
          title: task.title,
          type: 'task' as const,
          status: task.status,
          priority: task.priority,
          completed: task.status === 'completed'
        })),
        ...(events || []).map(event => ({
          id: event.id,
          title: event.title,
          type: event.title.startsWith('Workout:') ? 'workout' as const : 'event' as const,
          time: format(new Date(event.start_time), 'HH:mm'),
          isWorkout: event.title.startsWith('Workout:')
        })),
        ...(expenses || []).map(expense => ({
          id: expense.id,
          title: `${expense.description} - $${expense.amount}`,
          type: 'expense' as const,
          status: expense.category,
          amount: expense.amount
        })),
        ...(income || []).map(incomeItem => ({
          id: incomeItem.id,
          title: `${incomeItem.description} - $${incomeItem.amount}`,
          type: 'income' as const,
          status: incomeItem.category,
          amount: incomeItem.amount
        })),
        ...todayWorkouts.map((workout: any) => ({
          id: workout.id,
          title: workout.name,
          type: 'workout' as const,
          time: workout.scheduled_time,
          status: 'scheduled'
        }))
      ];

      setTodayItems(items);
    } catch (error) {
      console.error('Error loading today items:', error);
      toast.error('Failed to load today\'s items');
    } finally {
      setIsLoading(false);
    }
  };

  const completeWorkout = async (workoutId: string) => {
    try {
      // Update scheduled workout to completed
      const storedWorkouts = localStorage.getItem(`scheduled_workouts_${user?.id}`);
      if (storedWorkouts) {
        const workouts = JSON.parse(storedWorkouts);
        const updatedWorkouts = workouts.map((w: any) => 
          w.id === workoutId ? { ...w, completed: true } : w
        );
        localStorage.setItem(`scheduled_workouts_${user?.id}`, JSON.stringify(updatedWorkouts));
      }

      // Remove from today's items
      setTodayItems(items => items.filter(item => item.id !== workoutId));
      toast.success('Workout completed!');
    } catch (error) {
      console.error('Error completing workout:', error);
      toast.error('Failed to complete workout');
    }
  };

  const toggleTaskCompletion = async (taskId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'completed' ? 'active' : 'completed';
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: newStatus,
          completed_at: newStatus === 'completed' ? new Date().toISOString() : null
        })
        .eq('id', taskId);

      if (error) throw error;

      // Update local state
      setTodayItems(items => 
        items.map(item => 
          item.id === taskId 
            ? { ...item, status: newStatus, completed: newStatus === 'completed' }
            : item
        )
      );

      toast.success(`Task ${newStatus === 'completed' ? 'completed' : 'reactivated'}`);
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'task': return CheckSquare;
      case 'event': return Calendar;
      case 'expense': return DollarSign;
      case 'income': return DollarSign;
      case 'workout': return Dumbbell;
      case 'meal': return Heart;
      default: return Clock;
    }
  };

  const getItemColor = (type: string) => {
    switch (type) {
      case 'task': return 'bg-blue-500/10 text-blue-700';
      case 'event': return 'bg-purple-500/10 text-purple-700';
      case 'expense': return 'bg-red-500/10 text-red-700';
      case 'income': return 'bg-green-500/10 text-green-700';
      case 'workout': return 'bg-green-500/10 text-green-700';
      case 'meal': return 'bg-orange-500/10 text-orange-700';
      default: return 'bg-gray-500/10 text-gray-700';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/10 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-500/10 text-green-700 border-green-200';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-48"></div>
            <div className="h-4 bg-muted rounded w-96"></div>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Today
          </h1>
          <p className="text-muted-foreground mt-2">
            Your daily overview - {format(new Date(), 'EEEE, MMMM do, yyyy')}
          </p>
        </div>

        {todayItems.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nothing scheduled for today</h3>
              <p className="text-muted-foreground">
                Add tasks, events, or other items to see them here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {todayItems.map((item) => {
              const Icon = getItemIcon(item.type);
              return (
                <Card key={item.id} className={`transition-all duration-200 hover:shadow-md ${
                  item.completed ? 'opacity-60' : ''
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${getItemColor(item.type)}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <h3 className={`font-medium ${item.completed ? 'line-through' : ''}`}>
                            {item.title}
                          </h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className={getItemColor(item.type)}>
                              {item.type}
                            </Badge>
                            {item.priority && (
                              <Badge variant="outline" className={getPriorityColor(item.priority)}>
                                {item.priority}
                              </Badge>
                            )}
                            {item.time && (
                              <Badge variant="outline">
                                {item.time}
                              </Badge>
                            )}
                            {item.status && item.type !== 'task' && (
                              <Badge variant="outline">
                                {item.status}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {item.type === 'task' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleTaskCompletion(item.id, item.status || 'active')}
                          className={item.completed ? 'text-green-600' : ''}
                        >
                          {item.completed ? 'Completed' : 'Mark Complete'}
                        </Button>
                      )}

                      {item.type === 'workout' && !item.completed && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => completeWorkout(item.id)}
                          className="text-green-600"
                        >
                          Complete Workout
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default TodayPage;