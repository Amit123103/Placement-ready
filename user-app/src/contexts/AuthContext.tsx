"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider, OAuthProvider, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signUpWithEmail: (name: string, email: string, password: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signInWithApple: async () => {},
  signUpWithEmail: async () => {},
  signInWithEmail: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Check 24 hours auto-logout
        const lastActiveStr = localStorage.getItem('lastActive');
        if (lastActiveStr) {
          const lastActive = parseInt(lastActiveStr, 10);
          const now = Date.now();
          const twentyFourHours = 24 * 60 * 60 * 1000;
          if (now - lastActive > twentyFourHours) {
            localStorage.removeItem('lastActive');
            await signOut(auth);
            setUser(null);
            setLoading(false);
            router.push('/');
            return;
          }
        }
        localStorage.setItem('lastActive', Date.now().toString());

        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userDocRef);
          
          if (!userSnap.exists()) {
            await setDoc(userDocRef, {
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || "New User",
              email: firebaseUser.email,
              role: "Student",
              status: "Active",
              createdAt: serverTimestamp()
            });

            // Trigger welcome email asynchronously
            fetch('/api/send-welcome', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                email: firebaseUser.email, 
                name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || "Student" 
              })
            }).catch(console.error);
          }
        } catch (error) {
          console.error("Error syncing user to Firestore:", error);
        }
      }
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Track active state to auto-logout after 24h of inactivity/closing the app
  useEffect(() => {
    if (!user) return;

    const updateActiveTime = () => {
      localStorage.setItem('lastActive', Date.now().toString());
    };

    updateActiveTime();

    const interval = setInterval(updateActiveTime, 30000); // every 30 seconds

    const handleInteraction = () => {
      updateActiveTime();
    };

    window.addEventListener('beforeunload', updateActiveTime);
    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', updateActiveTime);
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, [user]);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google", error);
    }
  };

  const signInWithApple = async () => {
    const provider = new OAuthProvider('apple.com');
    provider.addScope('email');
    provider.addScope('name');
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Apple", error);
    }
  };

  const signUpWithEmail = async (name: string, email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
    } catch (error: any) {
      console.error("Error signing up with email", error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error("Error signing in with email", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('lastActive');
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signInWithApple, signUpWithEmail, signInWithEmail, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
