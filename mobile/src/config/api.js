import { Platform } from 'react-native';

const DEFAULT_DEV_WEB_API_BASE_URL = 'http://localhost:8000';
const DEFAULT_DEV_ANDROID_EMULATOR_API_BASE_URL = 'http://10.0.2.2:8000';
const DEFAULT_DEV_IOS_SIMULATOR_API_BASE_URL = 'http://localhost:8000';
const DEFAULT_PROD_API_BASE_URL = 'http://alda-upt.sytes.net:8300';

const getDefaultDevApiBaseUrl = () => {
  if (Platform.OS === 'web') return DEFAULT_DEV_WEB_API_BASE_URL;
  if (Platform.OS === 'android') return DEFAULT_DEV_ANDROID_EMULATOR_API_BASE_URL;
  if (Platform.OS === 'ios') return DEFAULT_DEV_IOS_SIMULATOR_API_BASE_URL;
  return DEFAULT_DEV_WEB_API_BASE_URL;
};

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  (__DEV__ ? getDefaultDevApiBaseUrl() : DEFAULT_PROD_API_BASE_URL);

// Exportación directa para uso en servicios como WebSocket
export const API_URL = API_BASE_URL;

export const API = {
  BASE_URL: API_BASE_URL,
  ENDPOINTS: {
    GOOGLE_LOGIN: `${API_BASE_URL}/api/v1/auth/google-login`,
    ME: `${API_BASE_URL}/api/v1/auth/me`,
    DOUBTS_FEED: `${API_BASE_URL}/api/v1/doubts/feed`,
    DOUBTS_CREATE: `${API_BASE_URL}/api/v1/doubts`,
    SUBJECTS: `${API_BASE_URL}/api/v1/doubts/subjects`,
    USER_PROFILE: (id) => `${API_BASE_URL}/api/v1/users/${id}`,
    USER_STATS: (id) => `${API_BASE_URL}/api/v1/users/${id}/stats`,
    DOUBT_RESOLVE: (id) => `${API_BASE_URL}/api/v1/doubts/${id}/resolve`,
  },
};

const envOr = (key, fallback) => process.env[key] || fallback;

export const FIREBASE_CONFIG = {
  apiKey: envOr('EXPO_PUBLIC_FIREBASE_API_KEY', "AIzaSyAIZGKzP0uZMsik6MLgxc7zYyo0MTuq6Yw"),
  authDomain: envOr('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN', "moviles-ii-exu.firebaseapp.com"),
  projectId: envOr('EXPO_PUBLIC_FIREBASE_PROJECT_ID', "moviles-ii-exu"),
  storageBucket: envOr('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET', "moviles-ii-exu.firebasestorage.app"),
  messagingSenderId: envOr('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', "383522118386"),
  appId: envOr('EXPO_PUBLIC_FIREBASE_APP_ID', "1:383522118386:web:50861e018b080fd4930e6b"),
};

export const GOOGLE_WEB_CLIENT_ID = envOr(
  'EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID',
  "826063210825-e4kj9pupsnbqmtggqt6rh2f1ch8ahfuj.apps.googleusercontent.com",
);
export const GOOGLE_ANDROID_CLIENT_ID = envOr(
  'EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID',
  "826063210825-kgjqr3tas8ujgcbo6mb26pf63q01rtlh.apps.googleusercontent.com",
);

export const ALLOWED_DOMAIN = "virtual.upt.pe";
