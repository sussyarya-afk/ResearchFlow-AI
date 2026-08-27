import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/services/api';

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  organization?: string;
  llmProvider?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  login: (token: string) => Promise<void>;
  demoLogin: () => Promise<void>;
  logout: () => void;
  updateProfile: (data: { email: string; fullName?: string; organization?: string; password?: string }) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('user_profile');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUserProfile = useCallback(async () => {
    try {
      const data = await apiClient.getMe();
      if (data) {
        const savedMeta = localStorage.getItem('user_meta');
        const meta = savedMeta ? JSON.parse(savedMeta) : {};
        const profile: UserProfile = {
          id: data.id,
          email: data.email,
          fullName: meta.fullName || (data.email?.includes('demo') ? 'Alex Rivera' : data.email.split('@')[0]),
          organization: meta.organization || 'AgentNotebook Research Labs',
          llmProvider: data.llm_provider || 'gemini',
        };
        setUser(profile);
        localStorage.setItem('user_profile', JSON.stringify(profile));
      }
    } catch (err) {
      console.warn('Failed to fetch user profile:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [token, fetchUserProfile]);

  const login = async (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    await fetchUserProfile();
  };

  const demoLogin = async () => {
    setLoading(true);
    try {
      const res = await apiClient.demoLogin();
      if (res && res.access_token) {
        localStorage.setItem('token', res.access_token);
        setToken(res.access_token);
        const profile: UserProfile = {
          id: 'demo_user',
          email: 'demo@agentnotebook.ai',
          fullName: 'Alex Rivera',
          organization: 'AgentNotebook Research Labs',
          llmProvider: 'gemini',
        };
        setUser(profile);
        localStorage.setItem('user_profile', JSON.stringify(profile));
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_profile');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (data: { email: string; fullName?: string; organization?: string; password?: string }) => {
    try {
      await apiClient.updateMe({ email: data.email, password: data.password });
      const meta = { fullName: data.fullName, organization: data.organization };
      localStorage.setItem('user_meta', JSON.stringify(meta));
      if (user) {
        const updated = {
          ...user,
          email: data.email,
          fullName: data.fullName || user.fullName,
          organization: data.organization || user.organization,
        };
        setUser(updated);
        localStorage.setItem('user_profile', JSON.stringify(updated));
      }
    } catch (err: any) {
      throw new Error(err?.message || 'Failed to update profile');
    }
  };

  const refreshUser = async () => {
    if (token) {
      await fetchUserProfile();
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, demoLogin, logout, updateProfile, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
