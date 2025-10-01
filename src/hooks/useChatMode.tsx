import { useState, useCallback } from 'react';

type ChatMode = 'general' | 'perplexity' | 'gemini';

export function useChatMode() {
  const [mode, setModeState] = useState<ChatMode>('general');

  const setMode = useCallback((newMode: ChatMode) => {
    setModeState(newMode);
  }, []);

  const toggleMode = useCallback((targetMode: ChatMode) => {
    setModeState(current => current === targetMode ? 'general' : targetMode);
  }, []);

  return {
    state: mode,
    setMode,
    toggleMode
  };
}
