"use client"

import React, { createContext, useState, useEffect } from 'react';
import { User, AuthContextType } from '@/types/auth';
import { initializeAuth, loginUser, logoutUser } from '@/lib/auth';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = initializeAuth();
    if (storedUser) {
      setUser(storedUser);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
    loginUser(userData);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    logoutUser();
  };

  if (isLoading) {
    return null; // or a full-page loading spinner
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
