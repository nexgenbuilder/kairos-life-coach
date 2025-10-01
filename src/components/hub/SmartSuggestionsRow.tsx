import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, Target, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Suggestion {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  action: () => void;
}

interface SmartSuggestionsRowProps {
  onPlanDay: () => void;
  onCreateTask: () => void;
  onLogExpense: () => void;
  className?: string;
}

export function SmartSuggestionsRow({
  onPlanDay,
  onCreateTask,
  onLogExpense,
  className
}: SmartSuggestionsRowProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  useEffect(() => {
    // Time-based contextual suggestions
    const hour = new Date().getHours();
    let contextualSuggestions: Suggestion[] = [];

    if (hour >= 5 && hour < 12) {
      // Morning suggestions
      contextualSuggestions = [
        {
          id: 'plan_day',
          title: 'Plan your day',
          subtitle: 'Block 2 focus sessions',
          icon: Target,
          action: onPlanDay
        },
        {
          id: 'add_tasks',
          title: 'Add 3 priority tasks',
          subtitle: 'Quick add sheet',
          icon: Zap,
          action: onCreateTask
        }
      ];
    } else if (hour >= 18 && hour < 24) {
      // Evening suggestions
      contextualSuggestions = [
        {
          id: 'log_expenses',
          title: "Log today's expenses",
          subtitle: 'Keep Money tight',
          icon: TrendingUp,
          action: onLogExpense
        },
        {
          id: 'review_tomorrow',
          title: 'Review tomorrow',
          subtitle: 'Pre-game in 2 minutes',
          icon: Target,
          action: onPlanDay
        }
      ];
    } else {
      // Default daytime suggestions
      contextualSuggestions = [
        {
          id: 'create_task',
          title: 'Quick task',
          subtitle: 'Add something to your list',
          icon: Zap,
          action: onCreateTask
        },
        {
          id: 'track_expense',
          title: 'Track an expense',
          subtitle: 'Keep your budget on track',
          icon: TrendingUp,
          action: onLogExpense
        }
      ];
    }

    setSuggestions(contextualSuggestions);
  }, [onPlanDay, onCreateTask, onLogExpense]);

  if (suggestions.length === 0) return null;

  return (
    <div className={cn("w-full overflow-x-auto scrollbar-hide", className)}>
      <div className="flex items-center gap-2 px-3 md:px-4 mb-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-muted-foreground">
          Smart Suggestions
        </span>
      </div>
      <div className="flex gap-3 px-3 md:px-4 pb-2 min-w-max">
        {suggestions.map((suggestion) => {
          const Icon = suggestion.icon;
          return (
            <Card
              key={suggestion.id}
              className="min-w-[260px] sm:min-w-[280px] max-w-[260px] sm:max-w-[280px] hover:shadow-glow-soft transition-all cursor-pointer hover:scale-105 flex-shrink-0"
              onClick={suggestion.action}
            >
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm mb-1">{suggestion.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-1">{suggestion.subtitle}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
