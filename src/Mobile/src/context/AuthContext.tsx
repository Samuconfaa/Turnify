import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';

export type UserRole = 'Admin' | 'Employee';

interface User {
  id: number;
  name: string;
  email: string | null;
  username: string | null;
  role: UserRole;
  companyId: number;
  employeeId?: number;
  avatar?: string;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  setAuth: (token: string, refreshToken: string, user: User) => Promise<void>;
  clearAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  refreshToken: null,
  isLoading: true,
  setAuth: async () => {},
  clearAuth: async () => {},
});

const KEYS = {
  token: 'turnify_access_token',
  refresh: 'turnify_refresh_token',
  user: 'turnify_user',
} as const;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [t, r, u] = await Promise.all([
          SecureStore.getItemAsync(KEYS.token),
          SecureStore.getItemAsync(KEYS.refresh),
          SecureStore.getItemAsync(KEYS.user),
        ]);
        if (t && r && u) {
          setToken(t);
          setRefreshToken(r);
          setUser(JSON.parse(u));
        }
      } catch {
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const setAuth = async (t: string, r: string, u: User) => {
    await Promise.all([
      SecureStore.setItemAsync(KEYS.token, t),
      SecureStore.setItemAsync(KEYS.refresh, r),
      SecureStore.setItemAsync(KEYS.user, JSON.stringify(u)),
    ]);
    setToken(t);
    setRefreshToken(r);
    setUser(u);
  };

  const clearAuth = async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(KEYS.token),
      SecureStore.deleteItemAsync(KEYS.refresh),
      SecureStore.deleteItemAsync(KEYS.user),
    ]);
    setToken(null);
    setRefreshToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, refreshToken, isLoading, setAuth, clearAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
