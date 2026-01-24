/// <reference types="vite/client" />
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAbBkrK_pQHLIq-EI00QxiSa4D5hEKq1Pw",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "hethongluyenthi-e1386.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "hethongluyenthi-e1386",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "hethongluyenthi-e1386.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "847715061803",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:847715061803:web:d5e6f7c8a9b0c1d2e3f4"
};

console.log('🔧 Firebase Config Loaded:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  apiKeyStart: firebaseConfig.apiKey?.substring(0, 10) + '...',
  apiKeyLength: firebaseConfig.apiKey?.length,
  usingEnvKey: !!import.meta.env.VITE_FIREBASE_API_KEY
});

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
