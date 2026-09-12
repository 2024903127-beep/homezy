'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CustomerUser, getProfile } from './api';

interface AuthContextType {
  user: CustomerUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: CustomerUser) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  isAuthModalOpen: boolean;
  openAuthModal: (onSuccessCallback?: () => void) => void;
  closeAuthModal: () => void;
  authSuccessCallback: (() => void) | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authSuccessCallback, setAuthSuccessCallback] = useState<(() => void) | null>(null);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('homezy_token');
      const storedUser = localStorage.getItem('homezy_user');
      if (storedToken) {
        setToken(storedToken);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      }
    } catch (e) {
      console.warn('Failed reading stored auth state:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (newToken: string, newUser: CustomerUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('homezy_token', newToken);
    localStorage.setItem('homezy_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('homezy_token');
    localStorage.removeItem('homezy_user');
    window.location.href = '/';
  };

  const refreshProfile = async () => {
    try {
      const fresh = await getProfile();
      setUser(fresh);
      localStorage.setItem('homezy_user', JSON.stringify(fresh));
    } catch (e) {
      console.warn('Could not refresh profile from server:', e);
    }
  };

  const openAuthModal = (callback?: () => void) => {
    if (callback) {
      setAuthSuccessCallback(() => callback);
    } else {
      setAuthSuccessCallback(null);
    }
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthSuccessCallback(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token,
        login,
        logout,
        refreshProfile,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        authSuccessCallback,
      }}
    >
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