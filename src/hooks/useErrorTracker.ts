import { useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

interface ErrorDetails {
  errorType: string;
  errorMessage: string;
  errorStack?: string;
  component?: string;
  severity?: ErrorSeverity;
}

function getDeviceType(): string {
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return 'mobile';
  return 'desktop';
}

export function useErrorTracker() {
  const { user } = useAuth();

  const trackError = useCallback(async (details: ErrorDetails) => {
    try {
      await supabase.from('error_logs').insert({
        user_id: user?.id || null,
        error_type: details.errorType,
        error_message: details.errorMessage,
        error_stack: details.errorStack,
        component: details.component,
        severity: details.severity || 'error',
        page_url: window.location.pathname,
        user_agent: navigator.userAgent,
        device_type: getDeviceType(),
      });
    } catch (error) {
      console.error('Failed to track error:', error);
    }
  }, [user]);

  // Set up global error handler
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      trackError({
        errorType: 'javascript_error',
        errorMessage: event.message,
        errorStack: event.error?.stack,
        severity: 'error',
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      trackError({
        errorType: 'unhandled_promise_rejection',
        errorMessage: event.reason?.message || String(event.reason),
        errorStack: event.reason?.stack,
        severity: 'error',
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [trackError]);

  return { trackError };
}

// For use outside React components
export async function trackGlobalError(details: ErrorDetails & { userId?: string }) {
  try {
    await supabase.from('error_logs').insert({
      user_id: details.userId || null,
      error_type: details.errorType,
      error_message: details.errorMessage,
      error_stack: details.errorStack,
      component: details.component,
      severity: details.severity || 'error',
      page_url: typeof window !== 'undefined' ? window.location.pathname : '',
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      device_type: 'unknown',
    });
  } catch (error) {
    console.error('Failed to track error:', error);
  }
}
