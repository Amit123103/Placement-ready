import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { email, name } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Configure nodemailer transporter using environment variables
    const transporter = nodemailer.createTransport({
      service: 'gmail', // You can change this to your provider
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"PlacementReady" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to PlacementReady! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #2563eb;">Welcome to PlacementReady!</h2>
          <p>Hi <strong>${name}</strong>,</p>
          <p>Congratulations on taking the first step towards cracking your dream placement! We're thrilled to have you on board.</p>
          <p>With PlacementReady, you can:</p>
          <ul>
            <li>Practice curated DSA questions</li>
            <li>Take company-specific mock tests</li>
            <li>Apply for exclusive internships</li>
            <li>Access premium study notes and courses</li>
          </ul>
          <p>Click below to jump straight into your dashboard and start preparing:</p>
          <a href="http://localhost:3000/dashboard" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin-top: 10px; font-weight: bold;">Go to Dashboard</a>
          <p style="margin-top: 30px; font-size: 12px; color: #64748b;">If you didn't create this account, you can safely ignore this email.</p>
        </div>
      `,
    };

    // If credentials aren't set up yet, we'll log it instead of crashing
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('--- MOCK EMAIL SENT ---');
      console.log('To:', email);
      console.log('Subject:', mailOptions.subject);
      console.log('(Set EMAIL_USER and EMAIL_PASS in your .env to send real emails)');
      return NextResponse.json({ success: true, message: 'Mock email sent (Missing Credentials)' });
    }

    await transporter.sendMail(mailOptions);
    return NextResponse.json({ success: true, message: 'Email sent successfully' });
    
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
