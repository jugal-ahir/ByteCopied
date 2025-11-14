# ByteCopied - Code Snippet Management & Attendance System

A full-stack web application for university students to manage code snippets and an integrated attendance system for administrators.

## 🚀 Features

### Code Snippet Management
- **Students**: Create, edit, delete, and download code snippets
- **Admins**: Create view-only snippets, view all student snippets
- **Download Options**: Individual, batch selection, or download all snippets
- **Syntax Highlighting**: Beautiful code display with language support
- **Secure Access**: Role-based access control with JWT authentication

### Attendance System
- **Section-Based**: Support for 4 sections (A, B, C, D)
- **Configurable Timer**: 30, 40, 50, or 60 seconds
- **Excel Integration**: Automatic roll number validation from Excel files
- **PDF Generation**: Downloadable attendance sheets with absentees list
- **Real-Time**: Live timer updates for students

## 🛠 Tech Stack

- **Frontend**: React 18, Material-UI, React Router
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT (JSON Web Tokens) with bcrypt password hashing
- **File Processing**: ExcelJS (Excel), PDFKit (PDF generation)
- **Code Highlighting**: react-syntax-highlighter
- **Deployment**: Vercel (Frontend) + Render (Backend)

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or MongoDB Atlas account)

## ⚡ Quick Start

See [QUICK_START.md](./QUICK_START.md) for a 5-minute setup guide.

### Basic Setup

1. **Install dependencies**:
   ```bash
   npm run install-all
   ```

2. **Configure environment variables**:
   - See [ENV_SETUP.md](./ENV_SETUP.md) for detailed instructions
   - Create `server/.env` with MongoDB connection string and JWT secret
   - Create `client/.env` with API URL

3. **Set up MongoDB**:
   - Install MongoDB locally or create a MongoDB Atlas account
   - Get your MongoDB connection string
   - Update `MONGODB_URI` in `server/.env`

4. **Prepare Excel files**:
   - Place Excel files in `assets/roll-sheets/`
   - See [EXCEL_FORMAT.md](./EXCEL_FORMAT.md) for format details

5. **Run the application**:
   ```bash
   npm run dev
   ```

6. **Set admin role**:
   ```bash
   npm run set-admin your-email@example.com
   ```

## 📚 Documentation

- **[SETUP.md](./SETUP.md)** - Detailed setup instructions
- **[QUICK_START.md](./QUICK_START.md)** - 5-minute quick start guide
- **[EXCEL_FORMAT.md](./EXCEL_FORMAT.md)** - Excel file format specification
- **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** - Complete project structure

## 🎯 Usage

### For Students
1. Sign up/Login with email or Google
2. Navigate to **Snippets** to manage your code
3. Create, edit, and download your snippets
4. View admin's view-only snippets
5. Submit attendance during active sessions

### For Admins
1. Login with admin account
2. **Snippets**: Create view-only snippets for students, view all snippets
3. **Attendance**: 
   - Select section and timer duration
   - Start attendance session
   - End session to generate PDF with absentees

## 🔐 Security

- Firebase Authentication for secure login
- Firestore security rules for data protection
- Role-based access control (Student/Admin)
- JWT token verification on all API endpoints

## 📦 Project Structure

```
ByteCopiedV3/
├── client/              # React frontend
├── server/              # Express backend
├── assets/              # Static assets (Excel files)
├── firestore.rules      # Firestore security rules
└── firebase.json        # Firebase configuration
```

See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for complete structure.

## 🚢 Deployment

### Frontend (Firebase Hosting)
```bash
cd client
npm run build
firebase deploy --only hosting
```

### Backend
Deploy to Heroku, Railway, Render, or any Node.js hosting platform.

## 📝 License

ISC

## 🤝 Contributing

This is a university project. For issues or questions, please refer to the documentation files.

