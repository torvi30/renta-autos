import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AuthUser,
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  TokenResponse,
} from '../types/auth';
import * as authService from '../services/authService';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  requestRegistration: (credentials: RegisterCredentials) => Promise<TokenResponse>;
  verifyRegistration: (email: string, token: string) => Promise<AuthResponse>;
  resendRegistration: (email: string) => Promise<TokenResponse>;
  requestReset: (email: string) => Promise<TokenResponse>;
  resetPassword: (email: string, token: string, newPass: string) => Promise<AuthResponse>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Suscripción reactiva mediante onAuthStateChanged
    const unsubscribe = authService.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      if (response.success && response.user) {
        setUser(response.user);
      }
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestRegistration = async (credentials: RegisterCredentials): Promise<TokenResponse> => {
    return await authService.requestAccountRegistration(credentials);
  };

  const handleVerifyRegistration = async (email: string, token: string): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const response = await authService.verifyRegistrationToken(email, token);
      if (response.success && response.user) {
        setUser(response.user);
      }
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendRegistration = async (email: string): Promise<TokenResponse> => {
    return await authService.resendRegistrationToken(email);
  };

  const handleRequestReset = async (email: string): Promise<TokenResponse> => {
    return await authService.requestPasswordReset(email);
  };

  const handleResetPassword = async (email: string, token: string, newPass: string): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const response = await authService.resetPasswordWithToken(email, token, newPass);
      if (response.success && response.user) {
        setUser(response.user);
      }
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login: handleLogin,
    logout: handleLogout,
    requestRegistration: handleRequestRegistration,
    verifyRegistration: handleVerifyRegistration,
    resendRegistration: handleResendRegistration,
    requestReset: handleRequestReset,
    resetPassword: handleResetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
