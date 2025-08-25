import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, Play, CheckCircle, Clock, Archive } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string | null;
  due_date: string | null;
  created_at: string;
  activated_at: string | null;
  completed_at: string | null;
  updated_at: string;
}

interface TaskStatusManagerProps {
  refreshTrigger: number;
}

const TaskStatusManager: React.FC<TaskStatusManagerProps> = ({ refreshTrigger }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tasks",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const updates: any = { 
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      if (newStatus === 'in-progress') {
        updates.activated_at = new Date().toISOString();
      } else if (newStatus === 'completed') {
        updates.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId);

      if (error) throw error;

      setTasks(tasks.map(task => 
        task.id === taskId 
          ? { ...task, ...updates }
          : task
      ));

      toast({
        title: "Success",
        description: `Task marked as ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating task status:', error);
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      setTasks(tasks.filter(task => task.id !== taskId));
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user, refreshTrigger]);

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString();
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  const getTaskStats = () => {
    const todo = getTasksByStatus('todo').length;
    const inProgress = getTasksByStatus('in-progress').length;
    const completed = getTasksByStatus('completed').length;
    
    return { todo, inProgress, completed };
  };

  const TaskCard = ({ task }: { task: Task }) => (
    <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="font-medium">{task.title}</h3>
          {task.description && (
            <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 ml-4">
          {task.priority && (
            <Badge variant={getPriorityColor(task.priority)}>
              {task.priority}
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteTask(task.id)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Due: {formatDate(task.due_date)}
        </div>
        
        <div className="flex gap-2">
          {task.status === 'todo' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateTaskStatus(task.id, 'in-progress')}
            >
              <Play className="h-4 w-4 mr-1" />
              Start
            </Button>
          )}
          
          {task.status === 'in-progress' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateTaskStatus(task.id, 'completed')}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Complete
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading tasks...</div>
        </CardContent>
      </Card>
    );
  }

  const stats = getTaskStats();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Management</CardTitle>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{stats.todo} Todo</span>
          </div>
          <div className="flex items-center gap-1">
            <Play className="h-4 w-4" />
            <span>{stats.inProgress} In Progress</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4" />
            <span>{stats.completed} Completed</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="todo" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="todo">Todo ({stats.todo})</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress ({stats.inProgress})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({stats.completed})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="todo" className="space-y-4 mt-4">
            {getTasksByStatus('todo').map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
            {getTasksByStatus('todo').length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No todo tasks
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="in-progress" className="space-y-4 mt-4">
            {getTasksByStatus('in-progress').map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
            {getTasksByStatus('in-progress').length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No tasks in progress
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="completed" className="space-y-4 mt-4">
            {getTasksByStatus('completed').map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
            {getTasksByStatus('completed').length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No completed tasks
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TaskStatusManager;