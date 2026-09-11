import { AuthUser, LoginCredentials, AuthResponse } from '../types/auth';
import { auth, isFirebaseConfigured } from './firebase';
import {
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged as fbOnAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';

const SESSION_KEY = 'PREMIUM_RENTAL_AUTH_SESSION_V1';

/**
 * Cuentas preconfiguradas para desarrollo y demostración ejecutiva
 */
const DEMO_USERS: Record<string, { user: AuthUser; passwordHash: string }> = {
  'admin@luxurycars.com': {
    user: {
      id: 'usr-admin-01',
      email: 'admin@luxurycars.com',
      name: 'Director de Operaciones VIP',
      role: 'ADMIN',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    },
    passwordHash: 'admin123',
  },
  'concierge@luxurycars.com': {
    user: {
      id: 'usr-concierge-01',
      email: 'concierge@luxurycars.com',
      name: 'Concierge Showroom Central',
      role: 'CONCIERGE',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    },
    passwordHash: 'vip2026',
  },
};

type AuthStateListener = (user: AuthUser | null) => void;
const listeners: Set<AuthStateListener> = new Set();

const notifyListeners = (user: AuthUser | null) => {
  listeners.forEach((callback) => {
    try {
      callback(user);
    } catch (e) {
      console.error('Error executing auth state listener:', e);
    }
  });
};

/**
 * Obtener usuario persistido en sessionStorage o localStorage
 */
export const getStoredUser = (): AuthUser | null => {
  if (typeof window === 'undefined') return null;
  try {
    const local = localStorage.getItem(SESSION_KEY);
    if (local) return JSON.parse(local) as AuthUser;

    const session = sessionStorage.getItem(SESSION_KEY);
    if (session) return JSON.parse(session) as AuthUser;

    return null;
  } catch (error) {
    console.warn('Error reading auth session from storage:', error);
    return null;
  }
};

const mapFirebaseUserToAuthUser = (fbUser: FirebaseUser): AuthUser => {
  const email = fbUser.email?.toLowerCase() || '';
  const demo = DEMO_USERS[email];

  return {
    id: fbUser.uid,
    email: fbUser.email || '',
    name: fbUser.displayName || demo?.user.name || 'Administrador VIP',
    role: demo?.user.role || 'ADMIN',
    avatarUrl: fbUser.photoURL || demo?.user.avatarUrl,
    lastLogin: new Date().toISOString(),
  };
};

/**
 * Iniciar sesión (soporta Firebase Auth y Demo Fallback)
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const cleanEmail = credentials.email.trim().toLowerCase();
  const account = DEMO_USERS[cleanEmail];

  // 1. Intentar con Firebase Auth si está configurado
  if (auth && isFirebaseConfigured()) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        cleanEmail,
        credentials.password
      );
      const authenticatedUser = mapFirebaseUserToAuthUser(userCredential.user);

      try {
        const rawUser = JSON.stringify(authenticatedUser);
        if (credentials.rememberMe) {
          localStorage.setItem(SESSION_KEY, rawUser);
          sessionStorage.removeItem(SESSION_KEY);
        } else {
          sessionStorage.setItem(SESSION_KEY, rawUser);
          localStorage.removeItem(SESSION_KEY);
        }
      } catch (e) {
        console.warn('Storage warning:', e);
      }

      notifyListeners(authenticatedUser);
      return { success: true, user: authenticatedUser };
    } catch (firebaseError: unknown) {
      const fbErr = firebaseError as { code?: string; message?: string };
      // Si falla en Firebase pero coincide exactamente con las credenciales demo, permitir acceso demo
      if (account && credentials.password === account.passwordHash) {
        const demoAuthUser: AuthUser = {
          ...account.user,
          lastLogin: new Date().toISOString(),
        };
        persistSession(demoAuthUser, credentials.rememberMe);
        notifyListeners(demoAuthUser);
        return { success: true, user: demoAuthUser };
      }

      let errorMsg = 'Error al autenticar en Firebase.';
      if (
        fbErr.code === 'auth/user-not-found' ||
        fbErr.code === 'auth/wrong-password' ||
        fbErr.code === 'auth/invalid-credential'
      ) {
        errorMsg = 'Credenciales no válidas. Por favor verifica tu correo y contraseña.';
      } else if (fbErr.code === 'auth/too-many-requests') {
        errorMsg = 'Demasiados intentos fallidos. Por seguridad, espera unos minutos.';
      } else if (fbErr.code === 'auth/network-request-failed') {
        errorMsg = 'Error de conexión de red al conectar con Firebase.';
      }

      return { success: false, error: errorMsg };
    }
  }

  // 2. Modo Desacoplado / Local (Fallback)
  await new Promise((resolve) => setTimeout(resolve, 200));

  if (!account) {
    return {
      success: false,
      error: 'Correo electrónico no autorizado o no registrado en el sistema.',
    };
  }

  if (credentials.password !== account.passwordHash) {
    return {
      success: false,
      error: 'Contraseña incorrecta. Por favor verifica tus credenciales.',
    };
  }

  const authenticatedUser: AuthUser = {
    ...account.user,
    lastLogin: new Date().toISOString(),
  };

  persistSession(authenticatedUser, credentials.rememberMe);
  notifyListeners(authenticatedUser);

  return {
    success: true,
    user: authenticatedUser,
  };
};

const persistSession = (user: AuthUser, rememberMe?: boolean) => {
  try {
    const rawUser = JSON.stringify(user);
    if (rememberMe) {
      localStorage.setItem(SESSION_KEY, rawUser);
      sessionStorage.removeItem(SESSION_KEY);
    } else {
      sessionStorage.setItem(SESSION_KEY, rawUser);
      localStorage.removeItem(SESSION_KEY);
    }
  } catch (storageError) {
    console.warn('Storage warning during login:', storageError);
  }
};

/**
 * Cerrar sesión
 */
export const logout = async (): Promise<void> => {
  if (auth && isFirebaseConfigured()) {
    try {
      await fbSignOut(auth);
    } catch (e) {
      console.warn('Firebase signOut warning:', e);
    }
  }

  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_KEY);
    } catch (e) {
      console.error('Error clearing auth session:', e);
    }
  }
  notifyListeners(null);
};

/**
 * Comprobar si hay una sesión activa
 */
export const isAuthenticated = (): boolean => {
  return getStoredUser() !== null;
};

/**
 * Obtener usuario activo
 */
export const getCurrentUser = (): AuthUser | null => {
  return getStoredUser();
};

/**
 * Patrón Observer para suscripción de cambios de sesión
 */
export const onAuthStateChanged = (callback: AuthStateListener): (() => void) => {
  listeners.add(callback);

  // Si Firebase Auth está activo, suscribirse al observador oficial
  if (auth && isFirebaseConfigured()) {
    const fbUnsubscribe = fbOnAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        const mapped = mapFirebaseUserToAuthUser(fbUser);
        persistSession(mapped, true);
        callback(mapped);
      } else {
        callback(getStoredUser());
      }
    });

    return () => {
      listeners.delete(callback);
      fbUnsubscribe();
    };
  }

  // Notificación inicial local
  callback(getStoredUser());

  return () => {
    listeners.delete(callback);
  };
};

/**
 * Proveer credenciales demo para pruebas rápidas de equipo
 */
export const getDemoCredentials = () => {
  return {
    email: 'admin@luxurycars.com',
    password: 'admin123',
  };
};
