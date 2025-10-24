// services/emailService.ts
import nodemailer, { Transporter } from 'nodemailer';
import { config } from 'dotenv';
config();

class EmailService {
  private transporter: Transporter;
  
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '465'),
      secure: process.env.EMAIL_PORT === '465', // true for 465, false for 587
      auth: {
        user: process.env.SMTP_EMAIL || '', // ✅ YOUR VARIABLE NAME
        pass: process.env.SMTP_PASSWORD || ''
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000
    });
    
    console.log('Email service initialized with:', {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_PORT === '465',
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
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
      padding: 30px;
      text-align: center;
    }
    .header h2 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      padding: 40px 30px;
      color: #333333;
    }
    .verification-code {
      background-color: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      margin: 30px 0;
      border: 2px dashed #667eea;
    }
    .code {
      font-size: 36px;
      letter-spacing: 8px;
      font-weight: bold;
      color: #667eea;
      font-family: 'Courier New', monospace;
    }
    .info-box {
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #6c757d;
      border-top: 1px solid #e9ecef;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>✉️ Email Verification</h2>
    </div>
    <div class="content">
      <p>Hello <strong>${username}</strong>,</p>
      <p>Thank you for signing up! Please verify your email address to complete your registration.</p>
      
      <div class="verification-code">
        <h3 style="margin: 0 0 10px 0; color: #667eea;">Your Verification Code</h3>
        <p class="code">${otp}</p>
      </div>
      
      <div class="info-box">
        <p style="margin: 0;">⏱️ This code will expire in <strong>15 minutes</strong></p>
      </div>
      
      <p>Enter this code on the verification page to activate your account.</p>
      <p>If you didn't create an account, please ignore this email.</p>
    </div>
    <div class="footer">
      <p>This is an automated message, please do not reply to this email.</p>
      <p>&copy; ${new Date().getFullYear()} Your App. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
      `;
      
      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.SMTP_EMAIL,
        to: email,
        subject: 'Verify Your Email Address',
        html: html
      };
      
      try {
        const info = await this.transporter.sendMail(mailOptions);
        console.log('Verification email sent:', info.messageId);
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
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: #ffffff;
      padding: 30px;
      text-align: center;
    }
    .content {
      padding: 40px 30px;
      color: #333333;
    }
    .reset-code {
      background-color: #fff7ed;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      margin: 30px 0;
      border: 2px dashed #f59e0b;
    }
    .code {
      font-size: 36px;
      letter-spacing: 8px;
      font-weight: bold;
      color: #f59e0b;
      font-family: 'Courier New', monospace;
    }
    .warning {
      background-color: #fee2e2;
      border-left: 4px solid #dc2626;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #6c757d;
      border-top: 1px solid #e9ecef;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>🔐 Password Reset Request</h2>
    </div>
    <div class="content">
      <p>Hello <strong>${username}</strong>,</p>
      <p>We received a request to reset your password. Use the code below to proceed:</p>
      
      <div class="reset-code">
        <h3 style="margin: 0 0 10px 0; color: #f59e0b;">Your Reset Code</h3>
        <p class="code">${otp}</p>
      </div>
      
      <div class="warning">
        <p style="margin: 0; font-weight: bold;">⚠️ This code expires in 15 minutes</p>
      </div>
      
      <p>If you didn't request this, please ignore this email. Your password will remain unchanged.</p>
    </div>
    <div class="footer">
      <p>This is an automated message, please do not reply to this email.</p>
      <p>&copy; ${new Date().getFullYear()} Your App. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
      `;
      
      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.SMTP_EMAIL,
        to: email,
        subject: '🔐 Password Reset Code',
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
      console.log('Created Ethereal test account for fallback');
      
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
      console.log('Ethereal Preview URL:', nodemailer.getTestMessageUrl(info));
      return info;
    } catch (fallbackError) {
      console.error('Ethereal fallback failed:', fallbackError);
      throw fallbackError;
    }
  }
}

export default new EmailService();
