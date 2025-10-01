import React from 'react';
import { Bot, Search, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatMode } from '@/hooks/useChatMode';
import { Badge } from '@/components/ui/badge';

interface ModeStatusChipProps {
  mode: ChatMode;
  className?: string;
}

export function ModeStatusChip({ mode, className }: ModeStatusChipProps) {
  const configs = {
    general: {
      icon: Bot,
      label: 'General Mode',
      className: 'bg-muted text-muted-foreground border-border'
    },
    perplexity: {
      icon: Search,
      label: 'Live Search',
      className: 'bg-primary/10 text-primary border-primary/20'
    },
    gemini: {
      icon: Sparkles,
      label: 'Gemini AI',
      className: 'bg-accent text-accent-foreground border-accent-foreground/20'
    }
  };

  const config = configs[mode];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium',
        config.className,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      <span>{config.label}</span>
    </Badge>
  );
}
