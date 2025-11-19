const nodemailer = require('nodemailer');

// Create reusable transporter
// For production, use SendGrid, AWS SES, or similar
// For development, you can use Gmail with app password or Ethereal (fake SMTP)
const createTransporter = () => {
  // Check if we have email credentials
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    // Production: Use configured SMTP
    return nodemailer.createTransporter({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else {
    // Development: Use Ethereal (fake SMTP for testing)
    console.log('⚠️ No email credentials found. Using test mode (emails logged to console)');
    return null;
  }
};

const transporter = createTransporter();

/**
 * Send payment confirmation email
 */
const sendPaymentConfirmation = async ({ to, petName, packageName, amount, creditsRemaining }) => {
  const subject = 'Payment Successful - BarkBacks Video Credit Purchase';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .highlight { background: #fff; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; }
        .button { display: inline-block; background: #FF6B35; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Payment Successful!</h1>
        </div>
        <div class="content">
          <p>Hi there!</p>

          <p>Thank you for your purchase! Your payment has been processed successfully.</p>

          <div class="highlight">
            <h3>Purchase Details:</h3>
            <ul>
              <li><strong>Package:</strong> ${packageName}</li>
              <li><strong>Amount:</strong> $${(amount / 100).toFixed(2)}</li>
              <li><strong>Video Credits:</strong> ${creditsRemaining}</li>
            </ul>
          </div>

          <p>You're all set to create amazing personalized videos for <strong>${petName}</strong>!</p>

          <p>Your video credits are ready to use. Each credit allows you to generate one high-quality, personalized video with custom emotions and activities.</p>

          <a href="${process.env.CUSTOMER_PORTAL_URL || 'http://localhost:3001'}" class="button">Create Your Video Now</a>

          <div class="footer">
            <p>BarkBacks - Personalized Pet Videos</p>
            <p>Questions? Reply to this email or contact support.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    Payment Successful!

    Thank you for your purchase! Your payment has been processed successfully.

    Purchase Details:
    - Package: ${packageName}
    - Amount: $${(amount / 100).toFixed(2)}
    - Video Credits: ${creditsRemaining}

    You're all set to create amazing personalized videos for ${petName}!

    Visit ${process.env.CUSTOMER_PORTAL_URL || 'http://localhost:3001'} to create your video now.

    BarkBacks - Personalized Pet Videos
  `;

  return sendEmail({ to, subject, html, text });
};

/**
 * Send video ready notification
 */
const sendVideoReadyNotification = async ({ to, petName, videoUrl, jobId }) => {
  const subject = `Your ${petName} Video is Ready! 🎬`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .video-preview { background: white; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px; }
        .button { display: inline-block; background: #FF6B35; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎬 Your Video is Ready!</h1>
        </div>
        <div class="content">
          <p>Great news!</p>

          <p>Your personalized video for <strong>${petName}</strong> has been created and is ready to watch!</p>

          <div class="video-preview">
            <p style="font-size: 18px; margin-bottom: 20px;">🐕 ${petName}'s Personalized Video</p>
            <a href="${videoUrl}" class="button">Watch Video Now</a>
          </div>

          <p>Share this special moment with friends and family, or post it on social media to show off ${petName}'s adorable video!</p>

          <p><strong>Tip:</strong> You can download the video to keep it forever or share it on your favorite platforms.</p>

          <div class="footer">
            <p>BarkBacks - Personalized Pet Videos</p>
            <p>Want to create another video? You can make as many as your credits allow!</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    Your Video is Ready!

    Great news! Your personalized video for ${petName} has been created and is ready to watch!

    Watch your video here: ${videoUrl}

    Share this special moment with friends and family, or post it on social media to show off ${petName}'s adorable video!

    BarkBacks - Personalized Pet Videos
  `;

  return sendEmail({ to, subject, html, text });
};

/**
 * Core email sending function
 */
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    if (!transporter) {
      // Test mode - log email instead of sending
      console.log('📧 [EMAIL TEST MODE]');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Text: ${text.substring(0, 200)}...`);
      console.log('---');
      return { success: true, messageId: 'test-mode-' + Date.now() };
    }

    const info = await transporter.sendMail({
      from: `"BarkBacks" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log(`✅ Email sent: ${info.messageId} to ${to}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email send error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendPaymentConfirmation,
  sendVideoReadyNotification,
  sendEmail,
};
