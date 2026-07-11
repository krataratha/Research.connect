import nodemailer from 'nodemailer';
import AppError from '../utils/AppError.js';

// Base styling variables for consistent branding matching ResearchConnect palette
const BRAND_COLOR = '#2563EB'; // Primary Blue
const ACCENT_COLOR = '#1D4ED8'; // Blue Hover
const BG_COLOR = '#F8FAFC'; // Background
const CARD_BG = '#FFFFFF';
const TEXT_DARK = '#0F172A'; // Primary Text
const TEXT_MUTED = '#475569'; // Secondary Text
const BORDER_COLOR = '#E2E8F0';

/**
 * Common HTML email wrapper to maintain visual consistency.
 */
const getEmailWrapper = (title, contentHtml) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
      body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background-color: ${BG_COLOR};
        margin: 0;
        padding: 40px 20px;
      }
      table {
        border-collapse: collapse;
        width: 100%;
      }
      .container {
        max-width: 580px;
        background-color: ${CARD_BG};
        margin: 0 auto;
        border-radius: 16px;
        border: 1px solid ${BORDER_COLOR};
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
        overflow: hidden;
      }
      .header {
        background-color: ${BRAND_COLOR};
        padding: 30px 40px;
        text-align: center;
      }
      .logo {
        font-size: 24px;
        font-weight: 800;
        color: #FFFFFF;
        letter-spacing: -0.5px;
        text-decoration: none;
      }
      .body {
        padding: 40px;
        text-align: left;
      }
      .body-center {
        padding: 40px;
        text-align: center;
      }
      h2 {
        font-size: 20px;
        font-weight: 700;
        color: ${TEXT_DARK};
        margin-top: 0;
        margin-bottom: 16px;
      }
      p {
        font-size: 15px;
        color: ${TEXT_MUTED};
        line-height: 1.6;
        margin-top: 0;
        margin-bottom: 24px;
      }
      .otp-code {
        display: inline-block;
        font-size: 32px;
        font-weight: 800;
        letter-spacing: 6px;
        color: ${BRAND_COLOR};
        background-color: #EFF6FF;
        border: 1px dashed #3B82F6;
        padding: 12px 30px;
        border-radius: 12px;
        margin: 15px 0;
      }
      .btn {
        display: inline-block;
        background-color: ${BRAND_COLOR};
        color: #FFFFFF !important;
        font-weight: 600;
        font-size: 15px;
        padding: 12px 30px;
        text-decoration: none;
        border-radius: 8px;
        margin: 10px 0 20px 0;
        box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);
      }
      .footer {
        padding: 24px 40px;
        background-color: ${BG_COLOR};
        border-top: 1px solid #F1F5F9;
        text-align: center;
      }
      .footer-text {
        font-size: 11px;
        color: #94A3B8;
        margin: 0;
      }
    </style>
  </head>
  <body>
    <table align="center" border="0" cellpadding="0" cellspacing="0" class="container">
      <tr>
        <td class="header">
          <span class="logo">🔬 ResearchConnect</span>
        </td>
      </tr>
      <tr>
        <td>
          ${contentHtml}
        </td>
      </tr>
      <tr>
        <td class="footer">
          <p class="footer-text">&copy; ${new Date().getFullYear()} ResearchConnect. All rights reserved.</p>
          <p class="footer-text" style="margin-top: 4px;">Connecting Global Scientific Minds</p>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

/**
 * Core sendEmail function supporting Gmail SMTP, Resend, or safe Console Fallback
 */
const sendEmail = async ({ to, subject, html, fallbackConsoleMsg = '' }) => {
  // 1. Try Gmail SMTP Transport if variables are configured
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: `ResearchConnect <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
      });

      console.log(`✉️ Email (Gmail SMTP) successfully sent to: ${to}`);
      return { success: true };
    } catch (error) {
      console.error(`❌ Failed to send email via Gmail SMTP: ${error.message}`);
      if (process.env.NODE_ENV === 'development') {
        console.log(`➡️ [Fallback Developer Mode] Logging details: ${fallbackConsoleMsg}`);
        return { success: true, mock: true };
      }
      throw error;
    }
  }

  // 2. Fallback mock log in local development
  console.log(`✉️ [MOCK EMAIL] No email credentials provided. Logging email details:`);
  console.log(`   - To: ${to}`);
  console.log(`   - Subject: ${subject}`);
  if (fallbackConsoleMsg) {
    console.log(`   - Details: ${fallbackConsoleMsg}`);
  }
  return { success: true, mock: true };
};

/**
 * 1. Send Welcome Email (upon Profile completion)
 */
export const sendWelcomeEmail = async (email, name) => {
  const title = 'Welcome to ResearchConnect!';
  const contentHtml = `
    <div class="body">
      <h2>Hello ${name},</h2>
      <p>Welcome to <strong>ResearchConnect</strong>, the professional research collaboration network designed for global scientific minds.</p>
      <p>Your academic profile is now complete. You can now access your dashboard to:</p>
      <ul style="color: ${TEXT_MUTED}; font-size: 15px; line-height: 1.6; margin-bottom: 24px; padding-left: 20px;">
        <li>Share and discover research publications.</li>
        <li>Connect and collaborate with peer scholars and professors.</li>
        <li>Manage and showcase your research projects.</li>
      </ul>
      <div style="text-align: center;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" class="btn">Go to Dashboard</a>
      </div>
      <p>We are thrilled to support your research journey.</p>
    </div>
  `;

  const html = getEmailWrapper(title, contentHtml);
  return await sendEmail({
    to: email,
    subject: `Welcome to ResearchConnect, ${name}!`,
    html,
    fallbackConsoleMsg: `Welcome email sent.`,
  });
};

/**
 * 2. Send Registration OTP Email
 */
export const sendRegistrationOTPEmail = async (email, otp) => {
  console.log(`[DEBUG] Registration OTP Code for ${email}: ${otp}`);
  const title = 'Verify your ResearchConnect Account';
  const contentHtml = `
    <div class="body-center">
      <h2>Confirm Your Registration</h2>
      <p>Thank you for registering on ResearchConnect. Use the 6-digit verification code below to verify your email address and activate your academic account:</p>
      <div class="otp-code">${otp}</div>
      <p><strong>This code is valid for 5 minutes</strong> and can only be used once.</p>
      <div style="margin-top: 25px; padding: 15px; background-color: #F8FAFC; border-radius: 8px; text-align: left; border-left: 4px solid #3B82F6;">
        <span style="font-size: 12px; font-weight: 700; color: ${TEXT_DARK}; display: block; margin-bottom: 4px;">🛡️ Security Notice:</span>
        <span style="font-size: 12px; color: ${TEXT_MUTED};">Never share this verification code with anyone. ResearchConnect support will never ask for your OTP. If you did not register for an account, please ignore this email.</span>
      </div>
    </div>
  `;

  const html = getEmailWrapper(title, contentHtml);
  return await sendEmail({
    to: email,
    subject: 'Verify your ResearchConnect Account',
    html,
    fallbackConsoleMsg: `Registration OTP Code: ${otp}`,
  });
};

/**
 * Send Login OTP Email
 */
export const sendLoginOTPEmail = async (email, otp) => {
  console.log(`[DEBUG] Login OTP Code for ${email}: ${otp}`);
  const title = 'ResearchConnect Login Verification Code';
  const contentHtml = `
    <div class="body-center">
      <h2>Two-Factor Authentication</h2>
      <p>A login attempt was made for your ResearchConnect account. Use the 6-digit verification code below to complete your sign-in:</p>
      <div class="otp-code">${otp}</div>
      <p><strong>This code is valid for 5 minutes</strong> and can only be used once.</p>
      <div style="margin-top: 25px; padding: 15px; background-color: #FFFBEB; border-radius: 8px; text-align: left; border-left: 4px solid #F59E0B;">
        <span style="font-size: 12px; font-weight: 700; color: #78350F; display: block; margin-bottom: 4px;">🛡️ Security Notice:</span>
        <span style="font-size: 12px; color: #92400E;">If you did not attempt to log in to your ResearchConnect account just now, please change your password immediately as your credentials may be compromised.</span>
      </div>
    </div>
  `;

  const html = getEmailWrapper(title, contentHtml);
  return await sendEmail({
    to: email,
    subject: 'ResearchConnect Login Verification Code',
    html,
    fallbackConsoleMsg: `Login OTP Code: ${otp}`,
  });
};

/**
 * Send Forgot Password OTP Email
 */
export const sendForgotPasswordOTPEmail = async (email, otp) => {
  console.log(`[DEBUG] Forgot Password OTP Code for ${email}: ${otp}`);
  const title = 'Reset Your Password';
  const contentHtml = `
    <div class="body-center">
      <h2>Password Reset Request</h2>
      <p>We received a request to reset the password for your ResearchConnect account. Use the 6-digit verification code below to authorize this reset:</p>
      <div class="otp-code">${otp}</div>
      <p><strong>This code is valid for 5 minutes</strong> and can only be used once.</p>
      <div style="margin-top: 25px; padding: 15px; background-color: #FEF2F2; border-radius: 8px; text-align: left; border-left: 4px solid #EF4444;">
        <span style="font-size: 12px; font-weight: 700; color: #991B1B; display: block; margin-bottom: 4px;">⚠️ Security Notice:</span>
        <span style="font-size: 12px; color: #991B1B;">If you did not request a password reset, please ignore this email. Your password will remain unchanged. Please ensure your account email is secure.</span>
      </div>
    </div>
  `;

  const html = getEmailWrapper(title, contentHtml);
  return await sendEmail({
    to: email,
    subject: 'Reset Your Password',
    html,
    fallbackConsoleMsg: `Password Reset OTP Code: ${otp}`,
  });
};

/**
 * 3. Send Resend OTP Email
 */
export const sendResendOTPEmail = async (email, otp) => {
  console.log(`[DEBUG] Resend OTP Code for ${email}: ${otp}`);
  const title = 'Your New Verification Code';
  const contentHtml = `
    <div class="body-center">
      <h2>New Verification Code</h2>
      <p>Here is the new 6-digit verification code you requested to activate your ResearchConnect account:</p>
      <div class="otp-code">${otp}</div>
      <p><strong>This code is valid for 5 minutes</strong>. Please enter it on the verification page to continue.</p>
    </div>
  `;

  const html = getEmailWrapper(title, contentHtml);
  return await sendEmail({
    to: email,
    subject: '[ResearchConnect] New OTP Verification Code',
    html,
    fallbackConsoleMsg: `Resent OTP Code: ${otp}`,
  });
};

/**
 * 4. Send Forgot Password Email (Token-based link fallback)
 */
export const sendForgotPasswordEmail = async (email, token) => {
  const title = 'Reset Your Password';
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;

  const contentHtml = `
    <div class="body-center">
      <h2>Password Reset Request</h2>
      <p>We received a request to reset your password for your ResearchConnect account. Click the button below to choose a new password:</p>
      <a href="${resetUrl}" class="btn">Reset Password</a>
      <p style="margin-top: 20px; font-size: 13px;">If you did not make this request, you can safely ignore this email. Your password will remain unchanged.</p>
      <p style="font-size: 13px; word-break: break-all; background-color: #F1F5F9; padding: 10px; border-radius: 6px;"><a href="${resetUrl}">${resetUrl}</a></p>
      <p>This link is valid for 1 hour.</p>
    </div>
  `;

  const html = getEmailWrapper(title, contentHtml);
  return await sendEmail({
    to: email,
    subject: '[ResearchConnect] Reset Your Password',
    html,
    fallbackConsoleMsg: `Password Reset Link: ${resetUrl}`,
  });
};

/**
 * 5. Send Account Activated (Email Verified) Email
 */
export const sendAccountActivatedEmail = async (email, name) => {
  const title = 'Account Activated Successfully';
  const contentHtml = `
    <div class="body">
      <h2>Congratulations ${name}!</h2>
      <p>Your email address has been successfully verified, and your ResearchConnect account is now activated.</p>
      <p>Please complete your Researcher Profile Wizard to build your academic presence and start connecting with colleagues.</p>
      <div style="text-align: center; margin-top: 20px;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/complete-profile" class="btn">Complete Profile Setup</a>
      </div>
    </div>
  `;

  const html = getEmailWrapper(title, contentHtml);
  return await sendEmail({
    to: email,
    subject: '[ResearchConnect] Account Verified & Activated',
    html,
    fallbackConsoleMsg: `Account activation confirmation sent.`,
  });
};

/**
 * Send Security Alert
 */
export const sendSecurityAlertEmail = async (email, alertDetails) => {
  const title = 'Security Alert!';
  const { reason, description, time } = alertDetails;

  const contentHtml = `
    <div class="body" style="border-left: 4px solid #DC2626; padding-left: 16px;">
      <h2 style="color: #DC2626;">Security Action Required</h2>
      <p><strong>Reason:</strong> ${reason}</p>
      <p>${description}</p>
      <p><strong>Logged Time:</strong> ${time || new Date().toLocaleString()}</p>
      <p>If you did not authorize or trigger this event, please secure your account immediately.</p>
    </div>
  `;

  const html = getEmailWrapper(title, contentHtml);
  return await sendEmail({
    to: email,
    subject: `[ResearchConnect] CRITICAL SECURITY ALERT: ${reason}`,
    html,
    fallbackConsoleMsg: `Security Alert: ${reason} - ${description}`,
  });
};

/**
 * Compatibility stub for verification link (returns stub message)
 */
export const sendVerificationEmail = async (email, token) => {
  return await sendRegistrationOTPEmail(email, '000000');
};
export const sendPasswordChangedEmail = async (email) => {
  // Standard notify change
  const title = 'Password Changed Successfully';
  const contentHtml = `
    <div class="body">
      <h2>Your password has been changed</h2>
      <p>This is a confirmation that the password for your ResearchConnect account has been successfully updated.</p>
    </div>
  `;
  const html = getEmailWrapper(title, contentHtml);
  return await sendEmail({
    to: email,
    subject: '[ResearchConnect] Security Notification: Password Changed',
    html,
    fallbackConsoleMsg: `Password changed.`,
  });
};

/**
 * 9. Send Collaboration Status Changed Email
 */
export const sendCollaborationStatusChangedEmail = async (email, name, newStatus) => {
  const title = 'Collaboration Status Updated';
  const contentHtml = `
    <div class="body">
      <h2>Hello ${name},</h2>
      <p>Your collaboration status has been updated to: <strong>${newStatus}</strong>.</p>
      <p>Other researchers will see this status on your profile when searching for collaborators.</p>
      <div style="text-align: center; margin-top: 20px;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile" class="btn">View Your Profile</a>
      </div>
    </div>
  `;

  const html = getEmailWrapper(title, contentHtml);
  return await sendEmail({
    to: email,
    subject: `[ResearchConnect] Collaboration Status Updated`,
    html,
    fallbackConsoleMsg: `Collaboration status changed email sent to ${email} for status: ${newStatus}`,
  });
};

/**
 * 10. Send Collaboration Request Email
 */
export const sendCollaborationRequestEmail = async (email, senderName, projectTitle) => {
  const title = 'New Collaboration Request';
  const contentHtml = `
    <div class="body">
      <h2>Hello,</h2>
      <p>You have received a new collaboration request from <strong>${senderName}</strong> for the project: <strong>"${projectTitle}"</strong>.</p>
      <p>Log in to your dashboard to review the request details and respond.</p>
      <div style="text-align: center; margin-top: 20px;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/collaborations" class="btn">View Collaboration Request</a>
      </div>
    </div>
  `;

  const html = getEmailWrapper(title, contentHtml);
  return await sendEmail({
    to: email,
    subject: `[ResearchConnect] New Collaboration Request from ${senderName}`,
    html,
    fallbackConsoleMsg: `Collaboration request email sent to ${email} from ${senderName} for project ${projectTitle}`,
  });
};

/**
 * 11. Send Collaboration Request Accepted Email
 */
export const sendCollaborationRequestAcceptedEmail = async (email, receiverName, projectTitle) => {
  const title = 'Collaboration Request Accepted';
  const contentHtml = `
    <div class="body">
      <h2>Hello,</h2>
      <p>Great news! <strong>${receiverName}</strong> has accepted your collaboration request for the project: <strong>"${projectTitle}"</strong>.</p>
      <p>An active collaboration workspace has been created for both of you. You can now chat, share files, and manage meetings.</p>
      <div style="text-align: center; margin-top: 20px;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/collaborations" class="btn">Go to Collaboration Workspace</a>
      </div>
    </div>
  `;

  const html = getEmailWrapper(title, contentHtml);
  return await sendEmail({
    to: email,
    subject: `[ResearchConnect] Collaboration Request Accepted by ${receiverName}!`,
    html,
    fallbackConsoleMsg: `Collaboration request accepted email sent to ${email} by ${receiverName} for project ${projectTitle}`,
  });
};

/**
 * 12. Send New Connection Email
 */
export const sendNewConnectionEmail = async (email, requesterName) => {
  const title = 'New Connection Request';
  const contentHtml = `
    <div class="body">
      <h2>Hello,</h2>
      <p><strong>${requesterName}</strong> wants to connect with you on ResearchConnect.</p>
      <p>Connecting with other researchers allows you to see their updates, share research, and discover collaboration opportunities.</p>
      <div style="text-align: center; margin-top: 20px;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/network" class="btn">View Connection Request</a>
      </div>
    </div>
  `;

  const html = getEmailWrapper(title, contentHtml);
  return await sendEmail({
    to: email,
    subject: `[ResearchConnect] New Connection Request from ${requesterName}`,
    html,
    fallbackConsoleMsg: `New connection email sent to ${email} from requester: ${requesterName}`,
  });
};

/**
 * 13. Send New Follower Email
 */
export const sendNewFollowerEmail = async (email, followerName) => {
  const title = 'New Follower';
  const contentHtml = `
    <div class="body">
      <h2>Hello,</h2>
      <p>Great news! <strong>${followerName}</strong> is now following you on ResearchConnect.</p>
      <p>They will receive updates when you post new publications or update your profile.</p>
      <div style="text-align: center; margin-top: 20px;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile" class="btn">View Your Profile</a>
      </div>
    </div>
  `;

  const html = getEmailWrapper(title, contentHtml);
  return await sendEmail({
    to: email,
    subject: `[ResearchConnect] ${followerName} is now following you`,
    html,
    fallbackConsoleMsg: `New follower email sent to ${email} for follower: ${followerName}`,
  });
};

/**
 * 14. Send New Publication notification to Followers
 */
export const sendNewPublicationFollowersEmail = async (emails, authorName, publicationTitle, publicationType) => {
  const title = 'New Publication Update';
  const contentHtml = `
    <div class="body">
      <h2>Hello,</h2>
      <p>A researcher you follow, <strong>${authorName}</strong>, has just published a new <strong>${publicationType || 'research work'}</strong>:</p>
      <p style="font-size: 16px; font-weight: 700; color: ${TEXT_DARK}; background-color: #F8FAFC; padding: 15px; border-radius: 8px; border-left: 4px solid ${BRAND_COLOR};">
        "${publicationTitle}"
      </p>
      <div style="text-align: center; margin-top: 25px;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/feed" class="btn">Read Publication</a>
      </div>
    </div>
  `;

  const html = getEmailWrapper(title, contentHtml);

  // emails could be an array of strings or a single email string
  const toList = Array.isArray(emails) ? emails : [emails];
  if (toList.length === 0) return { success: true };

  // Dispatches emails to all recipients (in parallel/batch)
  const results = await Promise.all(
    toList.map(email =>
      sendEmail({
        to: email,
        subject: `[ResearchConnect] New publication by ${authorName}: ${publicationTitle}`,
        html,
        fallbackConsoleMsg: `New publication email sent to ${email} for author ${authorName} on "${publicationTitle}"`,
      })
    )
  );

  return results[0];
};



