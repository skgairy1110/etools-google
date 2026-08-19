import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD6fC68W2XqgyYzehwY0upFy-QdUQE-sWM",
  authDomain: "etools-login.firebaseapp.com",
  projectId: "etools-login",
  storageBucket: "etools-login.firebasestorage.app",
  messagingSenderId: "184497331244",
  appId: "1:184497331244:web:250ff03682579b79d24589",
  measurementId: "G-V2888ZRY11"
};

let app, auth, db, analytics;
try {
  app = initializeApp(firebaseConfig);
  if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
  }
  auth = getAuth(app);
  db = getFirestore(app);
} catch (e) {
  console.warn("Firebase initialization skipped or non-browser environment detected.", e);
}

export { app, auth, db };