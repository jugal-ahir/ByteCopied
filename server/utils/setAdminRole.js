/**
 * Utility script to set a user's role to admin
 * Usage: node server/utils/setAdminRole.js <user-email>
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

async function setAdminRole(email) {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.error(`❌ User with email ${email} not found`);
      process.exit(1);
    }

    // Set role to admin
    user.role = 'admin';
    await user.save();

    console.log(`✅ Successfully set ${email} as admin`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Enrollment: ${user.enrollmentNumber}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting admin role:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error('Usage: node server/utils/setAdminRole.js <user-email>');
  process.exit(1);
}

setAdminRole(email);
