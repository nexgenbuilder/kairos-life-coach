import { ChatMode } from '@/hooks/useChatMode';

export interface ParsedCommand {
  command?: string;
  mode?: ChatMode;
  cleanText: string;
}

const SLASH_COMMANDS = {
  '/general': 'general' as ChatMode,
  '/perplexity': 'perplexity' as ChatMode,
  '/search': 'perplexity' as ChatMode,
  '/gemini': 'gemini' as ChatMode,
  '/mode': 'show' as const
};

export function parseSlashCommand(input: string): ParsedCommand {
  const trimmed = input.trim();
  
  // Check if input starts with a slash command
  for (const [cmd, value] of Object.entries(SLASH_COMMANDS)) {
    if (trimmed.toLowerCase().startsWith(cmd)) {
      const cleanText = trimmed.slice(cmd.length).trim();
      
      if (value === 'show') {
        return { command: 'show_mode', cleanText };
      }
      
      return { mode: value as ChatMode, cleanText };
    }
  }
  
  return { cleanText: input };
}

export function detectActionIntent(message: string): 'task' | 'expense' | 'fitness' | 'chat' {
  const lower = message.toLowerCase();
  
  // Task keywords
  if (
    lower.includes('task') ||
    lower.includes('todo') ||
    lower.includes('remind me') ||
    lower.includes('add to my list')
  ) {
    return 'task';
  }
  
  // Expense keywords
  if (
    lower.includes('expense') ||
    lower.includes('spent') ||
    lower.includes('cost') ||
    lower.includes('paid') ||
    lower.includes('receipt')
  ) {
    return 'expense';
  }
  
  // Fitness keywords
  if (
    lower.includes('workout') ||
    lower.includes('exercise') ||
    lower.includes('gym') ||
    lower.includes('run') ||
    lower.includes('lift')
  ) {
    return 'fitness';
  }
  
  return 'chat';
}
