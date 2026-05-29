import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
    }

    // Secret key for HMAC calculations
    const secret = process.env.EMAIL_PASS || "placement-ready-admin-secret-key-2026";
    const timeStepMinutes = 5;
    const currentTimeBlock = Math.floor(Date.now() / (timeStepMinutes * 60 * 1000));
    
    let isMatched = false;

    // Verify OTP across current, previous, and prior time blocks to allow 10-15 minute validity and server delay
    for (let i = 0; i <= 2; i++) {
      const timeBlockToCheck = currentTimeBlock - i;
      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(`${email}-${timeBlockToCheck}`);
      const hash = hmac.digest('hex');
      const expectedOtp = (parseInt(hash.substring(0, 8), 16) % 900000 + 100000).toString();
      
      if (expectedOtp === otp) {
        isMatched = true;
        break;
      }
    }

    if (!isMatched) {
      return NextResponse.json({ error: 'Invalid or expired verification code. Please request a new one.' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'OTP verified successfully.' });

  } catch (error: any) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json({ error: error.message || 'Failed to verify code.' }, { status: 500 });
  }
}
