// firebase/config.js
// ─────────────────────────────────────────────────────────────
// HOW TO FILL THIS FILE:
// 1. Go to firebase.google.com
// 2. Open your "skillslot" project
// 3. Click the gear icon ⚙️ → Project Settings
// 4. Scroll down to "Your apps" section
// 5. Click the "</>" web app
// 6. Copy each value and paste below
// ─────────────────────────────────────────────────────────────

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ↓↓↓ REPLACE THESE WITH YOUR ACTUAL VALUES FROM FIREBASE ↓↓↓
const firebaseConfig = {
  apiKey: "AIzaSyAdBBhVwy_rx8Cgydv8mZwjdXHnt8hqhsE",
  authDomain: "skillslot.firebaseapp.com",
  projectId: "skillslot",
  storageBucket: "skillslot.firebasestorage.app",
  messagingSenderId: "487734544426",
  appId: "1:487734544426:web:17a0faaec9145f24271b53"
};
// ↑↑↑ REPLACE THESE WITH YOUR ACTUAL VALUES FROM FIREBASE ↑↑↑

// Check if config is still placeholder — warn in console
const isConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY";
if (!isConfigured) {
  console.warn(
    "⚠️ Firebase not configured yet!\n" +
    "Open src/firebase/config.js and replace the placeholder values\n" +
    "with your actual Firebase project config."
  );
}

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
