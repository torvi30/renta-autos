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
 * Get company settings from local cache
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
    console.warn('Error reading settings from local cache:', error);
    return DEFAULT_COMPANY_SETTINGS;
  }
};

/**
 * Persist company settings in local cache
 */
export const saveLocalCompanySettings = (settings: CompanySettings): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error persisting settings to local cache:', error);
  }
};

/**
 * Fetch company settings from Cloud Firestore with local fallback
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
      // First-time seeding in Firestore
      await setDoc(docRef, local);
      return local;
    }
  } catch (error) {
    console.warn('Failed connecting to Firestore for settings, using local fallback:', error);
    return local;
  }
};

/**
 * Update company settings in Firestore and local cache
 */
export const updateCompanySettings = async (settings: CompanySettings): Promise<CompanySettings> => {
  const updated: CompanySettings = {
    ...settings,
    updatedAt: new Date().toISOString(),
  };

  // 1. Save locally immediately (0ms latency)
  saveLocalCompanySettings(updated);

  // 2. Synchronize to cloud if configured
  if (db && isFirebaseConfigured()) {
    try {
      const docRef = doc(db, SETTINGS_COLLECTION, COMPANY_DOC_ID);
      await setDoc(docRef, updated, { merge: true });
    } catch (error) {
      console.warn('Error saving settings to Firestore:', error);
    }
  }

  return updated;
};

/**
 * Subscribe to real-time company settings updates
 */
export const subscribeCompanySettings = (
  callback: (settings: CompanySettings) => void
): (() => void) => {
  // Immediately emit initial local state
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
        console.warn('Error in company settings subscription:', error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.warn('Error initializing settings subscription:', error);
    return () => {};
  }
};
