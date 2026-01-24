import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from './firebaseConfig';

export const registerUser = async (email: string, password: string): Promise<User | null> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('✅ User registered:', userCredential.user.email);
    return userCredential.user;
  } catch (error: any) {
    console.error('❌ Registration error:', error.message);
    throw error;
  }
};

export const loginUser = async (email: string, password: string): Promise<User | null> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ User logged in:', userCredential.user.email);
    return userCredential.user;
  } catch (error: any) {
    console.error('❌ Login error:', error.message);
    throw error;
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
    console.log('✅ User logged out');
  } catch (error: any) {
    console.error('❌ Logout error:', error.message);
    throw error;
  }
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

export const onUserAuthStateChanged = (callback: (user: User | null) => void): (() => void) => {
  return onAuthStateChanged(auth, callback);
};
