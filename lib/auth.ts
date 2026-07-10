import { User } from "@/types/auth";

const AUTH_KEY = 'auth_user';

export function initializeAuth(): User | null {
  if (typeof window === 'undefined') return null;
  const storedUser = localStorage.getItem(AUTH_KEY);
  if (storedUser) {
    return JSON.parse(storedUser);
  }
  return null;
}

export function loginUser(user: User): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

export function logoutUser(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_KEY);
}

export function isAuthenticated(): boolean {
  return initializeAuth() !== null;
}

export function getCurrentUser(): User | null {
  return initializeAuth();
}
