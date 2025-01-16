"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

type AuthContextProps = {
  user: Session['user'] | null;
  session: Session | null;
  loading: boolean;
  error: Error | null;
  checkAuth: () => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithProvider: (provider: 'google' | 'github') => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  globalState: any;
  setGlobalState: (state: any) => void;
};

const AuthContext = createContext<AuthContextProps>({
  user: null,
  session: null,
  loading: true,
  error: null,
  checkAuth: async () => false,
  signIn: async () => ({ error: null }),
  signInWithProvider: async () => ({ error: null }),
  signOut: async () => ({ error: null }),
  resetPassword: async () => ({ error: null }),
  globalState: {},
  setGlobalState: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const supabase = useSupabaseClient();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<Session['user'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [globalState, setGlobalState] = useState<any>({});

  useEffect(() => {
    setUser(session?.user ?? null);
  }, [session]);

  const checkAuth = useCallback(async () => {
    try {
      console.log('AuthContext - Checking auth');
      const { data } = await supabase.auth.getSession();
      const hasSession = !!data.session;
      console.log('AuthContext - Auth check result:', { hasSession });
      return hasSession;
    } catch (err) {
      console.error('AuthContext - Auth check error:', err);
      return false;
    }
  }, [supabase]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error ? new Error(error.message) : null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Unknown error occurred') };
    }
  };

  const signInWithProvider = async (provider: 'google' | 'github') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider });
      return { error: error ? new Error(error.message) : null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Unknown error occurred') };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      return { error: error ? new Error(error.message) : null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Unknown error occurred') };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return { error: error ? new Error(error.message) : null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Unknown error occurred') };
    }
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        setSession(data.session);
      } catch (err: any) {
        setError(err instanceof Error ? err : new Error(err.message));
      } finally {
        setLoading(false);
      }
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthContext - Auth state changed:', { event, session });
        switch (event) {
          case 'SIGNED_IN':
            setSession(session);
            break;
          case 'SIGNED_OUT':
            setSession(null);
            break;
          case 'TOKEN_REFRESHED':
            setSession(session);
            break;
          case 'USER_UPDATED':
            setSession(session);
            break;
          default:
            console.log('AuthContext - Unhandled auth event:', event);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase]);

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      error,
      checkAuth,
      signIn,
      signInWithProvider,
      signOut,
      resetPassword,
      globalState,
      setGlobalState
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
