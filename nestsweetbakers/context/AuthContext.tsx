'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  GoogleAuthProvider, 
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  User
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  signIn: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // Check if user is admin or superAdmin
  const checkAdminStatus = async (uid: string) => {
    try {
      const [adminDoc, superAdminDoc] = await Promise.all([
        getDoc(doc(db, 'admins', uid)),
        getDoc(doc(db, 'superAdmins', uid))
      ]);

      setIsSuperAdmin(superAdminDoc.exists());
      setIsAdmin(adminDoc.exists() || superAdminDoc.exists());
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
      setIsSuperAdmin(false);
    }
  };

  // Create/update user profile in Firestore
  const ensureUserProfile = async (currentUser: User) => {
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        await setDoc(userRef, {
          uid: currentUser.uid,
          email: currentUser.email,
          name: currentUser.displayName || '',
          phone: currentUser.phoneNumber || '',
          photoURL: currentUser.photoURL || '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        await setDoc(userRef, {
          updatedAt: serverTimestamp(),
        }, { merge: true });
      }
    } catch (error) {
      console.error('Error creating user profile:', error);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        await Promise.all([
          checkAdminStatus(currentUser.uid),
          ensureUserProfile(currentUser)
        ]);
      } else {
        setIsAdmin(false);
        setIsSuperAdmin(false);
      }

      setLoading(false);
    }, (error) => {
      console.error('Auth state change error:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    if (typeof window === 'undefined') return;
    
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(error.message || 'Failed to sign in');
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    if (typeof window === 'undefined') return;
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('Email sign in error:', error);
      throw new Error(error.message || 'Failed to sign in');
    }
  };

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    if (typeof window === 'undefined') return;
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName: name });
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw new Error(error.message || 'Failed to sign up');
    }
  };

  const resetPassword = async (email: string) => {
    if (typeof window === 'undefined') return;
    
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw new Error(error.message || 'Failed to send reset email');
    }
  };

  const signOut = async () => {
    if (typeof window === 'undefined') return;
    
    try {
      await firebaseSignOut(auth);
      setIsAdmin(false);
      setIsSuperAdmin(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isAdmin, 
      isSuperAdmin, 
      signIn, 
      signInWithEmail,
      signUpWithEmail,
      resetPassword,
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
