import { CompanySettings, DEFAULT_COMPANY_SETTINGS } from '../types/settings';
import { db, isFirebaseConfigured } from './firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

const LOCAL_SETTINGS_KEY = 'PREMIUM_RENTAL_COMPANY_SETTINGS_V1';
const SETTINGS_COLLECTION = 'settings';
const COMPANY_DOC_ID = 'company';

const sanitizeSettings = (settings: CompanySettings): CompanySettings => {
  const social = { ...(settings.socialLinks || {}) };
  if (social.instagram === 'https://instagram.com' || social.instagram === 'https://instagram.com/') {
    social.instagram = '';
  }
  if (social.tiktok === 'https://tiktok.com' || social.tiktok === 'https://tiktok.com/') {
    social.tiktok = '';
  }
  if (social.facebook === 'https://facebook.com' || social.facebook === 'https://facebook.com/') {
    social.facebook = '';
  }
  if (social.youtube === 'https://youtube.com' || social.youtube === 'https://youtube.com/') {
    social.youtube = '';
  }
  return { ...settings, socialLinks: social };
};

/**
 * Obtener configuración almacenada en caché local
 */
export const getLocalCompanySettings = (): CompanySettings => {
  if (typeof window === 'undefined') return DEFAULT_COMPANY_SETTINGS;
  try {
    const raw = localStorage.getItem(LOCAL_SETTINGS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(DEFAULT_COMPANY_SETTINGS));
      return DEFAULT_COMPANY_SETTINGS;
    }
    const parsed = sanitizeSettings({ ...DEFAULT_COMPANY_SETTINGS, ...JSON.parse(raw) });
    localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(parsed));
    return parsed;
  } catch (error) {
    console.warn('Error al leer configuración de caché local:', error);
    return DEFAULT_COMPANY_SETTINGS;
  }
};

/**
 * Persistir configuración en caché local
 */
export const saveLocalCompanySettings = (settings: CompanySettings): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error al persistir configuración en caché local:', error);
  }
};

/**
 * Obtener configuración desde Cloud Firestore con fallback local
 */
export const fetchCompanySettings = async (): Promise<CompanySettings> => {
  const local = getLocalCompanySettings();
  if (!db || !isFirebaseConfigured()) {
    return local;
  }

  try {
    const docRef = doc(db, SETTINGS_COLLECTION, COMPANY_DOC_ID);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as Partial<CompanySettings>;
      const merged: CompanySettings = { ...DEFAULT_COMPANY_SETTINGS, ...data };
      saveLocalCompanySettings(merged);
      return merged;
    } else {
      // Sembrar por primera vez en Firestore
      await setDoc(docRef, local);
      return local;
    }
  } catch (error) {
    console.warn('Fallo al conectar con Firestore para configuración, usando local:', error);
    return local;
  }
};

/**
 * Actualizar configuración de la empresa en Firestore y caché local
 */
export const updateCompanySettings = async (settings: CompanySettings): Promise<CompanySettings> => {
  const updated: CompanySettings = {
    ...settings,
    updatedAt: new Date().toISOString(),
  };

  // 1. Guardar en local inmediatamente (0ms latencia)
  saveLocalCompanySettings(updated);

  // 2. Sincronizar en la nube si está configurada
  if (db && isFirebaseConfigured()) {
    try {
      const docRef = doc(db, SETTINGS_COLLECTION, COMPANY_DOC_ID);
      await setDoc(docRef, updated, { merge: true });
    } catch (error) {
      console.warn('Error al guardar configuración en Firestore:', error);
    }
  }

  return updated;
};

/**
 * Suscribirse a cambios en tiempo real de la configuración
 */
export const subscribeCompanySettings = (
  callback: (settings: CompanySettings) => void
): (() => void) => {
  // Emitir estado local inicial de inmediato
  callback(getLocalCompanySettings());

  if (!db || !isFirebaseConfigured()) {
    return () => {};
  }

  try {
    const docRef = doc(db, SETTINGS_COLLECTION, COMPANY_DOC_ID);
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as Partial<CompanySettings>;
          const merged: CompanySettings = { ...DEFAULT_COMPANY_SETTINGS, ...data };
          saveLocalCompanySettings(merged);
          callback(merged);
        }
      },
      (error) => {
        console.warn('Error en suscripción a configuración de empresa:', error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.warn('Error inicializando suscripción a configuración:', error);
    return () => {};
  }
};
