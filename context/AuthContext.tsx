"use client"

import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { User, AuthContextType, RegisterCompanyInput } from '@/types/auth';
import { createClient } from '@/lib/supabase/client';
import { buildAppUser } from '@/lib/user-session';
import { getProfile } from '@/services/profiles.service';
import {
  getInactiveAccountMessage,
  getPrimaryMembership,
} from '@/services/company-members.service';
import {
  provisionPendingCompanyAccount,
  registerCompanyAccount,
  requestPasswordReset,
  signInWithEmail,
  signOut,
  updatePassword,
} from '@/services/auth.service';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  const hydrateUser = useCallback(async (authUser: { id: string; email?: string; user_metadata?: Record<string, unknown> }) => {
    const inactiveMessage = await getInactiveAccountMessage(authUser.id);
    if (inactiveMessage) {
      await signOut();
      return null;
    }
    const [profile, membership] = await Promise.all([
      getProfile(authUser.id),
      getPrimaryMembership(authUser.id),
    ]);
    return buildAppUser(authUser, profile, membership);
  }, []);

  const refreshUser = useCallback(async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      setUser(null);
      setIsAuthenticated(false);
      return;
    }
    const appUser = await hydrateUser(authUser);
    if (!appUser) {
      setUser(null);
      setIsAuthenticated(false);
      return;
    }
    setUser(appUser);
    setIsAuthenticated(true);
  }, [hydrateUser, supabase]);

  useEffect(() => {
    let mounted = true;

    async function init() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser && mounted) {
        await provisionPendingCompanyAccount().catch(() => undefined);
        const appUser = await hydrateUser(authUser);
        if (appUser) {
          setUser(appUser);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      if (mounted) setIsLoading(false);
    }

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await provisionPendingCompanyAccount().catch(() => undefined);
        const appUser = await hydrateUser(session.user);
        if (appUser) {
          setUser(appUser);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [hydrateUser, supabase]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      await signInWithEmail(email, password);
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const inactiveMessage = await getInactiveAccountMessage(authUser.id);
        if (inactiveMessage) {
          await signOut();
          setUser(null);
          setIsAuthenticated(false);
          return { error: inactiveMessage };
        }
      }
      await refreshUser();
      return {};
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Login failed' };
    }
  }, [refreshUser, supabase]);

  const register = useCallback(async (input: RegisterCompanyInput) => {
    try {
      const result = await registerCompanyAccount(input);
      if (!result.requiresConfirmation) {
        await refreshUser();
      }
      return { requiresConfirmation: result.requiresConfirmation };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Registration failed' };
    }
  }, [refreshUser]);

  const handleRequestPasswordReset = useCallback(async (email: string) => {
    try {
      await requestPasswordReset(email);
      return {};
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to send reset email' };
    }
  }, []);

  const handleUpdatePassword = useCallback(async (password: string) => {
    try {
      await updatePassword(password);
      return {};
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to update password' };
    }
  }, []);

  const logout = useCallback(async () => {
    await signOut();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/20">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        requestPasswordReset: handleRequestPasswordReset,
        updatePassword: handleUpdatePassword,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
