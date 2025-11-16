const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const authenticateToken = require('./middleware/auth');

// Load environment variables
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

// Connect to MongoDB (non-blocking)
connectDB().catch((error) => {
  console.error('Failed to connect to MongoDB:', error.message);
  console.error('\n📝 Please check your server/.env file:');
  console.error('   - MONGODB_URI should be set correctly');
  console.error('   - For local: mongodb://localhost:27017/bytecopied');
  console.error('   - For Atlas: mongodb+srv://username:password@cluster.mongodb.net/bytecopied\n');
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/snippets', require('./routes/snippets'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/timetable', require('./routes/timetable'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'ByteCopied API is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;

