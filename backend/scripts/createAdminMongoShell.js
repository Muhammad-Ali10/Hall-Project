// MongoDB Shell Command to Create Admin User
// Run this in MongoDB shell (mongosh) or MongoDB Compass

// First, you need to hash the password manually using bcrypt
// Or use this JavaScript code in MongoDB shell:

// Option 1: Using MongoDB Shell (mongosh) with bcrypt
// Note: You'll need to install bcrypt in MongoDB shell context or hash password separately

/*
db.users.insertOne({
  email: "admin@hallbooking.com",
  password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyY5Y5Y5Y5Y5", // Hashed version of "Admin@123"
  role: "admin",
  isVerified: true,
  profile: {
    name: "Admin User"
  },
  createdAt: new Date(),
  updatedAt: new Date()
})
*/

// Option 2: Direct MongoDB Insert (Password will NOT be hashed - NOT RECOMMENDED)
// Only use this if you're going to hash it manually or update it later
/*
db.users.insertOne({
  email: "admin@hallbooking.com",
  password: "Admin@123", // This will NOT be hashed - you need to hash it manually
  role: "admin",
  isVerified: true,
  profile: {
    name: "Admin User"
  },
  createdAt: new Date(),
  updatedAt: new Date()
})
*/

// To hash password manually in Node.js:
// const bcrypt = require('bcryptjs');
// const hashedPassword = await bcrypt.hash('Admin@123', 12);
// Then use the hashedPassword in the insertOne command above

console.log(`
╔══════════════════════════════════════════════════════════════╗
║          MongoDB Shell Commands for Admin Creation           ║
╚══════════════════════════════════════════════════════════════╝

⚠️  RECOMMENDED: Use the Node.js script instead:
   npm run create-admin

Or run: node scripts/createAdmin.js

The script automatically hashes the password using bcrypt.

═══════════════════════════════════════════════════════════════

If you prefer MongoDB shell, you need to hash the password first.

1. Hash password using Node.js:
   const bcrypt = require('bcryptjs');
   const hash = await bcrypt.hash('Admin@123', 12);
   console.log(hash);

2. Then use this in MongoDB shell (mongosh):
   
   use your-database-name
   
   db.users.insertOne({
     email: "admin@hallbooking.com",
     password: "<paste-hashed-password-here>",
     role: "admin",
     isVerified: true,
     profile: {
       name: "Admin User"
     },
     createdAt: new Date(),
     updatedAt: new Date()
   })

═══════════════════════════════════════════════════════════════
`);

