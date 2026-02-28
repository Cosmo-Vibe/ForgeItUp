import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { ENV } from './constants';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    if (getApps().length > 0) {
      app = getApps()[0];
    } else {
      if (!ENV.FIREBASE_CONFIG) {
        throw new Error('Firebase config is not set. Check NEXT_PUBLIC_FIREBASE_CONFIG env var.');
      }
      app = initializeApp(ENV.FIREBASE_CONFIG);
    }
  }
  return app;
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
  }
  return auth;
}
