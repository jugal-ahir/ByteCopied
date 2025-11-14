# ByteCopied Project Structure

```
ByteCopiedV3/
├── client/                          # React Frontend
│   ├── public/
│   │   └── index.html              # HTML template
│   ├── src/
│   │   ├── components/             # Reusable React components
│   │   │   ├── Navbar.js          # Navigation bar
│   │   │   └── PrivateRoute.js    # Protected route wrapper
│   │   ├── contexts/               # React Context providers
│   │   │   └── AuthContext.js     # Authentication context
│   │   ├── pages/                  # Page components
│   │   │   ├── Login.js           # Login/Signup page
│   │   │   ├── Dashboard.js       # Dashboard/home page
│   │   │   ├── Snippets.js        # Code snippets management
│   │   │   └── Attendance.js      # Attendance system
│   │   ├── services/               # API services
│   │   │   └── api.js             # Axios API instance
│   │   ├── config/                 # Configuration files
│   │   │   └── firebase.js        # Firebase configuration
│   │   ├── App.js                 # Main App component
│   │   ├── index.js               # React entry point
│   │   └── index.css              # Global styles
│   ├── package.json               # Frontend dependencies
│   └── .env.example               # Environment variables template
│
├── server/                         # Express Backend
│   ├── routes/                     # API routes
│   │   ├── snippets.js            # Code snippets endpoints
│   │   └── attendance.js          # Attendance endpoints
│   ├── utils/                      # Utility scripts
│   │   └── setAdminRole.js        # Admin role setter script
│   ├── index.js                   # Express server entry point
│   ├── package.json               # Backend dependencies
│   └── .env.example               # Environment variables template
│
├── assets/                         # Static assets
│   └── roll-sheets/               # Excel files for attendance
│       ├── sectionA.xlsx          # Section A roll numbers
│       ├── sectionB.xlsx          # Section B roll numbers
│       ├── sectionC.xlsx          # Section C roll numbers
│       └── sectionD.xlsx          # Section D roll numbers
│
├── firestore.rules                # Firestore security rules
├── firestore.indexes.json         # Firestore indexes
├── firebase.json                  # Firebase configuration
├── package.json                   # Root package.json
├── .gitignore                     # Git ignore rules
├── README.md                      # Main documentation
├── SETUP.md                       # Setup instructions
├── EXCEL_FORMAT.md                # Excel file format guide
└── PROJECT_STRUCTURE.md           # This file
```

## Key Features

### Frontend (React)
- **Authentication**: Firebase Auth with email/password and Google Sign-in
- **UI Framework**: Material-UI (MUI) for professional design
- **Code Highlighting**: react-syntax-highlighter for code display
- **File Downloads**: file-saver for downloading snippets and PDFs
- **Routing**: React Router for navigation

### Backend (Express + Firebase)
- **Authentication**: Firebase Admin SDK for token verification
- **Database**: Firestore for data storage
- **File Processing**: ExcelJS for reading Excel files, PDFKit for generating PDFs
- **API**: RESTful API with role-based access control

### Database Collections
- `users`: User profiles and roles
- `snippets`: Code snippets with metadata
- `attendanceSessions`: Active/completed attendance sessions
- `attendanceSubmissions`: Individual attendance submissions

## API Endpoints

### Snippets
- `GET /api/snippets` - Get all snippets (role-based)
- `GET /api/snippets/:id` - Get single snippet
- `POST /api/snippets` - Create snippet
- `PUT /api/snippets/:id` - Update snippet
- `DELETE /api/snippets/:id` - Delete snippet

### Attendance
- `POST /api/attendance/start` - Start attendance session (Admin only)
- `POST /api/attendance/submit` - Submit attendance (Students)
- `POST /api/attendance/end` - End session and generate PDF (Admin only)
- `GET /api/attendance/sessions` - Get attendance sessions

## Role-Based Access

### Student
- Create, edit, delete own snippets
- View own snippets + admin's view-only snippets
- Download snippets (individual, batch, or all)
- Submit attendance during active sessions

### Admin
- All student permissions
- Create view-only snippets
- View all snippets from all students
- Start/end attendance sessions
- Generate attendance PDFs
- View all attendance submissions

