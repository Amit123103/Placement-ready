import { NextResponse } from 'next/server';
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, getDoc, deleteDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
    }

    const otpDocRef = doc(db, 'admin_otps', email);
    const otpSnap = await getDoc(otpDocRef);

    if (!otpSnap.exists()) {
      return NextResponse.json({ error: 'No verification code found or code has expired. Please try again.' }, { status: 400 });
    }

    const data = otpSnap.data();
    
    // Check if expired
    const expiresAt = new Date(data.expiresAt);
    if (new Date() > expiresAt) {
      await deleteDoc(otpDocRef);
      return NextResponse.json({ error: 'Verification code has expired. Please request a new one.' }, { status: 400 });
    }

    // Check if matches
    if (data.otp !== otp) {
      return NextResponse.json({ error: 'Invalid verification code. Please check and try again.' }, { status: 400 });
    }

    // Success, delete the OTP doc
    await deleteDoc(otpDocRef);
    return NextResponse.json({ success: true, message: 'OTP verified successfully.' });

  } catch (error: any) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json({ error: error.message || 'Failed to verify code.' }, { status: 500 });
  }
}
