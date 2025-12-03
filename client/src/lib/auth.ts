import { initializeApp } from 'firebase/app';
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    type User
} from 'firebase/auth';

// Firebase configuration
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
export const auth = getAuth(app);

// Google Sign-In
export const signInWithGoogle = async (): Promise<User> => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
        prompt: 'select_account'
    });

    try {
        const result = await signInWithPopup(auth, provider);
        return result.user;
    } catch (error: any) {
        console.error('Error signing in with Google:', error);
        throw error;
    }
};

// Sign Out
export const signOut = async (): Promise<void> => {
    try {
        await firebaseSignOut(auth);
    } catch (error) {
        console.error('Error signing out:', error);
        throw error;
    }
};

// Auth state observer
export const onAuthChange = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
};

// Get current user token
export const getCurrentUserToken = async (): Promise<string | null> => {
    const user = auth.currentUser;
    if (!user) return null;

    try {
        return await user.getIdToken();
    } catch (error) {
        console.error('Error getting user token:', error);
        return null;
    }
};
