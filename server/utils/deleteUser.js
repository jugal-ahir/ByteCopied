/**
 * Utility script to delete a user by email or enrollment number
 * Usage: node server/utils/deleteUser.js <email-or-enrollment>
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

async function deleteUser(identifier) {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);

    // Try to find user by email or enrollment
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { enrollmentNumber: identifier.toUpperCase() }
      ]
    });

    if (!user) {
      console.log(`❌ User not found: ${identifier}`);
      process.exit(1);
    }

    await User.findByIdAndDelete(user._id);
    console.log(`✅ User deleted: ${user.email} (${user.enrollmentNumber})`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

// Get identifier from command line arguments
const identifier = process.argv[2];

if (!identifier) {
  console.error('Usage: node server/utils/deleteUser.js <email-or-enrollment>');
  process.exit(1);
}

deleteUser(identifier);

