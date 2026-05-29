import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { firstName, lastName, email, message } = await req.json();

    if (!firstName || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('--- MOCK CONTACT FORM EMAIL SENT ---');
      console.log(`From: ${firstName} ${lastName} <${email}>`);
      console.log(`Message: ${message}`);
      return NextResponse.json({ success: true });
    }

    const mailOptions = {
      from: `"${firstName} ${lastName}" <${process.env.EMAIL_USER}>`,
      to: 'rik0rik8957@gmail.com', // Sending directly to requested email
      replyTo: email,
      subject: `New Contact Form Submission from ${firstName}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>New Message via PlacementReady Contact Form</h2>
          <p><strong>Name:</strong> ${firstName} ${lastName || ''}</p>
          <p><strong>Email:</strong> ${email}</p>
          <hr />
          <h3>Message:</h3>
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return NextResponse.json({ success: true, message: 'Message sent!' });
    
  } catch (error) {
    console.error('Error sending contact email:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
