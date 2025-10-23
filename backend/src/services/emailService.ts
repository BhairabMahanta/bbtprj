// services/emailService.ts
import nodemailer, { Transporter } from 'nodemailer';
import { config } from 'dotenv';
config();

class EmailService {
  private transporter: Transporter;
  
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_EMAIL || '',
        pass: process.env.SMTP_PASSWORD || ''
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000
    });
    
    console.log('Email service initialized with:', {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_EMAIL ? process.env.SMTP_EMAIL : 'not set'
    });
  }

  async sendVerificationEmail(email: string, username: string, otp: string): Promise<any> {
    try {
      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Verification</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #2d2d2d;
      color: #e0e0e0;
      border-radius: 10px;
    }
    .header {
      color: #e74c3c;
      text-align: center;
    }
    .verification-code {
      background-color: #3d3d3d;
      padding: 15px;
      border-radius: 5px;
      text-align: center;
      margin: 20px 0;
    }
    .code {
      font-size: 32px;
      letter-spacing: 5px;
      font-weight: bold;
      color: #ffffff;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      font-size: 12px;
      color: #999999;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2 class="header">Welcome to Masks & Machetes!</h2>
    <p>Hello ${username},</p>
    <p>Thank you for registering! Please verify your email address to complete your registration.</p>
    <div class="verification-code">
      <h3 style="margin: 0; color: #e74c3c;">Your Verification Code</h3>
      <p class="code">${otp}</p>
    </div>
    <p>This code will expire in 15 minutes.</p>
    <p>If you did not create an account, please ignore this email.</p>
    <div class="footer">
      <p>Shadowland Universes.</p>
    </div>
  </div>
</body>
</html>
      `;
      
      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_EMAIL || 'noreply@masksandmachetes.com',
        to: email,
        subject: 'Verify Your Email - Masks & Machetes',
        html: html
      };
      
      try {
        const info = await this.transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
        return info;
      } catch (smtpError) {
        console.error('SMTP email failed:', smtpError);
        return await this.sendWithEtherealFallback(mailOptions);
      }
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw new Error(`Failed to send verification email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ✅ NEW: Send password reset email
  async sendPasswordResetEmail(email: string, username: string, otp: string): Promise<any> {
    try {
      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #2d2d2d;
      color: #e0e0e0;
      border-radius: 10px;
    }
    .header {
      color: #e74c3c;
      text-align: center;
    }
    .reset-code {
      background-color: #3d3d3d;
      padding: 15px;
      border-radius: 5px;
      text-align: center;
      margin: 20px 0;
    }
    .code {
      font-size: 32px;
      letter-spacing: 5px;
      font-weight: bold;
      color: #ffffff;
    }
    .warning {
      background-color: #7f1d1d;
      padding: 10px;
      border-radius: 5px;
      margin: 20px 0;
      border-left: 4px solid #dc2626;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      font-size: 12px;
      color: #999999;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2 class="header">🔐 Password Reset Request</h2>
    <p>Hello ${username},</p>
    <p>We received a request to reset your password. Use the code below to reset your password:</p>
    <div class="reset-code">
      <h3 style="margin: 0; color: #e74c3c;">Your Reset Code</h3>
      <p class="code">${otp}</p>
    </div>
    <div class="warning">
      <p style="margin: 0; font-weight: bold;">⚠️ This code expires in 15 minutes</p>
    </div>
    <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
    <div class="footer">
      <p>Shadowland Universes.</p>
    </div>
  </div>
</body>
</html>
      `;
      
      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_EMAIL || 'noreply@masksandmachetes.com',
        to: email,
        subject: '🔐 Password Reset Code - Masks & Machetes',
        html: html
      };
      
      try {
        const info = await this.transporter.sendMail(mailOptions);
        console.log('Password reset email sent:', info.messageId);
        return info;
      } catch (smtpError) {
        console.error('SMTP email failed:', smtpError);
        return await this.sendWithEtherealFallback(mailOptions);
      }
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new Error(`Failed to send password reset email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  private async sendWithEtherealFallback(mailOptions: any): Promise<any> {
    try {
      const testAccount = await nodemailer.createTestAccount();
      console.log('Created Ethereal test account for fallback email delivery');
      
      const etherealTransporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      
      const info = await etherealTransporter.sendMail(mailOptions);
      console.log('Email sent with Ethereal fallback:', info.messageId);
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      return info;
    } catch (fallbackError) {
      console.error('Ethereal fallback also failed:', fallbackError);
      throw fallbackError;
    }
  }
  
  async sendSimpleEmail(email: string, subject: string, text: string): Promise<any> {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_EMAIL || 'noreply@masksandmachetes.com',
        to: email,
        subject: subject,
        text: text
      };
      
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Simple email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending simple email:', error);
      throw new Error(`Failed to send simple email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export default new EmailService();
