# P2P Learning Platform - Full Stack Application

A comprehensive peer-to-peer learning and tutoring platform with user management, session booking, document sharing, exams, and admin dashboard.

## 🎯 Project Overview

This is a production-ready full-stack web application built for connecting students with tutors, managing learning sessions, sharing educational resources, and tracking academic progress.

### Key Features

- **User Authentication**: Secure JWT-based authentication with role-based access control
- **User Roles**: Student, Tutor, Both (Student+Tutor), Admin
- **Tutor Discovery**: Search and filter tutors by subject, rating, price, and experience
- **Session Booking**: Schedule, manage, and complete tutoring sessions
- **Document Management**: Upload, download, share, and favorite study materials
- **Exam System**: Create, take, and grade exams with multiple question types
- **Planner**: Personal task and schedule management
- **Messaging**: Real-time chat between users
- **Admin Dashboard**: Complete platform management, analytics, and user verification
- **Payment System**: Session payments with platform fee management
- **Reviews & Ratings**: Rate tutors and view detailed reviews
- **Achievements**: Gamification with user achievements and progress tracking

## 🏗️ Architecture

### Frontend
- **Framework**: React 19.1.1
- **Build Tool**: Vite 7.1
- **Routing**: React Router v7.9
- **Styling**: Tailwind CSS v4.1
- **State Management**: React Context API
- **Icons**: Lucide React, React Icons

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL 14+
- **Authentication**: JWT + bcrypt
- **File Upload**: express-fileupload
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Winston
- **Validation**: express-validator

## 📂 Project Structure

```
wdm_pro/
├── backend/                           # Backend API
│   ├── src/
│   │   ├── config/                    # Database configuration
│   │   ├── controllers/               # Request handlers (9 controllers)
│   │   ├── middleware/                # Auth, validation, error handling
│   │   ├── routes/                    # API routes
│   │   ├── database/                  # Schema, migrations, seeds
│   │   ├── utils/                     # Logger and utilities
│   │   └── server.js                  # Main server file
│   ├── uploads/                       # File uploads directory
│   ├── logs/                          # Application logs
│   ├── .env                           # Environment variables
│   └── package.json
│
├── BellurDayananda_Namburi_Pala_Palli_Pari_Phase2 2/
│   └── BellurDayananda_Namburi_Pala_Palli_Pari_Phase2_CodePacket/  # Frontend
│       ├── src/
│       │   ├── app/                   # App configuration
│       │   │   ├── providers/         # AuthProvider
│       │   │   └── routes/            # Route configuration
│       │   ├── components/            # Reusable components
│       │   │   ├── layouts/           # Layout components
│       │   │   └── studytools/        # Study tools (Timer, Calculator, etc.)
│       │   ├── pages/                 # Page components
│       │   │   ├── app/               # Protected app pages
│       │   │   └── admin/             # Admin dashboard
│       │   ├── services/              # API services
│       │   ├── data/                  # Mock data (legacy)
│       │   └── models/                # Data models
│       ├── public/                    # Static assets
│       └── package.json
│
├── DEPLOYMENT_GUIDE.md                # Comprehensive deployment guide
└── README.md                          # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.x
- PostgreSQL >= 14.x
- npm or yarn

### 1. Clone Repository

```bash
git clone https://github.com/chaithu17/wdm_project.git
cd wdm_project
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create PostgreSQL database
createdb p2p_learning

# Configure environment variables (edit .env file)
# Update DB_PASSWORD and JWT_SECRET

# Run database migrations
npm run db:migrate

# Seed database with sample data
npm run db:seed

# Start backend server
npm run dev
```

Backend runs on: `http://localhost:3000`

### 3. Frontend Setup

```bash
cd "../BellurDayananda_Namburi_Pala_Palli_Pari_Phase2 2/BellurDayananda_Namburi_Pala_Palli_Pari_Phase2_CodePacket"

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs on: `http://localhost:5173`

### 4. Access Application

Open `http://localhost:5173` and login with:

- **Admin**: admin@email.com / pass123
- **Student**: student@email.com / password123
- **Tutor**: tutor@email.com / password123

## 🎮 Features Walkthrough

### For Students

1. **Find Tutors**: Browse tutors by subject, rating, and price
2. **Book Sessions**: Schedule tutoring sessions with preferred tutors
3. **Upload Documents**: Share study materials with others
4. **Take Exams**: Complete exams created by tutors
5. **Track Progress**: Monitor learning progress across subjects
6. **Chat**: Message tutors directly

### For Tutors

1. **Create Profile**: Set hourly rate, subjects, and availability
2. **Manage Sessions**: View and complete booked sessions
3. **Create Exams**: Build exams with MCQ, true/false, and short answer questions
4. **Grade Submissions**: Review and grade student exam submissions
5. **Earn Money**: Track earnings from completed sessions
6. **Share Resources**: Upload educational documents

### For Admins

1. **User Management**: View, verify, and manage all users
2. **Tutor Verification**: Approve or reject tutor applications
3. **Session Oversight**: Monitor all platform sessions
4. **Payment Management**: Track payments and platform fees
5. **Dispute Resolution**: Handle disputes between users
6. **Analytics**: View platform statistics and growth metrics
7. **Coupon Management**: Create and manage discount coupons

## 📊 Database Schema

The platform uses PostgreSQL with 20+ tables:

- **users**: User accounts and authentication
- **tutor_profiles**: Tutor-specific information
- **subjects**: Academic subjects
- **documents**: Uploaded study materials
- **sessions**: Tutoring session bookings
- **exams**: Exam definitions and questions
- **exam_submissions**: Student exam attempts
- **messages**: Chat messages
- **payments**: Payment records
- **reviews**: User reviews and ratings
- **achievements**: Gamification achievements
- **planner_items**: Personal schedules
- **disputes**: Dispute management
- **activity_log**: User activity tracking

See `backend/src/database/schema.sql` for complete schema.

## 🔐 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Rate Limiting**: Prevent brute force attacks
- **CORS**: Cross-origin resource sharing control
- **Helmet**: Security headers
- **Input Validation**: express-validator for all inputs
- **SQL Injection Prevention**: Parameterized queries
- **File Upload Validation**: Type and size restrictions

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/reset-password` - Reset password

### Users
- `GET /api/users/:userId` - Get user profile
- `PATCH /api/users/:userId` - Update profile
- `GET /api/users/:userId/statistics` - Get user stats
- `GET /api/users/:userId/progress` - Get learning progress
- `GET /api/users/:userId/achievements` - Get achievements
- `GET /api/users/:userId/settings` - Get user settings

### Tutors
- `GET /api/tutors` - Get all tutors (with filters)
- `GET /api/tutors/:tutorId` - Get tutor details
- `PATCH /api/tutors/:tutorId` - Update tutor profile
- `GET /api/tutors/:tutorId/earnings` - Get tutor earnings

### Documents
- `POST /api/documents` - Upload document
- `GET /api/documents` - Get all documents
- `GET /api/documents/:id/download` - Download document
- `POST /api/documents/:id/favorite` - Toggle favorite
- `DELETE /api/documents/:id` - Delete document

### Sessions
- `POST /api/sessions` - Create session
- `GET /api/sessions` - Get all sessions
- `PATCH /api/sessions/:id` - Update session
- `POST /api/sessions/:id/complete` - Complete session

### Exams
- `POST /api/exams` - Create exam
- `GET /api/exams/:id` - Get exam details
- `POST /api/exams/:id/submit` - Submit exam
- `POST /api/exams/:id/submissions/:subId/grade` - Grade submission

### Messages
- `POST /api/messages` - Send message
- `GET /api/messages/conversations` - Get conversations
- `GET /api/messages/:userId` - Get conversation with user

### Admin (Admin only)
- `GET /api/admin/users` - Get all users
- `POST /api/admin/tutors/:id/approve` - Approve tutor
- `GET /api/admin/analytics` - Get platform analytics
- `GET /api/admin/payments` - Get all payments
- `GET /api/admin/export/:type` - Export data

See `backend/README.md` for complete API documentation.

## 🧪 Testing

### Backend Health Check

```bash
curl http://localhost:3000/health
```

### Test Authentication

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@email.com","password":"pass123"}'
```

### Frontend Testing

The application includes Vitest for testing. Run tests:

```bash
cd frontend
npm test
```

## 🚢 Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for complete deployment instructions.

### Quick Deploy Options

**Recommended Stack**:
- **Frontend**: Vercel (Free tier)
- **Backend**: Render (Free tier)
- **Database**: Render PostgreSQL (Free tier)

**Deploy Steps**:
1. Push code to GitHub
2. Deploy backend to Render
3. Deploy frontend to Vercel
4. Configure environment variables
5. Run database migrations

Total deployment time: ~30 minutes

## 🛠️ Development

### Backend Development

```bash
cd backend

# Development mode with auto-reload
npm run dev

# Run migrations
npm run db:migrate

# Seed database
npm run db:seed
```

### Frontend Development

```bash
cd frontend

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📝 Environment Variables

### Backend (.env)

```env
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

DB_HOST=localhost
DB_PORT=5432
DB_NAME=p2p_learning
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3000/api
```

## 🤝 Contributing

This is a student project. Contributions, issues, and feature requests are welcome!

## 📄 License

MIT License

## 👥 Team

- Phase 2 Development Team
- Course: Web Data Management

## 📞 Support

For issues or questions, please create an issue on GitHub.

## 🙏 Acknowledgments

- React and Vite teams
- Express.js community
- PostgreSQL developers
- All open-source contributors

---

**Built with ❤️ for education**
