import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot,
  enableIndexedDbPersistence,
  collection,
  query,
  where,
  getDocs,
  limit,
} from 'firebase/firestore';
import type { Trip } from '../types';

const firebaseConfig = {
  apiKey: "AIzaSyC4iMJxTc7Fvsab5wsqRSCW5ehYIWPPQhY",
  authDomain: "tripcore-d9365.firebaseapp.com",
  projectId: "tripcore-d9365",
  storageBucket: "tripcore-d9365.firebasestorage.app",
  messagingSenderId: "318849364517",
  appId: "1:318849364517:web:38e32187da94a89a87c5cc",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Enable offline persistence (IndexedDB cache)
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Firestore persistence unavailable — multiple tabs open');
  }
});

/** Ensure user is anonymously authenticated. Returns the Firebase UID. */
export async function ensureAuth(): Promise<string> {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      if (user) {
        resolve(user.uid);
      } else {
        try {
          const credential = await signInAnonymously(auth);
          resolve(credential.user.uid);
        } catch (err) {
          reject(err);
        }
      }
    });
  });
}

/** Subscribe to real-time updates of a trip document. Returns unsubscribe function. */
export function subscribeToTrip(
  tripId: string,
  onUpdate: (trip: Trip | null) => void
): () => void {
  const tripRef = doc(db, 'trips', tripId);
  return onSnapshot(
    tripRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as Trip);
      } else {
        onUpdate(null);
      }
    },
    (error) => {
      console.error('Firestore subscription error:', error);
    }
  );
}

/** Write the full trip document to Firestore. Derives memberUids for security rules. */
export async function saveTrip(tripId: string, trip: Trip): Promise<void> {
  const memberUids = trip.members.map((m) => m.firebaseUid).filter(Boolean) as string[];
  const tripRef = doc(db, 'trips', tripId);
  await setDoc(tripRef, { ...trip, memberUids }, { merge: true });
}

/** Check if a slug is already taken by another trip. */
export async function checkSlugAvailable(slug: string, excludeTripId?: string): Promise<boolean> {
  const q = query(collection(db, 'trips'), where('slug', '==', slug), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return true;
  if (excludeTripId) {
    return snapshot.docs[0].id === excludeTripId;
  }
  return false;
}

/**
 * Resolve a short slug to the real trip UUID.
 * Returns the trip ID if found, null otherwise.
 */
export async function resolveSlug(slug: string): Promise<string | null> {
  const q = query(collection(db, 'trips'), where('slug', '==', slug), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return snapshot.docs[0].id;
}
