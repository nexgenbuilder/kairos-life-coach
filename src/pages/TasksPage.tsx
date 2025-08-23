import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { CheckSquare, Clock, AlertCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const TasksPage = () => {
  const tasks = [
    { id: 1, title: 'Review quarterly reports', priority: 'high', due: 'Today' },
    { id: 2, title: 'Call dentist for appointment', priority: 'medium', due: 'Tomorrow' },
    { id: 3, title: 'Buy groceries', priority: 'low', due: 'This week' },
  ];

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">Stay organized and get things done</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DashboardCard
            title="Quick Add"
            description="Create a new task"
            icon={Plus}
          >
            <Button className="w-full bg-primary-gradient hover:opacity-90">
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </DashboardCard>
          
          <DashboardCard
            title="Today's Focus"
            description="3 tasks due today"
            icon={Clock}
          >
            <div className="space-y-2">
              {tasks.map(task => (
                <div key={task.id} className="flex items-center gap-2 p-2 bg-accent/30 rounded-lg">
                  <CheckSquare className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm flex-1 truncate">{task.title}</span>
                  <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'secondary' : 'outline'} className="text-xs">
                    {task.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </DashboardCard>
          
          <DashboardCard
            title="Progress"
            description="This week's completion"
            icon={CheckSquare}
          >
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Completed</span>
                <span className="font-semibold">12/18</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '67%' }}></div>
              </div>
              <p className="text-xs text-muted-foreground">67% completion rate</p>
            </div>
          </DashboardCard>
        </div>
        
        <div className="bg-accent/20 border border-border rounded-lg p-6 text-center">
          <p className="text-muted-foreground mb-3">
            💡 Try asking Kairos: "Add a task to call mom tomorrow" or "Show me my high priority tasks"
          </p>
          <Button variant="secondary">
            Start Task Chat
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default TasksPage;