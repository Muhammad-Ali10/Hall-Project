const twilio = require('twilio');
const { parsePhoneNumber, isValidPhoneNumber } = require('libphonenumber-js');

// Lazy initialization of Twilio client (only when needed and credentials are valid)
let twilioClient = null;

const getTwilioClient = () => {
  if (!twilioClient && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    // Validate that account SID starts with 'AC'
    if (process.env.TWILIO_ACCOUNT_SID.startsWith('AC')) {
      try {
        twilioClient = twilio(
          process.env.TWILIO_ACCOUNT_SID,
          process.env.TWILIO_AUTH_TOKEN
        );
        console.log('✅ Twilio client initialized successfully');
      } catch (error) {
        console.warn('⚠️  Twilio client initialization failed:', error.message);
        twilioClient = null;
      }
    } else {
      console.warn('⚠️  Invalid Twilio Account SID format. Must start with "AC"');
      console.warn(`⚠️  Current SID: ${process.env.TWILIO_ACCOUNT_SID}`);
    }
  } else if (!twilioClient) {
    // Log what's missing
    if (!process.env.TWILIO_ACCOUNT_SID) {
      console.warn('⚠️  TWILIO_ACCOUNT_SID not found in environment variables');
    }
    if (!process.env.TWILIO_AUTH_TOKEN) {
      console.warn('⚠️  TWILIO_AUTH_TOKEN not found in environment variables');
    }
  }
  return twilioClient;
};

// For development, use a simple OTP generator
const generateOTP = () => {
  if (process.env.NODE_ENV === 'development') {
    return '123456'; // Fixed OTP for development
  }
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Normalize phone number for Twilio using libphonenumber-js
const normalizePhoneForTwilio = (phone) => {
  console.log(`🔧 Normalizing phone: ${phone}`);
  
  try {
    // Validate and parse phone number
    if (!isValidPhoneNumber(phone)) {
      console.warn(`⚠️  Invalid phone number format: ${phone}`);
      // Fallback: try to add + if missing
      const withPlus = phone.startsWith('+') ? phone : '+' + phone;
      if (isValidPhoneNumber(withPlus)) {
        const phoneNumber = parsePhoneNumber(withPlus);
        const formatted = phoneNumber.format('E.164');
        console.log(`   Formatted to E.164: ${formatted}`);
        return formatted;
      }
      throw new Error('Invalid phone number format');
    }
    
    // Parse and format to E.164 (Twilio format)
    const phoneNumber = parsePhoneNumber(phone);
    const formatted = phoneNumber.format('E.164'); // Returns: +919945118010
    console.log(`   ✅ Formatted to E.164: ${formatted}`);
    console.log(`   Country: ${phoneNumber.country || 'Unknown'}`);
    return formatted;
  } catch (error) {
    console.error(`❌ Error normalizing phone: ${error.message}`);
    // Fallback: return as-is if it starts with +
    if (phone.startsWith('+')) {
      return phone;
    }
    throw error;
  }
};

const sendOTP = async (phone) => {
  try {
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    console.log(`\n📱 Sending OTP to phone: ${phone}`);
    console.log(`🔑 Generated OTP: ${otp}`);

    // Try to send via Twilio if credentials are available (works in both dev and production)
    const client = getTwilioClient();
    // Remove spaces from Twilio phone number if present
    const twilioFromNumber = process.env.TWILIO_PHONE_NUMBER ? process.env.TWILIO_PHONE_NUMBER.replace(/\s/g, '') : null;
    const hasTwilioConfig = client && twilioFromNumber;

    if (hasTwilioConfig) {
      try {
        // Normalize phone for Twilio (add country code if needed)
        const twilioPhone = normalizePhoneForTwilio(phone);
        console.log(`📞 Normalized phone for Twilio: ${twilioPhone}`);
        console.log(`📤 Sending from Twilio number: ${process.env.TWILIO_PHONE_NUMBER}`);
        
        const message = await client.messages.create({
          body: `Your OTP for Convention Hall Booking is ${otp}. Valid for 10 minutes.`,
          from: twilioFromNumber,
          to: twilioPhone,
        });
        
        console.log(`✅ OTP sent successfully via Twilio!`);
        console.log(`📨 Message SID: ${message.sid}`);
        console.log(`📱 Sent to: ${twilioPhone}`);
      } catch (error) {
        console.error('❌ Twilio SMS error:', error.message);
        console.error('❌ Error code:', error.code);
        console.error('❌ Full error:', error);
        // Still log OTP to console as fallback
        console.log(`\n⚠️  Twilio failed, but OTP is: ${otp}`);
        console.log(`📱 Phone number: ${phone}`);
        console.log(`⏰ OTP expires at: ${expiresAt.toLocaleString()}\n`);
      }
    } else {
      // Twilio not configured - log to console
      console.log(`\n⚠️  Twilio not configured - OTP logged to console only`);
      console.log(`📱 Phone number: ${phone}`);
      console.log(`🔑 OTP: ${otp}`);
      console.log(`⏰ OTP expires at: ${expiresAt.toLocaleString()}\n`);
      
      if (!process.env.TWILIO_ACCOUNT_SID) {
        console.warn('⚠️  TWILIO_ACCOUNT_SID not set in .env');
      }
      if (!process.env.TWILIO_AUTH_TOKEN) {
        console.warn('⚠️  TWILIO_AUTH_TOKEN not set in .env');
      }
      if (!process.env.TWILIO_PHONE_NUMBER) {
        console.warn('⚠️  TWILIO_PHONE_NUMBER not set in .env');
      }
    }

    return {
      code: otp,
      expiresAt,
    };
  } catch (error) {
    console.error('❌ OTP sending error:', error);
    console.error('❌ Error stack:', error.stack);
    throw new Error('Failed to send OTP: ' + error.message);
  }
};

const verifyOTP = (storedOTP, userOTP) => {
  if (!storedOTP || !storedOTP.code) {
    return false;
  }

  if (new Date() > new Date(storedOTP.expiresAt)) {
    return false;
  }

  return storedOTP.code === userOTP;
};

module.exports = {
  generateOTP,
  sendOTP,
  verifyOTP,
};
