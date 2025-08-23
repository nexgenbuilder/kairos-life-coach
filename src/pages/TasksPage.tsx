import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { TaskForm } from '@/components/tasks/TaskForm';
import { TaskList } from '@/components/tasks/TaskList';

const TasksPage = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleTaskCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">Stay organized and get things done</p>
        </div>
        
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <TaskForm onTaskCreated={handleTaskCreated} />
          </div>
          <div>
            <TaskList refreshTrigger={refreshTrigger} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default TasksPage;