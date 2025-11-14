# How to Start the Server

## Quick Start

1. **Make sure MongoDB is running** (local or Atlas connection string is set)

2. **Create server/.env file** with:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/bytecopied
   JWT_SECRET=your-secret-key-here
   JWT_EXPIRES_IN=7d
   ```

3. **Install dependencies** (if not done):
   ```bash
   cd server
   npm install
   ```

4. **Start the server**:
   ```bash
   # From server directory
   npm run dev
   
   # OR from root directory
   npm run server
   ```

5. **You should see**:
   ```
   MongoDB Connected: localhost:27017
   Server running on port 5000
   ```

## Troubleshooting

### Connection Refused Error
- Make sure the server is running on port 5000
- Check if MongoDB is running and accessible
- Verify MONGODB_URI in server/.env is correct

### MongoDB Connection Error
- For local: Make sure MongoDB service is started
- For Atlas: Check connection string, username, password, and IP whitelist

### Port Already in Use
- Change PORT in server/.env to another port (e.g., 5001)
- Update REACT_APP_API_URL in client/.env accordingly

