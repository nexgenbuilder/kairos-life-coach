import { supabase } from '@/integrations/supabase/client';
import { ChatMode } from '@/hooks/useChatMode';

export interface RouteMessageParams {
  mode: ChatMode;
  text: string;
  context?: string;
  session?: any;
  onQuotaCheck?: (engine: 'perplexity' | 'gemini') => Promise<boolean>;
  onIncrementUsage?: (engine: 'perplexity' | 'gemini') => Promise<void>;
  onFallback?: (reason: string) => void;
}

export interface RouteMessageResult {
  content: string;
  source: string;
  fellBackToGeneral: boolean;
  fallbackReason?: string;
}

async function callGeneralMode(text: string, context: string, session?: any): Promise<{ content: string; source: string }> {
  const { data, error } = await supabase.functions.invoke('lovable-chat', {
    body: { 
      message: text,
      context: context || 'home',
      forceGPT5: false
    },
    headers: session ? {
      'Authorization': `Bearer ${session.access_token}`
    } : {}
  });

  if (error) throw error;

  return {
    content: data.response,
    source: data.source || 'lovable-ai'
  };
}

async function callPerplexity(text: string, context: string, session?: any): Promise<{ content: string; source: string }> {
  const { data, error } = await supabase.functions.invoke('perplexity-search', {
    body: { 
      message: text,
      context: context || 'home'
    },
    headers: session ? {
      'Authorization': `Bearer ${session.access_token}`
    } : {}
  });

  if (error) throw error;

  return {
    content: data.response,
    source: 'perplexity'
  };
}

async function callGemini(text: string, context: string, session?: any): Promise<{ content: string; source: string }> {
  const { data, error } = await supabase.functions.invoke('lovable-chat', {
    body: { 
      message: text,
      context: context || 'home',
      forceGPT5: false
    },
    headers: session ? {
      'Authorization': `Bearer ${session.access_token}`
    } : {}
  });

  if (error) throw error;

  return {
    content: data.response,
    source: 'gemini'
  };
}

export async function routeMessage(params: RouteMessageParams): Promise<RouteMessageResult> {
  const { mode, text, context = 'home', session, onQuotaCheck, onIncrementUsage, onFallback } = params;

  // Try the requested mode first
  try {
    if (mode === 'perplexity') {
      // Check quota
      if (onQuotaCheck) {
        const canUse = await onQuotaCheck('perplexity');
        if (!canUse) {
          const fallbackReason = 'Perplexity quota exceeded. Using General mode.';
          onFallback?.(fallbackReason);
          const result = await callGeneralMode(text, context, session);
          return {
            ...result,
            fellBackToGeneral: true,
            fallbackReason
          };
        }
      }

      const result = await callPerplexity(text, context, session);
      await onIncrementUsage?.('perplexity');
      
      return {
        ...result,
        fellBackToGeneral: false
      };
    }

    if (mode === 'gemini') {
      // Check quota
      if (onQuotaCheck) {
        const canUse = await onQuotaCheck('gemini');
        if (!canUse) {
          const fallbackReason = 'Gemini quota exceeded. Using General mode.';
          onFallback?.(fallbackReason);
          const result = await callGeneralMode(text, context, session);
          return {
            ...result,
            fellBackToGeneral: true,
            fallbackReason
          };
        }
      }

      const result = await callGemini(text, context, session);
      await onIncrementUsage?.('gemini');
      
      return {
        ...result,
        fellBackToGeneral: false
      };
    }

    // General mode
    const result = await callGeneralMode(text, context, session);
    return {
      ...result,
      fellBackToGeneral: false
    };

  } catch (error) {
    // If the requested mode failed, fall back to General
    if (mode !== 'general') {
      console.error(`${mode} mode failed, falling back to General:`, error);
      const fallbackReason = `${mode.charAt(0).toUpperCase() + mode.slice(1)} failed. Using General mode.`;
      onFallback?.(fallbackReason);

      try {
        const result = await callGeneralMode(text, context, session);
        return {
          ...result,
          fellBackToGeneral: true,
          fallbackReason
        };
      } catch (fallbackError) {
        console.error('General mode fallback also failed:', fallbackError);
        throw fallbackError;
      }
    }

    // General mode failed with no fallback available
    throw error;
  }
}
