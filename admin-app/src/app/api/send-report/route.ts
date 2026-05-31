import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { studentEmail, testTitle, totalScore, maxScore, timeSpent } = await req.json();

    if (!studentEmail || !testTitle || totalScore === undefined || maxScore === undefined) {
      return NextResponse.json({ error: 'Missing required fields for report' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const percentage = ((totalScore / maxScore) * 100).toFixed(1);
    const minutes = Math.floor(timeSpent / 60);
    const seconds = timeSpent % 60;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border-radius: 10px; border: 1px solid #ddd;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #2563eb; margin: 0;">Placement Ready</h2>
          <p style="color: #666; margin-top: 5px;">Assessment Results</p>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
          <h3 style="color: #333; margin-top: 0;">Hello,</h3>
          <p style="color: #555; line-height: 1.5;">
            Your mock test results for <strong>${testTitle}</strong> have been reviewed and published.
          </p>
          
          <div style="margin: 30px 0; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="background-color: #f3f4f6;">
                <td style="padding: 15px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Total Score</td>
                <td style="padding: 15px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold; color: #10b981; font-size: 18px;">
                  ${totalScore} / ${maxScore}
                </td>
              </tr>
              <tr>
                <td style="padding: 15px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Accuracy</td>
                <td style="padding: 15px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold; color: #3b82f6;">
                  ${percentage}%
                </td>
              </tr>
              <tr style="background-color: #f3f4f6;">
                <td style="padding: 15px; font-weight: bold; color: #374151;">Time Taken</td>
                <td style="padding: 15px; text-align: right; color: #6b7280;">
                  ${minutes}m ${seconds}s
                </td>
              </tr>
            </table>
          </div>
          
          <p style="color: #555; line-height: 1.5; margin-bottom: 0;">
            Great job! You can view detailed feedback and question breakdowns directly in your student dashboard.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #9ca3af;">
          <p>You got this email because you signed up on Placement Ready.</p>
        </div>
      </div>
    `;

    // If credentials aren't set up yet, we'll log it instead of crashing
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('--- MOCK REPORT EMAIL SENT ---');
      console.log(`To: ${studentEmail}`);
      console.log(`Score: ${totalScore}/${maxScore}`);
      console.log('HTML:\n', htmlContent);
      return NextResponse.json({ success: true, mock: true });
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: studentEmail,
      subject: `Your Results: ${testTitle}`,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error sending report email:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
