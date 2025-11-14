# Migration from Firebase to MongoDB - Complete Guide

## Overview
The application has been fully migrated from Firebase (Firestore + Firebase Auth) to MongoDB with JWT authentication.

## Changes Made

### Backend Changes
1. **Removed Firebase dependencies**
   - Removed `firebase-admin` package
   - Added `mongoose`, `bcryptjs`, `jsonwebtoken` packages

2. **New MongoDB Models**
   - `User` - Stores user information (name, email, enrollment number, password, role)
   - `Snippet` - Code snippets with creator information
   - `AttendanceSession` - Attendance sessions
   - `AttendanceSubmission` - Individual attendance submissions

3. **New Authentication System**
   - JWT-based authentication
   - Password hashing with bcrypt
   - Custom auth routes (`/api/auth/signup`, `/api/auth/login`, `/api/auth/me`)

4. **Updated Routes**
   - All routes now use MongoDB instead of Firestore
   - Authentication middleware updated to verify JWT tokens

### Frontend Changes
1. **Removed Firebase SDK**
   - Removed `firebase` package
   - Removed Firebase configuration

2. **Updated Authentication**
   - New `AuthContext` using JWT tokens
   - Token stored in localStorage
   - API calls use JWT Bearer tokens

3. **Updated Login/Signup**
   - Signup now requires: Name, Email, Enrollment Number, Password
   - Enrollment number format: AU2340017 (AU + 7 digits)
   - Removed Google login

4. **Updated UI**
   - Dashboard shows user's name
   - Navbar displays user's name
   - User initials generated from name

## Environment Variables

### Backend (.env in server directory)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/bytecopied
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
```

### Frontend (.env in client directory)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### For Production (Vercel + Render)

#### Render (Backend)
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bytecopied?retryWrites=true&w=majority
JWT_SECRET=your-production-secret-key
JWT_EXPIRES_IN=7d
```

#### Vercel (Frontend)
```env
REACT_APP_API_URL=https://your-backend-app.onrender.com/api
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm run install-all
```

### 2. Set Up MongoDB
- **Local**: Install MongoDB locally or use Docker
- **Cloud**: Create a MongoDB Atlas account and get connection string

### 3. Configure Environment Variables
- Copy `.env.example` to `server/.env` and fill in values
- Copy `.env.example` to `client/.env` and set `REACT_APP_API_URL`

### 4. Run the Application
```bash
npm run dev
```

### 5. Set Admin Role
```bash
npm run set-admin <user-email>
```

## Deployment

### Backend (Render)
1. Connect your GitHub repository
2. Set build command: `cd server && npm install`
3. Set start command: `cd server && npm start`
4. Add environment variables in Render dashboard

### Frontend (Vercel)
1. Connect your GitHub repository
2. Set root directory to `client`
3. Set build command: `npm run build`
4. Add environment variables in Vercel dashboard

## User Signup Fields
- **Name**: Full name (required)
- **Email**: Valid email address (required, unique)
- **Enrollment Number**: Format AU2340017 (required, unique)
- **Password**: Minimum 6 characters (required)

## Notes
- All passwords are hashed using bcrypt
- JWT tokens expire after 7 days (configurable)
- User roles: 'student' (default) or 'admin'
- Enrollment numbers are automatically converted to uppercase

