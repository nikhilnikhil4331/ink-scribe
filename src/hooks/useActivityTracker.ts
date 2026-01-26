import { useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Json } from '@/integrations/supabase/types';

export type ActivityCategory = 
  | 'auth' 
  | 'page' 
  | 'export' 
  | 'premium' 
  | 'mood' 
  | 'notebook' 
  | 'general';

export type ActivityAction = 
  | 'signup'
  | 'login'
  | 'logout'
  | 'page_view'
  | 'page_create'
  | 'page_delete'
  | 'page_edit'
  | 'export_png'
  | 'export_pdf'
  | 'export_zip'
  | 'premium_attempt'
  | 'premium_success'
  | 'mood_change'
  | 'notebook_create'
  | 'notebook_delete'
  | 'button_click'
  | 'feature_use';

function getDeviceType(): string {
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return 'mobile';
  return 'desktop';
}

function generateSessionId(): string {
  const existing = sessionStorage.getItem('session_id');
  if (existing) return existing;
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  sessionStorage.setItem('session_id', id);
  return id;
}

export function useActivityTracker() {
  const { user } = useAuth();
  const sessionId = useRef<string>(generateSessionId());

  const trackActivity = useCallback(async (
    action: ActivityAction | string,
    category: ActivityCategory = 'general',
    details: Record<string, Json> = {}
  ) => {
    try {
      await supabase.from('activity_logs').insert([{
        user_id: user?.id || null,
        action,
        category,
        details: details as Json,
        user_agent: navigator.userAgent,
        device_type: getDeviceType(),
        session_id: sessionId.current,
        page_url: window.location.pathname,
      }]);
    } catch (error) {
      console.error('Failed to track activity:', error);
    }
  }, [user]);

  // Track page views automatically
  useEffect(() => {
    trackActivity('page_view', 'page', { path: window.location.pathname });
  }, [trackActivity]);

  return { trackActivity };
}

// Singleton for use outside React components
let globalTracker: ((action: string, category?: ActivityCategory, details?: Record<string, Json>) => Promise<void>) | null = null;

export function initGlobalTracker(userId?: string) {
  globalTracker = async (action, category = 'general', details = {}) => {
    try {
      await supabase.from('activity_logs').insert([{
        user_id: userId || null,
        action,
        category,
        details: details as Json,
        user_agent: navigator.userAgent,
        device_type: getDeviceType(),
        session_id: generateSessionId(),
        page_url: window.location.pathname,
      }]);
    } catch (error) {
      console.error('Failed to track activity:', error);
    }
  };
}

export function trackGlobalActivity(action: string, category?: ActivityCategory, details?: Record<string, Json>) {
  if (globalTracker) {
    globalTracker(action, category, details);
  }
}
