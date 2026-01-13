import { useCallback, useRef } from 'react';

// Soft click sound frequencies and duration
const CLICK_FREQUENCY = 800;
const CLICK_DURATION = 0.05;

export const useSoundEffects = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playClick = useCallback(() => {
    try {
      const ctx = getAudioContext();
      
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = CLICK_FREQUENCY;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.03, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + CLICK_DURATION);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + CLICK_DURATION);
    } catch (e) {
      // Silently fail if audio context is not available
    }
  }, [getAudioContext]);

  const playSuccess = useCallback(() => {
    try {
      const ctx = getAudioContext();
      
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      oscillator.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.04, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.2);
    } catch (e) {
      // Silently fail
    }
  }, [getAudioContext]);

  const playType = useCallback(() => {
    try {
      const ctx = getAudioContext();
      
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = 600 + Math.random() * 100;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.015, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.03);
    } catch (e) {
      // Silently fail
    }
  }, [getAudioContext]);

  return { playClick, playSuccess, playType };
};
