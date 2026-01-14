import { useCallback } from 'react';

type HapticType = 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error';

export function useHaptics() {
  const vibrate = useCallback((pattern: number | number[]) => {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        // Vibration not supported or failed
      }
    }
  }, []);

  const triggerHaptic = useCallback((type: HapticType = 'light') => {
    const patterns: Record<HapticType, number | number[]> = {
      light: 10,
      medium: 25,
      heavy: 50,
      selection: 5,
      success: [10, 50, 10],
      warning: [25, 25, 25],
      error: [50, 50, 50],
    };

    vibrate(patterns[type]);
  }, [vibrate]);

  return { triggerHaptic, vibrate };
}
