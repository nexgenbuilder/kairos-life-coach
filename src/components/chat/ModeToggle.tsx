import React from 'react';
import { Bot, Search, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatMode } from '@/hooks/useChatMode';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ModeToggleProps {
  activeMode: ChatMode;
  onToggle: (mode: ChatMode) => void;
  allowed: {
    perplexity: boolean;
    gemini: boolean;
  };
  quotas: {
    perplexity: { used: number; limit: number };
    gemini: { used: number; limit: number };
  };
  className?: string;
}

function getStatusColor(used: number, limit: number): string {
  const percentage = (used / limit) * 100;
  if (percentage >= 100) return 'bg-red-500';
  if (percentage >= 80) return 'bg-amber-500';
  return 'bg-green-500';
}

function getStatusLabel(used: number, limit: number): string {
  const percentage = (used / limit) * 100;
  if (percentage >= 100) return 'Quota exceeded';
  if (percentage >= 80) return 'High usage';
  return 'Available';
}

export function ModeToggle({ activeMode, onToggle, allowed, quotas, className }: ModeToggleProps) {
  const modes = [
    {
      id: 'general' as ChatMode,
      icon: Bot,
      label: 'General',
      tooltip: 'General purpose AI chat - Always available',
      enabled: true,
      showQuota: false
    },
    {
      id: 'perplexity' as ChatMode,
      icon: Search,
      label: 'Search',
      quota: quotas.perplexity,
      tooltip: allowed.perplexity 
        ? `Live web search - ${getStatusLabel(quotas.perplexity.used, quotas.perplexity.limit)}`
        : `Quota exceeded (${quotas.perplexity.used}/${quotas.perplexity.limit})`,
      enabled: allowed.perplexity,
      showQuota: true
    },
    {
      id: 'gemini' as ChatMode,
      icon: Sparkles,
      label: 'Gemini',
      quota: quotas.gemini,
      tooltip: allowed.gemini
        ? `Google Gemini AI - ${getStatusLabel(quotas.gemini.used, quotas.gemini.limit)}`
        : `Quota exceeded (${quotas.gemini.used}/${quotas.gemini.limit})`,
      enabled: allowed.gemini,
      showQuota: true
    }
  ];

  return (
    <TooltipProvider>
      <div className={cn('inline-flex rounded-lg bg-muted p-1 gap-1', className)}>
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isActive = activeMode === mode.id;
          const isDisabled = !mode.enabled;
          const quota = mode.showQuota ? mode.quota : null;

          return (
            <Tooltip key={mode.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => !isDisabled && onToggle(mode.id)}
                  disabled={isDisabled}
                  className={cn(
                    'inline-flex items-center justify-center gap-2 rounded-md px-3 py-1.5',
                    'text-sm font-medium transition-all duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    'disabled:pointer-events-none disabled:opacity-50',
                    isActive
                      ? 'bg-background text-foreground shadow-sm'
                      : 'hover:bg-background/50 text-muted-foreground hover:text-foreground'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{mode.label}</span>
                    {quota && (
                      <div className="flex items-center gap-1.5">
                        <div 
                          className={cn(
                            'h-2 w-2 rounded-full',
                            getStatusColor(quota.used, quota.limit)
                          )}
                          aria-label={getStatusLabel(quota.used, quota.limit)}
                        />
                        <span className="text-xs text-muted-foreground hidden md:inline">
                          {quota.used}/{quota.limit}
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{mode.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
