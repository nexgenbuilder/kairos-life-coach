import { useCallback } from 'react';

type SoundType = 'success' | 'warn' | 'ui';

export function useSound() {
  const play = useCallback((soundType: SoundType) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Different frequencies for different sounds
      const frequencies = {
        success: 800,
        warn: 400,
        ui: 600
      };

      oscillator.frequency.value = frequencies[soundType];
      oscillator.type = 'sine';

      // Volume and duration
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      // Graceful degradation if audio fails
      console.debug('Sound feedback unavailable');
    }
  }, []);

  return { play };
}
