const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hall-booking', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Admin details - CHANGE THESE VALUES
    const adminData = {
      email: 'admin@hallbooking.com',
      password: 'Admin@123', // Will be hashed automatically
      role: 'admin',
      isVerified: true,
      profile: {
        name: 'Admin User',
      },
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email, role: 'admin' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists with email:', adminData.email);
      console.log('   If you want to update the password, delete the existing admin first.');
      await mongoose.disconnect();
      return;
    }

    // Create admin user
    const admin = new User(adminData);
    await admin.save();

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', adminData.email);
    console.log('🔑 Password:', adminData.password);
    console.log('👤 Name:', adminData.profile.name);
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');

  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    if (error.code === 11000) {
      console.error('   Email already exists. Please use a different email.');
    }
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
};

// Run the script
createAdmin();

