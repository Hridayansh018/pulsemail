import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  try {
    const { name, email, message } = await request.json();

    // Validate input
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }


    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.ADMIN_HOST_EMAIL,
        pass: process.env.ADMIN_HOST_APP_PASSWORD,
      },
    });

    // Customer thank you email
    const customerMailOptions = {
      from: process.env.ADMIN_HOST_EMAIL,
      to: email,
      subject: "Thank you for contacting PulseMail!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">PulseMail</h1>
          </div>
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Hi ${name}!</h2>
            <p style="color: #666; line-height: 1.6; font-size: 16px;">
              Thank you for reaching out to us! We've received your message and our team will get back to you shortly.
            </p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h3 style="color: #333; margin: 0 0 10px 0;">Your Message:</h3>
              <p style="color: #666; margin: 0; font-style: italic;">"${message}"</p>
            </div>
            <p style="color: #666; line-height: 1.6;">
              In the meantime, feel free to explore our platform and see how PulseMail can help you with bulk email sending.
            </p>
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://yourapp.com'}/auth" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Get Started with PulseMail
              </a>
            </div>
          </div>
          <div style="background: #333; color: #999; padding: 20px; text-align: center; font-size: 14px;">
            <p>© 2025 PulseMail. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    // Admin notification email
    const adminMailOptions = {
      from: process.env.ADMIN_HOST_EMAIL,
      to: process.env.ADMIN_EMAIL,
      subject: "🔔 New Contact Form Submission - PulseMail",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #dc2626; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🔔 New Contact Request</h1>
          </div>
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Contact Details:</h2>
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p style="margin: 0 0 10px 0;"><strong>Name:</strong> ${name}</p>
              <p style="margin: 0 0 10px 0;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
              <p style="margin: 0;"><strong>Submitted:</strong> ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
            </div>
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626;">
              <h3 style="color: #333; margin: 0 0 15px 0;">Message:</h3>
              <p style="color: #666; margin: 0; white-space: pre-wrap;">${message}</p>
            </div>
            <div style="margin-top: 20px; padding: 15px; background: #e3f2fd; border-radius: 8px;">
              <p style="margin: 0; color: #1976d2;">
                <strong>Action Required:</strong> Please respond to this customer inquiry as soon as possible.
              </p>
            </div>
          </div>
        </div>
      `,
    };

    // Send both emails
    await Promise.all([
      transporter.sendMail(customerMailOptions),
      transporter.sendMail(adminMailOptions),
    ]);

    return NextResponse.json({
      success: true,
      message: "Thank you for your message! We'll get back to you soon.",
    });

  } catch (error: any) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again later." },
      { status: 500 }
    );
  }
}
