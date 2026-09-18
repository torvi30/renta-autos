import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.apiKey !== 'tu_api_key_aqui' &&
      firebaseConfig.projectId
  );
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

if (isFirebaseConfigured()) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (error) {
    console.warn('Firebase initialization warning:', error);
  }
} else {
  console.info('Firebase credentials not detected or incomplete. Running in decoupled local/demo mode.');
}

export const getFirebaseStatus = () => ({
  isConfigured: isFirebaseConfigured(),
  projectId: firebaseConfig.projectId || '',
  bucket: firebaseConfig.storageBucket || '',
  authDomain: firebaseConfig.authDomain || '',
});

export const testFirebaseConnection = async (): Promise<{
  success: boolean;
  message: string;
  projectId: string;
  bucket: string;
  authReady: boolean;
  firestoreReady: boolean;
  storageReady: boolean;
}> => {
  if (!isFirebaseConfigured()) {
    return {
      success: false,
      message: 'Credenciales de Firebase no detectadas en .env',
      projectId: '',
      bucket: '',
      authReady: false,
      firestoreReady: false,
      storageReady: false,
    };
  }

  try {
    const authReady = Boolean(auth);
    const firestoreReady = Boolean(db);
    const storageReady = Boolean(storage);

    return {
      success: true,
      message: `Conexión activa con Firebase Cloud (Proyecto: ${firebaseConfig.projectId})`,
      projectId: firebaseConfig.projectId || '',
      bucket: firebaseConfig.storageBucket || '',
      authReady,
      firestoreReady,
      storageReady,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Error al validar conexión con Firebase Cloud.',
      projectId: firebaseConfig.projectId || '',
      bucket: firebaseConfig.storageBucket || '',
      authReady: false,
      firestoreReady: false,
      storageReady: false,
    };
  }
};

export { app, auth, db, storage };
