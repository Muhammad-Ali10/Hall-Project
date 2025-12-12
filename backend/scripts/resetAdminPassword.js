const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const resetAdminPassword = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hall-booking', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB\n');

    // Admin email and new password
    const adminEmail = 'admin@hallbooking.com';
    const newPassword = 'Admin@123';

    // Find admin user
    const admin = await User.findOne({ email: adminEmail, role: 'admin' }).select('+password');
    
    if (!admin) {
      console.log('❌ Admin user not found with email:', adminEmail);
      console.log('   Run: npm run create-admin to create an admin user\n');
      await mongoose.disconnect();
      return;
    }

    console.log('📧 Found admin user:', adminEmail);
    console.log('🔑 Resetting password...\n');

    // Update password - the pre-save hook will hash it automatically
    admin.password = newPassword;
    await admin.save();

    console.log('✅ Admin password reset successfully!');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 New Password:', newPassword);
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');

  } catch (error) {
    console.error('❌ Error resetting admin password:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
};

// Run the script
resetAdminPassword();

