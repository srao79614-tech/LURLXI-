import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  onSnapshot,
  getDocFromServer,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

export {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  onSnapshot,
  serverTimestamp,
};
export type { FirebaseUser };

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firestore with specific database ID (CRITICAL: Required for multi-db setup)
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Operation Types & Error Handler conforming to SKILL.md specification
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection check as required by SKILL.md
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline status:', error.message);
    }
  }
}

// Helper methods for Firebase Authentication and Firestore User Synced State
export async function signInWithGoogleFirebase() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err) {
    console.error('Firebase Google Sign-In error:', err);
    throw err;
  }
}

export async function signOutFirebase() {
  try {
    await signOut(auth);
  } catch (err) {
    console.error('Firebase Sign-Out error:', err);
    throw err;
  }
}

export async function syncUserProfileToFirestore(user: FirebaseUser, extraData?: { selectedCategory?: string; isVip?: boolean; role?: string }) {
  if (!user || !user.uid) return;
  const path = `users/${user.uid}`;
  const cleanEmail = (user.email || '').toLowerCase().trim();
  const isVipUser =
    cleanEmail === 'srao79614@gmail.com' ||
    cleanEmail === 'lurlbusiness7@gmail.com' ||
    extraData?.isVip === true;

  try {
    const userRef = doc(db, 'users', user.uid);
    const existing = await getDoc(userRef);
    if (!existing.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email || '',
        name: user.displayName || user.email?.split('@')[0] || 'Executive Member',
        avatarUrl: user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        selectedCategory: extraData?.selectedCategory || 'trading',
        isVip: isVipUser,
        role: isVipUser ? 'VIP Executive Founder' : (extraData?.role || 'Verified Member'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } else {
      const existingIsVip = existing.data()?.isVip === true;
      const finalIsVip = isVipUser || existingIsVip;
      await updateDoc(userRef, {
        name: user.displayName || existing.data()?.name || 'Executive Member',
        avatarUrl: user.photoURL || existing.data()?.avatarUrl || '',
        isVip: finalIsVip,
        role: finalIsVip ? 'VIP Executive Founder' : (existing.data()?.role || 'Verified Member'),
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
