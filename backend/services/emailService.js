const sgMail = require('@sendgrid/mail');

// Simple SendGrid initialization
let sendGridReady = false;

const initSendGrid = () => {
  if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    sendGridReady = true;
    console.log('✅ SendGrid ready');
  }
  return sendGridReady;
};

const sendOTPEmail = async (email, otp, purpose = 'password reset') => {
  try {
    // Simple email template
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #f97316;">Convention Hall Booking</h2>
        <p>Your OTP for ${purpose} is:</p>
        <h1 style="color: #f97316; font-size: 36px; letter-spacing: 8px;">${otp}</h1>
        <p>This OTP is valid for 10 minutes.</p>
      </div>
    `;

    // Try SendGrid if configured
    if (initSendGrid()) {
      try {
        await sgMail.send({
          to: email,
          from: process.env.SENDGRID_FROM_EMAIL || 'noreply@conventionhall.com',
          subject: `OTP - Convention Hall Booking`,
          html: emailHtml,
        });
        console.log(`✅ Email sent to ${email}`);
        return true;
      } catch (error) {
        console.error('❌ SendGrid error:', error.message);
      }
    }

    // Not configured - log to console (for development)
    console.log(`\n📧 OTP Email: ${email}`);
    console.log(`🔑 OTP: ${otp}`);
    console.log(`💡 Add SENDGRID_API_KEY to .env to send real emails\n`);
    return true;
  } catch (error) {
    console.error('❌ Email error:', error.message);
    return false;
  }
};

module.exports = {
  sendOTPEmail,
};
