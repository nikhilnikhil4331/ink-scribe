// ============================================================
// NikNote 4.0 — Auth Context (CRASH-FIXED)
// Handles Supabase auth + Google OAuth gracefully
// No more refresh crashes or redirect loops
// ============================================================

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signInWithGitHub: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        // Handle all auth events gracefully
        switch (event) {
          case 'TOKEN_REFRESHED':
            if (!session) {
              // Token refresh failed — clear stale session silently
              console.warn('Token refresh failed, clearing session');
              setSession(null);
              setUser(null);
            } else {
              setSession(session);
              setUser(session.user);
            }
            break;

          case 'SIGNED_OUT':
            setSession(null);
            setUser(null);
            break;

          case 'SIGNED_IN':
          case 'USER_UPDATED':
            setSession(session);
            setUser(session?.user ?? null);
            break;

          default:
            setSession(session);
            setUser(session?.user ?? null);
        }

        setLoading(false);
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!mounted) return;
      
      if (error) {
        console.warn('Session fetch error:', error.message);
        setSession(null);
        setUser(null);
      } else {
        setSession(session);
        setUser(session?.user ?? null);
      }
      setLoading(false);
    }).catch(() => {
      if (!mounted) return;
      setSession(null);
      setUser(null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName,
          },
        },
      });
      return { error: error as Error | null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Sign up failed') };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error: error as Error | null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Sign in failed') };
    }
  };

  const signInWithGoogle = useCallback(async () => {
    try {
      // APPROACH 1: Try Google Identity Services (GIS) — direct ID token flow
      // This bypasses Supabase's OAuth and doesn't need Client Secret!
      const googleClientId = localStorage.getItem('niknote_google_client_id');
      
      if (googleClientId && typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
        return new Promise<{ error: Error | null }>((resolve) => {
          (window as any).google.accounts.id.initialize({
            client_id: googleClientId,
            callback: async (response: any) => {
              try {
                if (response.credential) {
                  // Use the ID token to sign in to Supabase
                  const { error } = await supabase.auth.signInWithIdToken({
                    provider: 'google',
                    token: response.credential,
                  });
                  if (error) {
                    resolve({ error: new Error('Google sign-in failed: ' + error.message) });
                  } else {
                    resolve({ error: null });
                  }
                } else {
                  resolve({ error: new Error('Google sign-in cancelled') });
                }
              } catch (err) {
                resolve({ error: new Error('Google sign-in error') });
              }
            },
          });
          (window as any).google.accounts.id.prompt((notification: any) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
              // GIS popup blocked — fall back to OAuth flow
              resolve({ error: new Error('GIS_FALLBACK') });
            }
          });
        }).then(async (result) => {
          if (result.error?.message === 'GIS_FALLBACK') {
            // Fall back to Supabase OAuth flow
            const { error } = await supabase.auth.signInWithOAuth({
              provider: 'google',
              options: { redirectTo: `${window.location.origin}/` },
            });
            if (error) {
              return { error: new Error('Google sign-in abhi configured nahi hai. Email/Password use karo! 👇') };
            }
            return { error: null };
          }
          return result;
        });
      }

      // APPROACH 2: Fall back to Supabase's built-in OAuth
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: { access_type: 'offline', prompt: 'consent' },
        },
      });
      if (error) {
        if (error.message?.includes('provider') || error.message?.includes('not enabled') || error.message?.includes('Unsupported') || error.message?.includes('missing OAuth secret')) {
          return { error: new Error('Google sign-in abhi configured nahi hai. Email/Password use karo! 👇') };
        }
        return { error: error as Error };
      }
      return { error: null };
    } catch (err) {
      console.error('Google sign in error:', err);
      return { error: new Error('Google sign-in fail ho gaya. Email/Password try karo!') };
    }
  }, []);

  const signInWithGitHub = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) {
        if (error.message?.includes('provider') || error.message?.includes('not enabled') || error.message?.includes('Unsupported') || error.message?.includes('missing OAuth secret')) {
          return { error: new Error('GitHub sign-in abhi configured nahi hai. Email/Password use karo!') };
        }
        return { error: error as Error };
      }
      return { error: null };
    } catch (err) {
      console.error('GitHub sign in error:', err);
      return { error: new Error('GitHub sign-in fail ho gaya. Email/Password try karo!') };
    }
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Sign out error:', err);
    }
    setSession(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signInWithGoogle, signInWithGitHub, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
