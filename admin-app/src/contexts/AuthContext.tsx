"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  User, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  sendLoginLink: (email: string) => Promise<void>;
  verifyLoginLink: (email: string, otp: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  logout: async () => {},
  sendLoginLink: async () => {},
  verifyLoginLink: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google", error);
    }
  };

  const sendLoginLink = async (email: string) => {
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send verification code.');
      }
      window.localStorage.setItem('emailForSignIn', email);
    } catch (error) {
      console.error("Error sending OTP:", error);
      throw error;
    }
  };

  const verifyLoginLink = async (email: string, otp: string) => {
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify OTP');
      }

      // OTP is valid! Now sign in to Firebase Auth.
      const defaultPassword = "PlacementReadyAdmin2026!";
      try {
        await signInWithEmailAndPassword(auth, email, defaultPassword);
      } catch (authError: any) {
        // If user does not exist or credentials error, try to create them
        if (authError.code === 'auth/user-not-found' || authError.code === 'auth/invalid-credential') {
          try {
            await createUserWithEmailAndPassword(auth, email, defaultPassword);
          } catch (createError: any) {
            if (createError.code === 'auth/email-already-in-use') {
              // The account exists in Firebase Auth with a different password.
              // Send password reset email automatically.
              const { sendPasswordResetEmail } = await import('firebase/auth');
              await sendPasswordResetEmail(auth, email);
              throw new Error("This email is already in use with a student account. A password reset link has been sent to your email. Please reset your password to log in as admin.");
            }
            console.error("Error creating admin user:", createError);
            throw authError; // throw original sign-in error
          }
        } else {
          throw authError;
        }
      }
      window.localStorage.removeItem('emailForSignIn');
    } catch (error) {
      console.error("Error verifying email link", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout, sendLoginLink, verifyLoginLink }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
