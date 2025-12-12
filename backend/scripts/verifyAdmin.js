const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const verifyAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hall-booking', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB\n');

    // Find all admin users
    const admins = await User.find({ role: 'admin' }).select('+password');
    
    if (admins.length === 0) {
      console.log('❌ No admin users found in database.');
      console.log('   Run: npm run create-admin\n');
      await mongoose.disconnect();
      return;
    }

    console.log(`📊 Found ${admins.length} admin user(s):\n`);
    
    admins.forEach((admin, index) => {
      console.log(`Admin ${index + 1}:`);
      console.log(`  📧 Email: ${admin.email}`);
      console.log(`  🔑 Has Password: ${admin.password ? 'Yes' : 'No'}`);
      console.log(`  ✅ Verified: ${admin.isVerified ? 'Yes' : 'No'}`);
      console.log(`  👤 Name: ${admin.profile?.name || 'Not set'}`);
      console.log(`  📅 Created: ${admin.createdAt}`);
      console.log('');
    });

    // Check environment variables
    console.log('🔧 Environment Check:');
    console.log(`  JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Set' : '❌ Missing'}`);
    console.log(`  MONGODB_URI: ${process.env.MONGODB_URI ? '✅ Set' : '❌ Missing'}`);
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
};

verifyAdmin();

