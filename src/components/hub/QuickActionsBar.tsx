import React from 'react';
import { CheckSquare, CalendarCheck2, Receipt, Dumbbell, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QuickAction {
  id: string;
  icon: React.ElementType;
  label: string;
  action: () => void;
}

interface QuickActionsBarProps {
  onCreateTask: () => void;
  onPlanDay: () => void;
  onLogExpense: () => void;
  onLogWorkout: () => void;
  onAddLead: () => void;
  className?: string;
}

export function QuickActionsBar({
  onCreateTask,
  onPlanDay,
  onLogExpense,
  onLogWorkout,
  onAddLead,
  className
}: QuickActionsBarProps) {
  const actions: QuickAction[] = [
    { id: 'create_task', icon: CheckSquare, label: 'Create Task', action: onCreateTask },
    { id: 'plan_day', icon: CalendarCheck2, label: 'Plan My Day', action: onPlanDay },
    { id: 'log_expense', icon: Receipt, label: 'Log Expense', action: onLogExpense },
    { id: 'log_workout', icon: Dumbbell, label: 'Log Workout', action: onLogWorkout },
    { id: 'add_contact', icon: UserPlus, label: 'Add Lead', action: onAddLead }
  ];

  return (
    <div className={cn(
      "w-full overflow-x-auto scrollbar-hide",
      "relative after:absolute after:right-0 after:top-0 after:bottom-0 after:w-8",
      "after:bg-gradient-to-l after:from-background/80 after:to-transparent after:pointer-events-none",
      className
    )}>
      <div className="flex gap-2 p-3 md:p-4 min-w-max">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.id}
              onClick={action.action}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 whitespace-nowrap rounded-full px-3 md:px-4 py-2 hover:bg-accent hover:scale-105 transition-all text-xs md:text-sm"
            >
              <Icon className="h-3.5 w-3.5 md:h-4 md:w-4" />
              <span className="font-medium">{action.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
