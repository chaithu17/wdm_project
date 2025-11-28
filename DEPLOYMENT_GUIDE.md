# P2P Learning Platform - Deployment Guide

Complete guide for deploying the P2P Learning Platform to production with frontend and backend.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Database Setup](#database-setup)
4. [Backend Deployment](#backend-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [Production Environment Variables](#production-environment-variables)
7. [Deployment Options](#deployment-options)
8. [Post-Deployment](#post-deployment)
9. [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

### Required Software

- **Node.js**: >= 18.x
- **PostgreSQL**: >= 14.x
- **Git**: Latest version
- **npm** or **yarn**

### Required Accounts (for production deployment)

- **Vercel** or **Netlify** (for frontend)
- **Render**, **Railway**, or **Heroku** (for backend)
- **PostgreSQL Database** (Render, Supabase, or AWS RDS)

---

## 💻 Local Development Setup

### 1. Clone and Setup

```bash
cd /path/to/wdm_pro
```

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create PostgreSQL database
createdb p2p_learning

# Configure environment variables
# Edit backend/.env with your database credentials

# Run migrations
npm run db:migrate

# Seed database with initial data
npm run db:seed

# Start backend server
npm run dev
```

Backend will run on `http://localhost:3000`

### 3. Frontend Setup

```bash
# Navigate to frontend
cd "BellurDayananda_Namburi_Pala_Palli_Pari_Phase2 2/BellurDayananda_Namburi_Pala_Palli_Pari_Phase2_CodePacket"

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on `http://localhost:5173`

### 4. Test the Application

- Open `http://localhost:5173` in your browser
- Login with:
  - **Admin**: admin@email.com / pass123
  - **Student**: student@email.com / password123
  - **Tutor**: tutor@email.com / password123

---

## 🗄️ Database Setup

### Local PostgreSQL Setup

```bash
# Install PostgreSQL (macOS)
brew install postgresql@14
brew services start postgresql@14

# Create database
createdb p2p_learning

# Create user (optional)
psql postgres
CREATE USER p2p_admin WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE p2p_learning TO p2p_admin;
\q
```

### Production Database Options

#### Option 1: Render PostgreSQL (Recommended)

1. Go to [render.com](https://render.com)
2. Create New → PostgreSQL
3. Choose free tier or paid plan
4. Note down the connection details:
   - Host
   - Database name
   - Username
   - Password
   - Port

#### Option 2: Supabase

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string from Settings → Database
4. Use direct connection (not pooler) for migrations

#### Option 3: AWS RDS

1. Create PostgreSQL instance in AWS RDS
2. Configure security group to allow your backend server
3. Note connection details

---

## 🚀 Backend Deployment

### Option 1: Render (Recommended)

#### Step 1: Prepare Backend

```bash
cd backend

# Ensure package.json has correct scripts
# "start": "node src/server.js"
```

#### Step 2: Deploy to Render

1. Go to [render.com](https://render.com) and sign in
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `p2p-learning-api`
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free or Starter

#### Step 3: Add Environment Variables

In Render dashboard, add these environment variables:

```env
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-frontend-domain.vercel.app

# Database (from Render PostgreSQL)
DB_HOST=your-db-host.render.com
DB_PORT=5432
DB_NAME=p2p_learning
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# JWT Secret - Generate a strong random string
JWT_SECRET=generate_a_very_strong_random_secret_key_here
JWT_EXPIRES_IN=7d

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Step 4: Run Migrations

In Render Shell (or locally pointing to production DB):

```bash
npm run db:migrate
npm run db:seed
```

#### Step 5: Deploy

Render will automatically deploy on git push. Note your backend URL:
```
https://p2p-learning-api.onrender.com
```

---

### Option 2: Railway

1. Go to [railway.app](https://railway.app)
2. Create new project
3. Add PostgreSQL database
4. Deploy from GitHub
5. Add environment variables
6. Run migrations via Railway CLI

---

## 🎨 Frontend Deployment

### Option 1: Vercel (Recommended)

#### Step 1: Update Frontend Environment

Create/update `.env.production` in frontend folder:

```env
VITE_API_URL=https://your-backend-url.onrender.com/api
```

#### Step 2: Deploy to Vercel

```bash
cd "BellurDayananda_Namburi_Pala_Palli_Pari_Phase2 2/BellurDayananda_Namburi_Pala_Palli_Pari_Phase2_CodePacket"

# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

Or use Vercel Dashboard:

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `BellurDayananda_Namburi_Pala_Palli_Pari_Phase2 2/BellurDayananda_Namburi_Pala_Palli_Pari_Phase2_CodePacket`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Add Environment Variable:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com/api
   ```

6. Deploy

---

### Option 2: Netlify

```bash
cd frontend

# Install Netlify CLI
npm install -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod
```

---

## 🔐 Production Environment Variables

### Backend (.env)

```env
# Server
NODE_ENV=production
PORT=3000
API_URL=https://your-api-domain.com
FRONTEND_URL=https://your-frontend-domain.com

# Database - Production
DB_HOST=your-production-db-host
DB_PORT=5432
DB_NAME=p2p_learning_prod
DB_USER=your_db_user
DB_PASSWORD=your_strong_db_password

# JWT - CRITICAL: Use a strong random secret
JWT_SECRET=your_super_secure_random_jwt_secret_at_least_32_chars
JWT_EXPIRES_IN=7d

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Optional: Stripe (for payments)
STRIPE_SECRET_KEY=sk_live_your_stripe_secret
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_public

# Optional: Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

### Frontend (.env.production)

```env
VITE_API_URL=https://your-backend-api.onrender.com/api
```

---

## 📦 Deployment Options Comparison

| Platform | Backend | Frontend | Database | Cost | Difficulty |
|----------|---------|----------|----------|------|------------|
| **Render + Vercel** | ✅ | ✅ | ✅ | Free tier available | Easy |
| **Railway** | ✅ | ✅ | ✅ | $5/month | Easy |
| **Heroku** | ✅ | ❌ | ✅ | $7/month | Medium |
| **AWS (EC2 + RDS + S3)** | ✅ | ✅ | ✅ | Variable | Hard |
| **DigitalOcean Droplet** | ✅ | ✅ | ✅ | $6/month | Medium |

**Recommended for Students**: Render (Backend + DB) + Vercel (Frontend)

---

## ✅ Post-Deployment Checklist

### 1. Update Backend CORS

In backend `src/server.js`, ensure CORS allows your frontend domain:

```javascript
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'https://your-frontend.vercel.app',
  credentials: true,
  optionsSuccessStatus: 200
};
```

### 2. Test All Features

- [ ] User Registration
- [ ] User Login
- [ ] Admin Login (admin@email.com / pass123)
- [ ] Document Upload/Download
- [ ] Tutor Search
- [ ] Session Booking
- [ ] Exam Creation
- [ ] Messaging
- [ ] Profile Updates

### 3. Security Checks

- [ ] JWT_SECRET is strong and unique
- [ ] Database password is strong
- [ ] HTTPS enabled on both frontend and backend
- [ ] Rate limiting is active
- [ ] CORS is properly configured
- [ ] Environment variables are not exposed in frontend build

### 4. Performance Optimization

- [ ] Frontend build is optimized (`npm run build`)
- [ ] Database indexes are created (already in schema.sql)
- [ ] Backend uses compression middleware (already configured)
- [ ] Images and assets are optimized

### 5. Monitoring Setup

- [ ] Check Render logs for backend errors
- [ ] Set up Vercel analytics for frontend
- [ ] Monitor database performance
- [ ] Set up error tracking (optional: Sentry)

---

## 🐛 Troubleshooting

### Issue: CORS Error

**Solution**: Update backend CORS configuration to include your frontend URL

```javascript
// backend/src/server.js
const corsOptions = {
  origin: ['https://your-frontend.vercel.app', 'http://localhost:5173'],
  credentials: true
};
```

### Issue: Database Connection Failed

**Solution**: Check environment variables
```bash
# In Render shell
echo $DB_HOST
echo $DB_NAME

# Test connection
psql "postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"
```

### Issue: 404 on Refresh (Frontend)

**Solution**: Vercel should auto-detect, but ensure `vercel.json` exists:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Issue: File Uploads Fail

**Solution**:
- Render free tier has ephemeral file system
- Files are deleted on server restart
- Consider using AWS S3 or Cloudinary for production file storage

### Issue: JWT Token Expires Too Quickly

**Solution**: Update backend JWT_EXPIRES_IN
```env
JWT_EXPIRES_IN=30d  # 30 days instead of 7
```

### Issue: Backend Slow to Wake Up

**Solution**:
- Render free tier spins down after inactivity
- Upgrade to paid tier for always-on
- Or use a service like UptimeRobot to ping your API every 15 minutes

---

## 🔄 Continuous Deployment

### Automatic Deployment on Git Push

Both Render and Vercel support automatic deployment:

1. **Push to GitHub**:
```bash
git add .
git commit -m "Your commit message"
git push origin main
```

2. **Automatic Build & Deploy**:
   - Vercel will rebuild frontend
   - Render will rebuild backend
   - Usually takes 2-5 minutes

### Branch-based Deployment

- `main` branch → Production
- `develop` branch → Staging (configure separate Vercel project)

---

## 📊 Monitoring & Maintenance

### Database Backups

**Render PostgreSQL**:
- Paid plans include automatic daily backups
- Free tier: Manual backup via pg_dump

```bash
# Manual backup
pg_dump "postgresql://user:pass@host:port/dbname" > backup.sql

# Restore
psql "postgresql://user:pass@host:port/dbname" < backup.sql
```

### Log Monitoring

**Backend (Render)**:
- View logs in Render dashboard
- Logs are stored for 7 days on free tier

**Frontend (Vercel)**:
- Runtime logs in Vercel dashboard
- Set up error tracking with Sentry

### Performance Monitoring

- Use Render metrics for backend CPU/memory
- Use Vercel Analytics for frontend performance
- Monitor database query performance

---

## 🎓 Student Deployment Quick Start

For quick student project deployment:

1. **Create Render Account** → Deploy PostgreSQL (free)
2. **Deploy Backend to Render** → Use GitHub integration
3. **Add Environment Variables** → Copy from `.env.example`
4. **Run Migration** → In Render shell: `npm run db:migrate && npm run db:seed`
5. **Create Vercel Account** → Deploy Frontend
6. **Add API URL** → In Vercel environment variables
7. **Test** → Visit your Vercel URL and try logging in

Total time: ~30 minutes

---

## 📞 Support

For deployment issues:
- Check Render status: https://status.render.com
- Check Vercel status: https://www.vercel-status.com
- Review logs in respective dashboards

---

**Congratulations! Your P2P Learning Platform is now live!** 🎉
