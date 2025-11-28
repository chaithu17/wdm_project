# P2P Learning Platform - Backend API

Production-ready RESTful API for the P2P Learning & Tutoring Platform built with Node.js, Express, and PostgreSQL.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control (Student, Tutor, Admin)
- **User Management**: Complete user profile and settings management
- **Tutor System**: Tutor discovery, ratings, reviews, and verification
- **Session Booking**: Schedule and manage tutoring sessions
- **Document Management**: Upload, download, and share study materials
- **Exam System**: Create, take, and grade exams
- **Planner**: Personal task and schedule management
- **Messaging**: Real-time chat between users
- **Admin Dashboard**: Complete platform management and analytics
- **Payment Integration**: Session payments with platform fees
- **File Upload**: Secure file handling with validation
- **Security**: Helmet, CORS, rate limiting, input validation
- **Logging**: Winston logger with file and console output

## 📋 Prerequisites

- Node.js >= 18.x
- PostgreSQL >= 14.x
- npm or yarn

## 🛠️ Installation

### 1. Clone the repository

```bash
cd backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up PostgreSQL database

```bash
# Create database
createdb p2p_learning

# Or using psql
psql -U postgres
CREATE DATABASE p2p_learning;
\q
```

### 4. Configure environment variables

The `.env` file is already configured with default development settings. Update these values for your environment:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=p2p_learning
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Secret - IMPORTANT: Change in production
JWT_SECRET=your_super_secret_key

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### 5. Run database migrations

```bash
npm run db:migrate
```

### 6. Seed database with initial data

```bash
npm run db:seed
```

This will create:
- Admin user: `admin@email.com` / `pass123`
- Sample student: `student@email.com` / `password123`
- Sample tutors: `tutor@email.com` / `password123`
- Default subjects and achievements

### 7. Start the server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

## 📚 API Documentation

### Base URL

```
http://localhost:3000/api
```

### Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### API Endpoints

#### Authentication (`/api/auth`)

- `POST /register` - Register new user
- `POST /login` - Login user
- `GET /me` - Get current user (requires auth)
- `POST /logout` - Logout user (requires auth)
- `POST /change-password` - Change password (requires auth)
- `POST /reset-password` - Reset password

#### Users (`/api/users`)

- `GET /:userId` - Get user profile
- `PATCH /:userId` - Update user profile
- `GET /:userId/statistics` - Get user statistics
- `GET /:userId/progress` - Get learning progress
- `PATCH /:userId/progress/:subject` - Update learning progress
- `GET /:userId/activity` - Get user activity log
- `GET /:userId/achievements` - Get user achievements
- `GET /:userId/settings` - Get user settings
- `PATCH /:userId/settings` - Update user settings

#### Tutors (`/api/tutors`)

- `GET /` - Get all tutors (with filters)
- `GET /:tutorId` - Get tutor details
- `PATCH /:tutorId` - Update tutor profile
- `GET /:tutorId/reviews` - Get tutor reviews
- `GET /:tutorId/sessions` - Get tutor sessions
- `GET /:tutorId/earnings` - Get tutor earnings

#### Documents (`/api/documents`)

- `POST /` - Upload document
- `GET /` - Get all documents for user
- `GET /:documentId` - Get document details
- `GET /:documentId/download` - Download document
- `DELETE /:documentId` - Delete document
- `POST /:documentId/favorite` - Toggle favorite
- `POST /:documentId/share` - Share document

#### Sessions (`/api/sessions`)

- `POST /` - Create session
- `GET /` - Get all sessions for user
- `GET /:sessionId` - Get session details
- `PATCH /:sessionId` - Update session
- `POST /:sessionId/cancel` - Cancel session
- `POST /:sessionId/complete` - Complete session

#### Exams (`/api/exams`)

- `POST /` - Create exam (tutor only)
- `GET /` - Get all exams
- `GET /:examId` - Get exam details
- `PATCH /:examId` - Update exam
- `DELETE /:examId` - Delete exam
- `POST /:examId/publish` - Publish exam
- `POST /:examId/submit` - Submit exam (student)
- `POST /:examId/submissions/:submissionId/grade` - Grade submission
- `GET /:examId/submissions` - Get exam submissions

#### Planner (`/api/planner`)

- `POST /` - Create planner item
- `GET /` - Get planner items
- `PATCH /:itemId` - Update planner item
- `DELETE /:itemId` - Delete planner item

#### Messages (`/api/messages`)

- `POST /` - Send message
- `GET /conversations` - Get all conversations
- `GET /unread-count` - Get unread message count
- `GET /:userId` - Get conversation with user
- `POST /:messageId/read` - Mark message as read
- `DELETE /:messageId` - Delete message

#### Admin (`/api/admin`) - Admin only

- `GET /users` - Get all users
- `GET /tutors/verification-requests` - Get tutor verification requests
- `POST /tutors/:tutorId/approve` - Approve tutor
- `POST /tutors/:tutorId/reject` - Reject tutor
- `POST /tutors/:tutorId/suspend` - Suspend tutor
- `GET /sessions` - Get all sessions
- `GET /payments` - Get all payments
- `GET /disputes` - Get disputes
- `POST /disputes/:disputeId/resolve` - Resolve dispute
- `GET /coupons` - Get coupons
- `POST /coupons` - Create coupon
- `PATCH /coupons/:couponId` - Update coupon
- `GET /analytics` - Get platform analytics
- `GET /export/:type` - Export data (CSV)

## 🗂️ Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # Database configuration
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── userController.js    # User management
│   │   ├── tutorController.js   # Tutor operations
│   │   ├── documentController.js
│   │   ├── sessionController.js
│   │   ├── examController.js
│   │   ├── plannerController.js
│   │   ├── messageController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication
│   │   ├── errorHandler.js      # Error handling
│   │   ├── validation.js        # Input validation
│   │   └── upload.js            # File upload
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── tutorRoutes.js
│   │   ├── documentRoutes.js
│   │   ├── sessionRoutes.js
│   │   ├── examRoutes.js
│   │   ├── plannerRoutes.js
│   │   ├── messageRoutes.js
│   │   └── adminRoutes.js
│   ├── utils/
│   │   └── logger.js            # Winston logger
│   ├── database/
│   │   ├── schema.sql           # Database schema
│   │   ├── migrate.js           # Migration script
│   │   └── seed.js              # Seed data
│   └── server.js                # Main server file
├── uploads/                      # File uploads
├── logs/                         # Application logs
├── .env                          # Environment variables
├── .env.example                  # Environment template
├── package.json
└── README.md
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Prevent brute force attacks
- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing control
- **Input Validation**: express-validator for request validation
- **SQL Injection Prevention**: Parameterized queries
- **File Upload Validation**: File type and size restrictions

## 🧪 Testing

Health check endpoint:

```bash
curl http://localhost:3000/health
```

Test authentication:

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123",
    "fullName": "Test User",
    "role": "student"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@email.com",
    "password": "pass123"
  }'
```

## 🚢 Production Deployment

### 1. Update environment variables

```env
NODE_ENV=production
JWT_SECRET=<strong_random_secret>
DB_PASSWORD=<secure_password>
FRONTEND_URL=https://your-domain.com
```

### 2. Use a process manager

```bash
# Install PM2
npm install -g pm2

# Start server
pm2 start src/server.js --name p2p-api

# Save process list
pm2 save

# Set up startup script
pm2 startup
```

### 3. Set up reverse proxy (Nginx)

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4. Enable HTTPS with Let's Encrypt

```bash
sudo certbot --nginx -d api.yourdomain.com
```

## 📊 Database Backup

```bash
# Backup
pg_dump -U postgres p2p_learning > backup.sql

# Restore
psql -U postgres p2p_learning < backup.sql
```

## 🐛 Troubleshooting

### Database connection issues

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection
psql -U postgres -h localhost
```

### Port already in use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

## 📝 License

MIT

## 👥 Support

For issues and questions, please open an issue on GitHub.
