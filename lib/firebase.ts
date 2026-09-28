import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD6O8onzoBHimBSQrigGpvhBpsNtuS5r9s",
  authDomain: "kii-gallery.firebaseapp.com",
  projectId: "kii-gallery",
  storageBucket: "kii-gallery.firebasestorage.app",
  messagingSenderId: "648939569519",
  appId: "1:648939569519:web:41d1937171a35051e6e89a",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);