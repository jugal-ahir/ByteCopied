# Environment Variables Setup Guide

## Backend Environment Variables (server/.env)

Create a `.env` file in the `server` directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
# For local MongoDB:
MONGODB_URI=mongodb://localhost:27017/bytecopied

# For MongoDB Atlas (cloud):
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bytecopied?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-characters
JWT_EXPIRES_IN=7d
```

### MongoDB Setup Options:

#### Option 1: Local MongoDB
1. Install MongoDB locally or use Docker
2. Start MongoDB service
3. Use: `MONGODB_URI=mongodb://localhost:27017/bytecopied`

#### Option 2: MongoDB Atlas (Recommended for Production)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster (free tier available)
4. Create a database user
5. Whitelist your IP address (or use 0.0.0.0/0 for all IPs - less secure)
6. Get connection string and replace username, password, and cluster URL
7. Use: `MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bytecopied?retryWrites=true&w=majority`

## Frontend Environment Variables (client/.env)

Create a `.env` file in the `client` directory with the following variables:

```env
# API URL
# For local development:
REACT_APP_API_URL=http://localhost:5000/api

# For production (after deploying backend to Render):
# REACT_APP_API_URL=https://your-backend-app.onrender.com/api
```

## Production Deployment

### Render (Backend)
Add these environment variables in Render dashboard:
- `PORT` - Usually set automatically by Render
- `NODE_ENV=production`
- `MONGODB_URI` - Your MongoDB Atlas connection string
- `JWT_SECRET` - A strong random secret (generate using: `openssl rand -base64 32`)
- `JWT_EXPIRES_IN=7d`

### Vercel (Frontend)
Add these environment variables in Vercel dashboard:
- `REACT_APP_API_URL` - Your Render backend URL (e.g., `https://your-app.onrender.com/api`)

## Security Notes

1. **Never commit `.env` files to Git** - They are already in `.gitignore`
2. **Use strong JWT_SECRET** - At least 32 characters, random string
3. **Use MongoDB Atlas IP whitelist** - Restrict access to known IPs in production
4. **Use environment variables in production** - Don't hardcode secrets

## Quick Start

1. Copy the example:
   ```bash
   # Backend
   cp .env.example server/.env
   # Edit server/.env with your values
   
   # Frontend
   echo "REACT_APP_API_URL=http://localhost:5000/api" > client/.env
   ```

2. Install dependencies:
   ```bash
   npm run install-all
   ```

3. Start the application:
   ```bash
   npm run dev
   ```

