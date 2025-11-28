#  P2P Learning & Study Planning Platform

AI-powered **peer-to-peer learning** platform built with **React + Vite + Tailwind v4**. Students and tutors collaborate, find sessions, manage documents, create exams, and chat with an AI study assistant.

---

##  UTA Cloud Platform link
https://vxb8285.uta.cloud/

##  Tech Stack

- **Frontend:** React (Vite) + Tailwind CSS v4  
- **Routing:** React Router v6  
- **State:** React Context (`AuthProvider`) + `localStorage` / `sessionStorage`  
- **Forms:** Formspree (Contact)  
- **Icons:** Lucide React, React-Icons  
- **Deploy:** Vercel

---

##  Setup & Installation
```bash

# Install dependencies
npm install

# Start development server
npm run dev
# Open http://localhost:5173
```

**Deployment Note:** For Vite + React Router, ensure your hosting platform rewrites all routes to `/index.html` (SPA configuration). On Vercel, add a rewrite rule pointing to `/index.html`.

---

##  Authentication System

Complete client-side authentication flow with signup, signin, password reset, role-based access, and session management.

### Data Storage

- **User Database:** `localStorage` (mock persistent storage)
- **Active Session:** `sessionStorage` (current signed-in user)
- Components read from session (e.g., `Chat.jsx` reads `sessionStorage.getItem('user')`)

### Sign Up (Create Account)

**Location:** `/signin` → "Sign Up" tab

**Fields:**
- Full Name (required; defaults to email prefix if omitted)
- Email (required; must be unique)
- Password (required) with validation:
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 special character
- Confirm Password (must match)
- Role (select one):
  - Learn as a Student
  - Teach as a Tutor
  - Both Learn and Teach
- Subjects of Interest (multi-select chips)
- Bio (optional)

**Behavior:**
- Calls `register({...})` from `AuthProvider`
- If email exists → displays error banner
- On success → navigates to `/app` (Dashboard) with active session

### Sign In (Existing Users)

**Location:** `/signin` → "Sign In" tab

**Fields:**
- Email
- Password

**Behavior:**
- Calls `login(email, password)` from `AuthProvider`
- On success → navigates to `/app` and writes session to `sessionStorage`
- On failure → displays "Invalid email or password" error

### Forgot Password

**Location:** `/signin` → "Forgot Password?" link (Sign In tab)

**Behavior (Client-Side Demo):**
- Collects Email, Full Name, New Password, Confirm New Password
- Validates password match
- On success → shows success alert and prompts sign in with new password
- **Note:** Demo flow only. Production requires backend (email tokens, expiry, etc.)

### Session Management

- On successful authentication, user object (`name`, `email`, `role`, `subjects`, `bio`) saved to `sessionStorage`
- Components access current user via `sessionStorage.getItem('user')`
- Logout clears session and redirects to `/`

### Role-Based Access Control

- `AppLayout.jsx` filters navigation using `hasAccess(routeName)` from `AuthProvider`
- If user accesses `/app` without permission for default route, auto-redirects to first allowed route
- Extensible for granular permissions (e.g., tutors see exam creation, students don't)

### Admin Login

**Test Credentials:**
- **Email:** `admin`
- **Password:** `pass123`
- **Role:** Admin

**Usage:**
1. Navigate to `/signin`
2. Enter admin credentials
3. Access app with admin privileges (based on `hasAccess` logic)

For dedicated admin dashboard, add `/admin` route and ensure `hasAccess('admin')` returns `true` for admin users.

---

##  Features

###  Landing Page
- Video hero section with particle canvas background
- Scroll-snap sections with smooth animations
- Call-to-action buttons

###  Dashboard
- Overview cards: sessions, credits, recommendations, activity feed
- Quick access to all platform features

###  Tutors Directory
- Search and filter by subject/price
- Star ratings and verified badges
- Tutor profiles with availability

###  Documents
- Upload and tag documents
- Search functionality
- Favorites system

###  Create Exam
- Multiple question types (MCQ, True/False, Short Answer)
- Points allocation and duration settings
- Retake options and question randomization

###  AI Assistant (Chat)
- Smart conversational UI
- Quick suggestion chips
- Integrated tools:
  - Calculator
  - Note Maker
  - Study Guide Generator
  - Pomodoro Timer

### Planner / Grade Exams
- Scheduling workflow
- Exam grading interface

###  Profile
- Edit full name, email, bio, subjects
- View credits used and remaining
- Account settings

###  Contact Form
- Formspree integration
- Field validation
- Success state confirmation

###  Mobile Navigation
- Bottom navigation bar for small screens
- Touch-optimized interface

---

##  Routing Overview

| Route | Description |
|-------|-------------|
| `/` | Landing Page |
| `/signin` | Sign In / Sign Up / Forgot Password |
| `/app` | Dashboard (protected root) |
| `/app/tutors` | Tutors Directory |
| `/app/documents` | Documents |
| `/app/create-exam` | Exam Builder |
| `/app/planner` | Grade Exams / Planner |
| `/app/chat` | AI Assistant / Peer Chat |
| `/app/profile` | User Profile |
| `*` | 404 Not Found |

**Note:** Navigation items filtered by `hasAccess(routeName)` in `AppLayout.jsx`

---

##  Project Structure
```
src/
├─ app/
│  ├─ providers/
│  │  └─ AuthProvider.jsx        # Authentication logic & access control
│  └─ routes/
│     └─ AppRouter.jsx           # Application route definitions
│
├─ components/
│  ├─ Navbar.jsx                 # Public navigation bar
│  ├─ Footer.jsx                 # Public footer
│  └─ ContactForm.jsx            # Formspree contact form
│
├─ layouts/
│  ├─ PublicLayout.jsx           # Layout for /, /signin
│  └─ AppLayout.jsx              # Layout for /app/* with role-based nav
│
├─ pages/
│  ├─ Home.jsx                   # Landing page (particles + video hero)
│  ├─ SignIn.jsx                 # Authentication pages
│  ├─ Overview.jsx               # Dashboard overview
│  ├─ Tutors.jsx                 # Tutor directory with filters
│  ├─ Documents.jsx              # Document management
│  ├─ CreateExam.jsx             # Exam builder interface
│  ├─ Planner.jsx                # Grading and scheduling
│  ├─ Chat.jsx                   # AI assistant and peer chat
│  ├─ Profile.jsx                # User profile and credits
│  └─ NotFound.jsx               # 404 page
│
├─ index.css                     # Tailwind v4 configuration
└─ main.jsx                      # Application bootstrap
```

---

##  Developer Notes

### Styling
- **Tailwind v4** tokens and layers configured in `index.css`
- Custom utility classes for platform-specific styling

### Storage Strategy
- **User Database:** `localStorage` (persistent mock DB)
- **Active Session:** `sessionStorage` (cleared on tab close)

### Security Warning
 **This is a demo implementation with client-side authentication only.**

For production deployment:
- Implement backend authentication server
- Use secure password hashing (bcrypt, argon2)
- JWT or session tokens with expiry
- HTTPS enforcement
- Role-based access control (RBAC) on server
- Secure password reset with email verification
- Rate limiting and CSRF protection

### SPA Hosting
Configure your hosting platform to rewrite all routes to `/index.html`:

**Vercel:** Add `vercel.json`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

**Netlify:** Add `_redirects`:
```
/*    /index.html   200
```

---

##  Team & Responsibilities

| Team Member | Responsibility |
|-------------|----------------|
| **Vachan Bellur Dayananda** | Dashboard UI & feature integration |
| **Chaitanya Krishna Namburi** | Admin logic, approval workflow & access control |
| **Poojaa Pari** | Landing page (video hero, particles, contact) |
| **Saketraj Pala** | Sign Up / Sign In page, auth validation & UX |
| **Sushma Palli** | AI chat integration & study tools functionality |

---

##  Adding New Protected Pages

To add a new role-gated page:

1. **Create page component** in `src/pages/`:
```jsx
// src/pages/NewPage.jsx
export default function NewPage() {
  return <div>New Protected Page</div>;
}
```

2. **Add route** in `AppRouter.jsx`:
```jsx
{ path: 'newpage', element: <NewPage /> }
```

3. **Update access control** in `AuthProvider.jsx`:
```jsx
const hasAccess = (routeName) => {
  const routes = {
    // ... existing routes
    newpage: ['student', 'tutor', 'admin'], // allowed roles
  };
  return routes[routeName]?.includes(user.role);
};
```

4. **Add navigation item** in `AppLayout.jsx`:
```jsx
const navItems = [
  // ... existing items
  { name: 'New Page', path: '/app/newpage', icon: IconName, routeName: 'newpage' },
];
```

---

## Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

---


