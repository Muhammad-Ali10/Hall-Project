require('dotenv').config();
const { sendOTP } = require('../services/otpService');

// Test OTP sending
async function testOTP() {
  console.log('\n🧪 Testing OTP Service...\n');
  
  // Check environment variables
  console.log('📋 Environment Check:');
  console.log('  NODE_ENV:', process.env.NODE_ENV || 'not set');
  console.log('  TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? '✅ Set' : '❌ Not set');
  console.log('  TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? '✅ Set' : '❌ Not set');
  console.log('  TWILIO_PHONE_NUMBER:', process.env.TWILIO_PHONE_NUMBER || '❌ Not set');
  console.log('');
  
  // Test phone numbers
  const testPhones = [
    '9945118010',
    '+91 99451 18010',
    '+919945118010',
    '919945118010',
  ];
  
  for (const phone of testPhones) {
    console.log(`\n📱 Testing with phone: ${phone}`);
    try {
      const result = await sendOTP(phone);
      console.log(`✅ OTP generated: ${result.code}`);
      console.log(`⏰ Expires at: ${result.expiresAt.toLocaleString()}`);
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
    }
  }
  
  console.log('\n✅ Test completed!\n');
  process.exit(0);
}

testOTP();

