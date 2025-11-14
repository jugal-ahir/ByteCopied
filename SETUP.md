# ByteCopied Setup Guide

## Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Firebase account
- Firebase project created

## Step 1: Install Dependencies

```bash
npm run install-all
```

This will install dependencies for:
- Root package (concurrently)
- Server (Express, Firebase Admin, etc.)
- Client (React, Material-UI, etc.)

## Step 2: Firebase Setup

### 2.1 Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable Email/Password
   - Enable Google Sign-in

### 2.2 Create Firestore Database
1. Go to Firestore Database
2. Create database in production mode
3. Set up security rules (see below)

### 2.3 Get Firebase Configuration
1. Go to Project Settings > General
2. Scroll down to "Your apps"
3. Click on Web app icon (</>)
4. Copy the Firebase configuration values

### 2.4 Get Service Account Key
1. Go to Project Settings > Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Extract the following values:
   - `project_id`
   - `private_key`
   - `client_email`

## Step 3: Environment Variables

### 3.1 Server Environment Variables
Create `server/.env`:

```env
PORT=5000
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
```

**Important**: The `FIREBASE_PRIVATE_KEY` should include the full key with `\n` characters preserved.

### 3.2 Client Environment Variables
Create `client/.env`:

```env
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
REACT_APP_API_URL=http://localhost:5000/api
```

## Step 4: Prepare Excel Files

1. Create Excel files for each section (A, B, C, D)
2. Place them in `assets/roll-sheets/`:
   - `sectionA.xlsx`
   - `sectionB.xlsx`
   - `sectionC.xlsx`
   - `sectionD.xlsx`
3. Each file should have roll numbers in the first column (see `EXCEL_FORMAT.md`)

## Step 5: Set Up Admin User

1. Start the application:
   ```bash
   npm run dev
   ```

2. Sign up with an email/password or Google
3. In Firebase Console, go to Firestore Database
4. Find the `users` collection
5. Find your user document (by UID)
6. Add a field: `role: "admin"`

Alternatively, you can set the role programmatically through Firebase Console or Admin SDK.

## Step 6: Firestore Security Rules

Set up these security rules in Firebase Console > Firestore > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Snippets collection
    match /snippets/{snippetId} {
      allow read: if request.auth != null && (
        resource.data.createdBy == request.auth.uid ||
        resource.data.isViewOnly == true
      );
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && (
        resource.data.createdBy == request.auth.uid
      );
    }
    
    // Attendance collections
    match /attendanceSessions/{sessionId} {
      allow read: if request.auth != null;
      allow write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    match /attendanceSubmissions/{submissionId} {
      allow read: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      allow create: if request.auth != null;
    }
  }
}
```

## Step 7: Run the Application

```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend React app on `http://localhost:3000`

## Troubleshooting

### Port Already in Use
- Change `PORT` in `server/.env` for backend
- Change port in `client/package.json` scripts or set `PORT` environment variable

### Firebase Authentication Errors
- Verify all environment variables are set correctly
- Check Firebase project settings
- Ensure Authentication methods are enabled

### Excel File Not Found
- Verify files are in `assets/roll-sheets/`
- Check file names match: `sectionA.xlsx`, `sectionB.xlsx`, etc.
- Ensure files are `.xlsx` format (not `.xls`)

### Permission Denied Errors
- Check Firestore security rules
- Verify user role is set correctly in Firestore
- Check Firebase Admin SDK credentials

## Production Deployment

### Firebase Hosting (Frontend)
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init hosting`
4. Build: `cd client && npm run build`
5. Deploy: `firebase deploy --only hosting`

### Backend Deployment
Deploy the Express server to:
- Heroku
- Railway
- Render
- Google Cloud Run
- AWS Elastic Beanstalk

Update `REACT_APP_API_URL` in client `.env` to point to your deployed backend.

