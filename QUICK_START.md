# ByteCopied Quick Start Guide

## Prerequisites Check
- ✅ Node.js installed (v14+)
- ✅ Firebase account
- ✅ Firebase project created

## 5-Minute Setup

### 1. Install Dependencies (2 minutes)
```bash
npm run install-all
```

### 2. Configure Firebase (2 minutes)

#### Get Firebase Config
1. Go to Firebase Console → Project Settings → General
2. Scroll to "Your apps" → Click Web icon (</>)
3. Copy config values

#### Get Service Account Key
1. Go to Project Settings → Service Accounts
2. Click "Generate new private key"
3. Download JSON and extract: `project_id`, `private_key`, `client_email`

### 3. Set Environment Variables (1 minute)

**Create `server/.env`:**
```env
PORT=5000
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-key-here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
```

**Create `client/.env`:**
```env
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Enable Firebase Services
- **Authentication**: Enable Email/Password and Google
- **Firestore**: Create database in production mode
- **Deploy Rules**: Copy `firestore.rules` to Firebase Console

### 5. Prepare Excel Files
Create 4 Excel files in `assets/roll-sheets/`:
- `sectionA.xlsx` (Roll numbers in Column A)
- `sectionB.xlsx`
- `sectionC.xlsx`
- `sectionD.xlsx`

### 6. Run the App
```bash
npm run dev
```

### 7. Set Admin Role
1. Sign up with your email
2. Run: `npm run set-admin your-email@example.com`

## You're Ready! 🎉

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## First Steps
1. **Login** with your admin account
2. **Create a snippet** to test the system
3. **Start an attendance session** to test attendance
4. **Open another browser** and login as a student to submit attendance

## Troubleshooting

**Port already in use?**
- Change `PORT` in `server/.env`

**Firebase errors?**
- Double-check all environment variables
- Verify Firebase services are enabled

**Excel file not found?**
- Ensure files are in `assets/roll-sheets/`
- Check file names match exactly: `sectionA.xlsx`, etc.

**Permission denied?**
- Deploy Firestore rules from `firestore.rules`
- Verify admin role is set correctly

## Need Help?
See `SETUP.md` for detailed instructions.

