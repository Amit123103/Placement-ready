import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Generate a stateless, secure 6-digit OTP using HMAC based on current time block
    const secret = process.env.EMAIL_PASS || "placement-ready-admin-secret-key-2026";
    const timeStepMinutes = 5;
    const timeBlock = Math.floor(Date.now() / (timeStepMinutes * 60 * 1000));
    
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`${email}-${timeBlock}`);
    const hash = hmac.digest('hex');
    
    const otp = (parseInt(hash.substring(0, 8), 16) % 900000 + 100000).toString();

    // Configure nodemailer transporter using environment variables
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"PlacementReady Admin" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `PlacementReady Admin Verification Code: ${otp} 🔑`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #6366f1; text-align: center;">PlacementReady Admin Portal</h2>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p>Hello Admin,</p>
          <p>We received a request to log in to the PlacementReady Admin Portal. Use the verification code below to complete your sign-in:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="display: inline-block; font-family: monospace; font-size: 36px; font-weight: bold; letter-spacing: 6px; color: #4f46e5; background-color: #f5f3ff; padding: 15px 30px; border-radius: 10px; border: 1px solid #e0e7ff;">${otp}</span>
          </div>
          <p style="color: #ef4444; font-weight: 500;">Note: This verification code is extremely sensitive. Do not share it with anyone. It will expire in 10 minutes.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748b;">If you did not request this code, you can safely ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return NextResponse.json({ success: true, message: 'Verification code sent to your email.' });
    
  } catch (error: any) {
    console.error('Error sending OTP:', error);
    return NextResponse.json({ error: error.message || 'Failed to send verification code.' }, { status: 500 });
  }
}
