const nodemailer = require('nodemailer');
const env = require('../../../config/environment');
const logger = require('../../../common/logger/winston');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: env.email.user,
    pass: env.email.pass
  }
});

// Common Email Frame Wrapper
const wrapEmailTemplate = (title, contentHTML) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-color: #F8FAFC;
          color: #0F172A;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #FFFFFF;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          border: 1px solid #E2E8F0;
        }
        .header {
          background: linear-gradient(135deg, #2563EB 0%, #4F46E5 100%);
          padding: 30px 20px;
          text-align: center;
        }
        .header h1 {
          color: #FFFFFF;
          margin: 0;
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -0.025em;
        }
        .content {
          padding: 40px 30px;
          line-height: 1.6;
        }
        .footer {
          background-color: #F1F5F9;
          padding: 20px 30px;
          text-align: center;
          font-size: 12px;
          color: #64748B;
          border-top: 1px solid #E2E8F0;
        }
        .otp-box {
          font-size: 32px;
          font-weight: 800;
          letter-spacing: 6px;
          text-align: center;
          padding: 16px 20px;
          background-color: #EFF6FF;
          border: 2px dashed #2563EB;
          border-radius: 8px;
          color: #2563EB;
          margin: 30px auto;
          max-width: 250px;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #2563EB;
          color: #FFFFFF !important;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          text-align: center;
          margin: 20px 0;
        }
        .alert-box {
          padding: 16px;
          background-color: #FEF2F2;
          border-left: 4px solid #EF4444;
          border-radius: 6px;
          color: #991B1B;
          font-size: 14px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Research Connect</h1>
        </div>
        <div class="content">
          ${contentHTML}
        </div>
        <div class="footer">
          <p>This is an automated security email from Research Connect.</p>
          <p>&copy; ${new Date().getFullYear()} Research Connect. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: `"Research Connect" <${env.email.user}>`,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent successfully to ${to}. Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    logger.error(`Failed to send email to ${to}: ${error.message}`, error);
    return false;
  }
};

const sendRegistrationOtp = async (to, otp) => {
  const content = `
    <h2>Verify Your Email Address</h2>
    <p>Thank you for starting your registration on <strong>Research Connect</strong>. Please use the following 6-digit One-Time Password (OTP) to complete your email verification process. This OTP is valid for <strong>10 minutes</strong>.</p>
    <div class="otp-box">${otp}</div>
    <p>If you did not initiate this request, you can safely ignore this email.</p>
  `;
  return await sendEmail(to, 'Verify Your Email - Research Connect OTP', wrapEmailTemplate('Email Verification', content));
};

const sendLoginOtp = async (to, otp, metadata = {}) => {
  const { ip = 'Unknown', device = 'Unknown', browser = 'Unknown' } = metadata;
  const content = `
    <h2>Security Verification Code</h2>
    <p>A login attempt was made to your <strong>Research Connect</strong> account. Use this One-Time Password (OTP) to verify your identity. This OTP is valid for <strong>10 minutes</strong>.</p>
    <div class="otp-box">${otp}</div>
    <div class="alert-box" style="background-color: #F8FAFC; border-left: 4px solid #CBD5E1; color: #475569;">
      <strong>Details of Login Attempt:</strong><br>
      IP Address: ${ip}<br>
      Device: ${device}<br>
      Browser: ${browser}
    </div>
    <p>If this was not you, please log in immediately and change your password or contact support.</p>
  `;
  return await sendEmail(to, 'Security Login Code - Research Connect OTP', wrapEmailTemplate('Login Verification', content));
};

const sendForgotPasswordOtp = async (to, otp) => {
  const content = `
    <h2>Reset Password Request</h2>
    <p>We received a request to reset your password on <strong>Research Connect</strong>. Use this 6-digit One-Time Password (OTP) to proceed with resetting your password. This OTP is valid for <strong>10 minutes</strong>.</p>
    <div class="otp-box">${otp}</div>
    <p>If you did not request a password reset, please contact us immediately to secure your account.</p>
  `;
  return await sendEmail(to, 'Reset Password - Research Connect OTP', wrapEmailTemplate('Reset Password Request', content));
};

const sendWelcomeEmail = async (to, firstName) => {
  const content = `
    <h2>Welcome to Research Connect, ${firstName}! 🎉</h2>
    <p>We are absolutely thrilled to welcome you to <strong>Research Connect</strong>—the premium AI-powered Research Discovery and Collaboration Platform.</p>
    <p>Our mission is to help you discover relevant literature, connect with collaborators around the globe, and showcase your academic portfolio seamlessly.</p>
    <p><strong>Quick Steps to Get Started:</strong></p>
    <ul>
      <li>Complete your profile affiliation and fields of interest.</li>
      <li>Search for your publications and add them to your portfolio.</li>
      <li>Connect with colleagues and invite co-authors.</li>
    </ul>
    <p>If you have any questions or feedback, feel free to contact our support team at any time.</p>
  `;
  return await sendEmail(to, 'Welcome to Research Connect!', wrapEmailTemplate('Welcome!', content));
};

const sendPasswordChangedEmail = async (to) => {
  const content = `
    <h2>Password Changed Successfully</h2>
    <p>Your password for <strong>Research Connect</strong> has been successfully updated.</p>
    <div class="alert-box" style="background-color: #FEF2F2; border-left: 4px solid #EF4444; color: #991B1B;">
      <strong>Security Alert:</strong> If you did not perform this change, please contact support immediately to secure your account.
    </div>
  `;
  return await sendEmail(to, 'Security Alert: Password Changed - Research Connect', wrapEmailTemplate('Password Updated', content));
};

const sendSecurityAlertEmail = async (to, eventDescription, metadata = {}) => {
  const { ip = 'Unknown', device = 'Unknown', browser = 'Unknown' } = metadata;
  const content = `
    <h2>Security Alert</h2>
    <p>We detected an important security event on your account: <strong>${eventDescription}</strong></p>
    <div class="alert-box">
      <strong>Incident details:</strong><br>
      IP Address: ${ip}<br>
      Device: ${device}<br>
      Browser: ${browser}<br>
      Time: ${new Date().toUTCString()}
    </div>
    <p>If this was not you, please secure your account immediately by resetting your password.</p>
  `;
  return await sendEmail(to, 'Security Alert - Research Connect', wrapEmailTemplate('Security Alert', content));
};

module.exports = {
  sendRegistrationOtp,
  sendLoginOtp,
  sendForgotPasswordOtp,
  sendWelcomeEmail,
  sendPasswordChangedEmail,
  sendSecurityAlertEmail
};
