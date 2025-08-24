import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { TaskForm } from '@/components/tasks/TaskForm';
import { CategoryManager } from '@/components/tasks/CategoryManager';
import TaskStatusManager from '@/components/tasks/TaskStatusManager';

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
        
        <div className="space-y-6">
          <CategoryManager />
          <TaskForm onTaskCreated={handleTaskCreated} />
          <TaskStatusManager refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </AppLayout>
  );
};

export default TasksPage;