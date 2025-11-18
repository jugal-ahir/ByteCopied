# 💻 ByteCopied

> A comprehensive full-stack web application for university students and administrators to manage code snippets, track attendance, and organize class timetables.

[![React](https://img.shields.io/badge/React-18.0+-61DAFB?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-14+-339933?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4.4+-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Material-UI](https://img.shields.io/badge/Material--UI-5.0+-007FFF?logo=mui)](https://mui.com/)

## ✨ Features

### 📝 Code Snippet Management
- **Create & Edit**: Write and manage code snippets with syntax highlighting
- **Multi-Language Support**: Support for 50+ programming languages
- **Monaco Editor**: Professional code editor with IntelliSense and auto-completion
- **Download Options**: Download individual snippets, batch selection, or all at once
- **Role-Based Access**: Students can manage their snippets; Admins can create view-only snippets
- **Beautiful UI**: Modern, responsive design with custom scrollbars and smooth animations

### 👥 Attendance System
- **Section-Based Tracking**: Support for multiple sections (A, B, C, D)
- **Configurable Timer**: Set attendance window (30, 40, 50, or 60 seconds)
- **Excel Integration**: Automatic roll number validation from Excel files
- **Real-Time Updates**: Live timer countdown for students
- **PDF Reports**: Generate downloadable attendance sheets with absentees list
- **Time Consistency**: Server-synchronized timers ensure accuracy across all devices

### 📅 Timetable Manager
- **Smart Scheduling**: Intelligent timetable creation with automatic conflict detection
- **Visual Grid**: Weekly timetable view with color-coded courses
- **Merged Cells**: Multi-hour courses displayed as merged cells for better visualization
- **Conflict Detection**: Automatic detection and highlighting of scheduling conflicts
- **Export Options**: Download timetable as PDF or CSV
- **Course Details**: Track course code, name, section, and timings

### 🎨 User Experience
- **Fully Responsive**: Optimized for desktop, tablet, and mobile devices
- **Modern UI**: Beautiful gradient designs with glassmorphism effects
- **Dark Theme**: Eye-friendly dark mode for code viewing
- **Smooth Animations**: Polished transitions and hover effects
- **Mobile Navigation**: Hamburger menu for seamless mobile experience

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **Material-UI (MUI)** - Component library and design system
- **React Router** - Client-side routing
- **Monaco Editor** - VS Code editor in the browser
- **React Syntax Highlighter** - Code syntax highlighting
- **File Saver** - Client-side file downloads

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **Bcrypt** - Password hashing
- **PDFKit** - PDF generation
- **Express Validator** - Input validation

### Deployment
- **Frontend**: Vercel / Firebase Hosting
- **Backend**: Render / Railway / Heroku

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas account)

## ⚡ Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/jugal-ahir/ByteCopied.git
cd ByteCopied
```

### 2. Install Dependencies
```bash
npm run install-all
```

### 3. Environment Setup

#### Backend (`server/.env`)
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

#### Frontend (`client/.env`)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Prepare Excel Files (for Attendance)
- Place Excel files in `assets/roll-sheets/`
- **Excel Format Requirements**:
  - First column (Column A) should contain roll numbers
  - Roll numbers can be text or numbers
  - File should be in `.xlsx` format
  - Example structure:
    ```
    Column A
    ---------
    2021001
    2021002
    2021003
    ```

### 5. Run the Application
```bash
# Development mode (runs both frontend and backend)
npm run dev

# Or run separately:
# Terminal 1 - Backend
cd server && npm start

# Terminal 2 - Frontend
cd client && npm start
```

### 6. Set Admin Role
```bash
npm run set-admin your-email@example.com
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 🎯 Usage Guide

### For Students 👨‍🎓

1. **Sign Up / Login**
   - Create an account with email or use Google authentication
   - Access your personalized dashboard

2. **Manage Code Snippets**
   - Navigate to **Snippets** page
   - Create new snippets with syntax highlighting
   - Edit, delete, or download your snippets
   - View admin-created view-only snippets

3. **Submit Attendance**
   - Go to **Attendance** page
   - Enter your roll number when a session is active
   - Submit before the timer expires

4. **View Timetable**
   - Check your weekly class schedule
   - See all courses with timings and sections

### For Administrators 👨‍💼

1. **Code Snippet Management**
   - Create view-only snippets for students
   - View all student-created snippets
   - Manage and organize educational content

2. **Attendance Management**
   - Select section (A, B, C, or D)
   - Choose timer duration (30-60 seconds)
   - Start attendance session
   - Monitor real-time submissions
   - End session to generate PDF report with absentees

3. **Timetable Management**
   - Add courses with course code, name, and section
   - Set multiple timings per course
   - Automatic conflict detection
   - Export timetable as PDF or CSV
   - Visual weekly grid with merged cells for multi-hour courses

## 🔐 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - Bcrypt for secure password storage
- **Role-Based Access Control** - Separate permissions for students and admins
- **Input Validation** - Server-side validation for all inputs
- **CORS Protection** - Configured CORS for secure API access
- **Environment Variables** - Sensitive data stored securely

## 📦 Project Structure

```
ByteCopiedV3/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts (Auth)
│   │   ├── services/       # API service layer
│   │   └── App.js          # Main app component
│   └── package.json
│
├── server/                 # Express backend application
│   ├── routes/             # API route handlers
│   ├── models/             # Mongoose data models
│   ├── middleware/         # Custom middleware (auth, validation)
│   ├── utils/              # Utility functions
│   └── index.js            # Server entry point
│
├── assets/                 # Static assets
│   └── roll-sheets/        # Excel files for attendance
│
└── README.md
```

## 🚀 Deployment

### Frontend Deployment (Vercel)
```bash
cd client
npm run build
vercel deploy
```

### Backend Deployment (Render)
1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard
3. Deploy automatically on push to main branch

### Alternative: Firebase Hosting
```bash
cd client
npm run build
firebase deploy --only hosting
```

## 🎨 Screenshots

> _Note: Add screenshots of your application here to showcase the UI_

## 🤝 Contributing

This is a university project. Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**Jugal**

- GitHub: [@jugal-ahir](https://github.com/jugal-ahir)
- Email: vaghmashijugal@gmail.com

## 🙏 Acknowledgments

- Material-UI for the amazing component library
- MongoDB for the robust database solution
- All the open-source contributors whose packages made this project possible

---

⭐ If you find this project helpful, please consider giving it a star!
