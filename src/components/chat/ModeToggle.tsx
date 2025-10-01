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

export function ModeToggle({ activeMode, onToggle, allowed, quotas, className }: ModeToggleProps) {
  const modes = [
    {
      id: 'general' as ChatMode,
      icon: Bot,
      label: 'General',
      tooltip: 'General purpose AI chat',
      enabled: true
    },
    {
      id: 'perplexity' as ChatMode,
      icon: Search,
      label: 'Search',
      tooltip: `Live web search (${quotas.perplexity.used}/${quotas.perplexity.limit})`,
      enabled: allowed.perplexity
    },
    {
      id: 'gemini' as ChatMode,
      icon: Sparkles,
      label: 'Gemini',
      tooltip: `Google Gemini AI (${quotas.gemini.used}/${quotas.gemini.limit})`,
      enabled: allowed.gemini
    }
  ];

  return (
    <TooltipProvider>
      <div className={cn('inline-flex rounded-lg bg-muted p-1 gap-1', className)}>
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isActive = activeMode === mode.id;
          const isDisabled = !mode.enabled;

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
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{mode.label}</span>
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
