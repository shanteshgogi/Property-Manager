// Client-side Firebase configuration
// This is currently not used in the app but is available for future features
// like Firebase Authentication or real-time listeners

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAJN4ikN-e7xDrrmOpQhqaaPkp4oz_KBsQ",
    authDomain: "property-manager-f2fb9.firebaseapp.com",
    projectId: "property-manager-f2fb9",
    storageBucket: "property-manager-f2fb9.firebasestorage.app",
    messagingSenderId: "881591686888",
    appId: "1:881591686888:web:74dc175da12318ccdb9b5d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services (currently unused)
export const auth = getAuth(app);
export const firestore = getFirestore(app);

export default app;
