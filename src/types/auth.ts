export type UserRole = 'ADMIN' | 'CONCIERGE' | 'CLIENT';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  lastLogin?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  rememberMe?: boolean;
}

export interface EmailVerificationToken {
  token: string;
  email: string;
  expiresAt: number; // Timestamp
  type: 'REGISTRATION' | 'PASSWORD_RESET';
}

export interface PendingRegistration {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  token: string;
  expiresAt: number;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  error?: string;
  tokenRequired?: boolean;
  tokenInfo?: {
    email: string;
    expiresInSeconds: number;
    previewCode?: string; // For demo / email preview environment
  };
}

export interface TokenResponse {
  success: boolean;
  error?: string;
  token?: string;
  expiresInSeconds?: number;
}

