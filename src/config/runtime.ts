// Central place to control runtime flags for local development
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export type DataMode = 'live' | 'mock';
const LS_DATA_MODE_KEY = 'dataMode';

const safeStorage = () => {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
};

export const getStoredDataMode = (): DataMode | null => {
  const storage = safeStorage();
  if (!storage) return null;
  const val = storage.getItem(LS_DATA_MODE_KEY);
  return val === 'live' || val === 'mock' ? val : null;
};

export const setStoredDataMode = (mode: DataMode) => {
  const storage = safeStorage();
  if (!storage) return;
  storage.setItem(LS_DATA_MODE_KEY, mode);
};

// Disable remote APIs by default; toggle can override
export const isLiveDataEnabled = (): boolean => {
  const stored = getStoredDataMode();
  if (stored) return stored === 'live';
  return import.meta.env.VITE_USE_REMOTE_APIS === 'true';
};

// Toggle Firebase usage; off by default for local/offline demos
export const ENABLE_FIREBASE = import.meta.env.VITE_ENABLE_FIREBASE === 'true';

// Realtime socket connection (points to backend when enabled)
export const ENABLE_REALTIME = import.meta.env.VITE_ENABLE_REALTIME !== 'false';
export const REALTIME_URL = import.meta.env.VITE_REALTIME_URL || BACKEND_URL;
