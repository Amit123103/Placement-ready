import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    const { subject, message } = await req.json();

    if (!subject || !message) {
      return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 });
    }

    // Fetch all users from Firestore
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const emails: string[] = [];
    usersSnapshot.forEach((doc) => {
      const email = doc.data().email;
      if (email) emails.push(email);
    });

    if (emails.length === 0) {
      return NextResponse.json({ error: 'No valid user emails found in database' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // If credentials aren't set up yet, we'll log it instead of crashing
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('--- MOCK BROADCAST EMAIL SENT ---');
      console.log(`To: ${emails.length} users (${emails.join(', ')})`);
      console.log('Subject:', subject);
      console.log('Message:', message);
      console.log('(Set EMAIL_USER and EMAIL_PASS in your .env to send real emails)');
      return NextResponse.json({ success: true, message: `Mock broadcast sent to ${emails.length} users.` });
    }

    // Send emails (using BCC so users don't see each other's emails)
    const mailOptions = {
      from: `"PlacementReady Admin" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to self
      bcc: emails.join(', '),     // BCC everyone else
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #2563eb;">PlacementReady Update</h2>
          <div style="margin: 20px 0; line-height: 1.6;">
            ${message}
          </div>
          <p style="margin-top: 30px; font-size: 12px; color: #64748b;">You are receiving this email because you are registered on PlacementReady.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return NextResponse.json({ success: true, message: `Broadcast sent to ${emails.length} users.` });
    
  } catch (error) {
    console.error('Error sending broadcast:', error);
    return NextResponse.json({ error: 'Failed to send broadcast email' }, { status: 500 });
  }
}
