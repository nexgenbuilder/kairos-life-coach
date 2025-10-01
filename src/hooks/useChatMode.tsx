import { useState, useEffect, useReducer, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type ChatMode = 'general' | 'perplexity' | 'gemini';

interface ChatModeState {
  activeMode: ChatMode;
  allowed: {
    perplexity: boolean;
    gemini: boolean;
  };
  quotas: {
    perplexity: { used: number; limit: number };
    gemini: { used: number; limit: number };
  };
  busy: boolean;
  lastError?: string;
}

type ChatModeAction =
  | { type: 'TOGGLE_GENERAL' }
  | { type: 'TOGGLE_PERPLEXITY' }
  | { type: 'TOGGLE_GEMINI' }
  | { type: 'SET_MODE'; mode: ChatMode }
  | { type: 'ENGINE_ERROR'; message: string }
  | { type: 'QUOTA_EXCEEDED'; engine: 'perplexity' | 'gemini'; message: string }
  | { type: 'PERMISSION_REVOKED'; message: string }
  | { type: 'UPDATE_QUOTAS'; quotas: ChatModeState['quotas'] }
  | { type: 'UPDATE_PERMISSIONS'; allowed: ChatModeState['allowed'] }
  | { type: 'SET_BUSY'; busy: boolean };

function chatModeReducer(state: ChatModeState, action: ChatModeAction): ChatModeState {
  switch (action.type) {
    case 'TOGGLE_GENERAL':
      return { ...state, activeMode: 'general', lastError: undefined };
    
    case 'TOGGLE_PERPLEXITY':
      if (!state.allowed.perplexity) {
        return { ...state, lastError: 'Perplexity search not available in your plan' };
      }
      return {
        ...state,
        activeMode: state.activeMode === 'perplexity' ? 'general' : 'perplexity',
        lastError: undefined
      };
    
    case 'TOGGLE_GEMINI':
      if (!state.allowed.gemini) {
        return { ...state, lastError: 'Gemini AI not available in your plan' };
      }
      return {
        ...state,
        activeMode: state.activeMode === 'gemini' ? 'general' : 'gemini',
        lastError: undefined
      };
    
    case 'SET_MODE':
      return { ...state, activeMode: action.mode, lastError: undefined };
    
    case 'ENGINE_ERROR':
    case 'PERMISSION_REVOKED':
      return { ...state, activeMode: 'general', lastError: action.message };
    
    case 'QUOTA_EXCEEDED':
      return {
        ...state,
        activeMode: 'general',
        lastError: action.message
      };
    
    case 'UPDATE_QUOTAS':
      return { ...state, quotas: action.quotas };
    
    case 'UPDATE_PERMISSIONS':
      return { ...state, allowed: action.allowed };
    
    case 'SET_BUSY':
      return { ...state, busy: action.busy };
    
    default:
      return state;
  }
}

const initialState: ChatModeState = {
  activeMode: 'general',
  allowed: {
    perplexity: true,
    gemini: true
  },
  quotas: {
    perplexity: { used: 0, limit: 20 },
    gemini: { used: 0, limit: 30 }
  },
  busy: false
};

export function useChatMode(threadId?: string) {
  const [state, dispatch] = useReducer(chatModeReducer, initialState);
  const { toast } = useToast();

  // Load permissions and quotas
  useEffect(() => {
    const loadPermissions = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Check feature flags and quotas
        const { data, error } = await supabase.functions.invoke('check-ai-permissions');
        
        if (!error && data) {
          dispatch({
            type: 'UPDATE_PERMISSIONS',
            allowed: {
              perplexity: data.features?.perplexity?.enabled ?? true,
              gemini: data.features?.gemini?.enabled ?? true
            }
          });
          
          dispatch({
            type: 'UPDATE_QUOTAS',
            quotas: {
              perplexity: {
                used: data.usage?.perplexity?.used ?? 0,
                limit: data.usage?.perplexity?.limit ?? 20
              },
              gemini: {
                used: data.usage?.gemini?.used ?? 0,
                limit: data.usage?.gemini?.limit ?? 30
              }
            }
          });
        }
      } catch (error) {
        console.error('Failed to load AI permissions:', error);
      }
    };

    loadPermissions();
  }, []);

  // Load thread-specific mode
  useEffect(() => {
    if (!threadId) return;

    const loadThreadMode = async () => {
      const { data, error } = await supabase
        .from('chat_threads')
        .select('active_mode')
        .eq('id', threadId)
        .maybeSingle();

      if (!error && data?.active_mode) {
        dispatch({ type: 'SET_MODE', mode: data.active_mode as ChatMode });
      }
    };

    loadThreadMode();
  }, [threadId]);

  // Persist mode changes to thread
  const persistMode = useCallback(async (mode: ChatMode) => {
    if (!threadId) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('chat_threads')
      .upsert({
        user_id: user.id,
        active_mode: mode,
        updated_at: new Date().toISOString()
      });
  }, [threadId]);

  // Check quota before using an engine
  const checkQuota = useCallback(async (engine: 'perplexity' | 'gemini'): Promise<boolean> => {
    const quota = state.quotas[engine];
    
    if (quota.used >= quota.limit) {
      dispatch({
        type: 'QUOTA_EXCEEDED',
        engine,
        message: `${engine} quota exceeded. Switching to general mode.`
      });
      
      toast({
        title: 'Quota Exceeded',
        description: `You've reached your ${engine} usage limit. Switched to general mode.`,
        variant: 'destructive'
      });
      
      return false;
    }

    return true;
  }, [state.quotas, toast]);

  // Increment usage
  const incrementUsage = useCallback(async (engine: 'perplexity' | 'gemini') => {
    const newUsed = state.quotas[engine].used + 1;
    
    dispatch({
      type: 'UPDATE_QUOTAS',
      quotas: {
        ...state.quotas,
        [engine]: {
          ...state.quotas[engine],
          used: newUsed
        }
      }
    });

    // Persist to backend
    try {
      await supabase.functions.invoke('track-ai-usage', {
        body: { engine, increment: 1 }
      });
    } catch (error) {
      console.error('Failed to track usage:', error);
    }
  }, [state.quotas]);

  const toggleMode = useCallback((mode: 'general' | 'perplexity' | 'gemini') => {
    const action = mode === 'general' ? 'TOGGLE_GENERAL' 
      : mode === 'perplexity' ? 'TOGGLE_PERPLEXITY' 
      : 'TOGGLE_GEMINI';
    
    dispatch({ type: action });
    
    const newMode = state.activeMode === mode ? 'general' : mode;
    persistMode(newMode);
  }, [state.activeMode, persistMode]);

  const setMode = useCallback((mode: ChatMode) => {
    dispatch({ type: 'SET_MODE', mode });
    persistMode(mode);
  }, [persistMode]);

  const handleError = useCallback((message: string) => {
    dispatch({ type: 'ENGINE_ERROR', message });
    toast({
      title: 'AI Engine Error',
      description: message,
      variant: 'destructive'
    });
  }, [toast]);

  return {
    state,
    dispatch,
    toggleMode,
    setMode,
    checkQuota,
    incrementUsage,
    handleError
  };
}
