'use client';

// 🔹 Firebase core
import {
  getApps,
  initializeApp,
  FirebaseApp,
  FirebaseOptions,
} from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getDatabase, Database } from 'firebase/database';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// 🔹 Config
import { firebaseConfig } from './config';

// 🔹 Hooks & Providers (IMPORT FIRST ✅)
import { useUser } from './auth/use-user';
import { useCollection } from './firestore/use-collection';
import { useDoc } from './firestore/use-doc';
import {
  FirebaseProvider,
  useFirebase,
  useFirebaseApp,
  useFirestore,
  useAuth,
  useDatabase,
  useStorage,
} from './provider';
import { FirebaseClientProvider } from './client-provider';

// 🔹 Firebase singletons
let firebaseApp: FirebaseApp | undefined;
let auth: Auth | undefined;
let firestore: Firestore | undefined;
let database: Database | undefined;
let storage: FirebaseStorage | undefined;

// 🔹 Types
export type FirebaseServices = {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
  database: Database;
  storage: FirebaseStorage;
};

// 🔹 Initialize Firebase (safe for Next.js)
function initializeFirebase(
  config: FirebaseOptions = firebaseConfig
): FirebaseServices {
  if (!firebaseApp) {
    if (getApps().length === 0) {
      firebaseApp = initializeApp(config);
    } else {
      firebaseApp = getApps()[0];
    }

    auth = getAuth(firebaseApp);
    firestore = getFirestore(firebaseApp);
    database = getDatabase(firebaseApp);
    storage = getStorage(firebaseApp);
  }

  return {
    firebaseApp,
    auth: auth!,
    firestore: firestore!,
    database: database!,
    storage: storage!,
  };
}

// 🔹 EXPORTS (AFTER imports ✅)
export {
  initializeFirebase,
  firebaseApp,
  auth,
  firestore,
  database,
  storage,

  // hooks
  useUser,
  useCollection,
  useDoc,

  // providers & helpers
  FirebaseProvider,
  FirebaseClientProvider,
  useFirebase,
  useFirebaseApp,
  useFirestore,
  useAuth,
  useDatabase,
  useStorage,
};
