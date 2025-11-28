import bcrypt from 'bcryptjs';
import pool from '../config/database.js';
import { generateToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Register new user
export const register = asyncHandler(async (req, res) => {
  const { email, password, fullName, role, bio, subjects } = req.body;

  // Check if user already exists
  const existingUser = await pool.query(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );

  if (existingUser.rows.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'User with this email already exists'
    });
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Create user
  const userResult = await pool.query(
    `INSERT INTO users (email, password_hash, full_name, role, bio)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, email, full_name, role, bio, is_verified, created_at`,
    [email, passwordHash, fullName, role, bio || null]
  );

  const user = userResult.rows[0];

  // Create user settings
  await pool.query(
    'INSERT INTO user_settings (user_id) VALUES ($1)',
    [user.id]
  );

  // If tutor or both, create tutor profile
  if (role === 'tutor' || role === 'both') {
    await pool.query(
      `INSERT INTO tutor_profiles (user_id, status)
       VALUES ($1, $2)`,
      [user.id, 'pending']
    );
  }

  // Add subjects if provided
  if (subjects && Array.isArray(subjects) && subjects.length > 0) {
    for (const subjectName of subjects) {
      // Get or create subject
      const subjectResult = await pool.query(
        `INSERT INTO subjects (name) VALUES ($1)
         ON CONFLICT (name) DO UPDATE SET name = $1
         RETURNING id`,
        [subjectName]
      );

      const subjectId = subjectResult.rows[0].id;

      // Link user to subject
      await pool.query(
        `INSERT INTO user_subjects (user_id, subject_id)
         VALUES ($1, $2)
         ON CONFLICT (user_id, subject_id) DO NOTHING`,
        [user.id, subjectId]
      );
    }
  }

  // Log activity
  await pool.query(
    `INSERT INTO activity_log (user_id, activity_type, description)
     VALUES ($1, $2, $3)`,
    [user.id, 'user_registered', 'User account created']
  );

  // Generate token
  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role
  });

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        bio: user.bio,
        isVerified: user.is_verified,
        createdAt: user.created_at
      },
      token
    }
  });
});

// Login user
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user
  const userResult = await pool.query(
    `SELECT u.id, u.email, u.password_hash, u.full_name, u.role, u.bio,
            u.avatar_url, u.is_verified, u.is_active
     FROM users u
     WHERE u.email = $1`,
    [email]
  );

  if (userResult.rows.length === 0) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  const user = userResult.rows[0];

  // Check if account is active
  if (!user.is_active) {
    return res.status(403).json({
      success: false,
      message: 'Account has been deactivated'
    });
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password_hash);

  if (!isValidPassword) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Get user subjects
  const subjectsResult = await pool.query(
    `SELECT s.id, s.name, s.category, us.proficiency_level
     FROM subjects s
     JOIN user_subjects us ON s.id = us.subject_id
     WHERE us.user_id = $1`,
    [user.id]
  );

  // Log activity
  await pool.query(
    `INSERT INTO activity_log (user_id, activity_type, description)
     VALUES ($1, $2, $3)`,
    [user.id, 'user_login', 'User logged in']
  );

  // Generate token
  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role
  });

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        bio: user.bio,
        avatarUrl: user.avatar_url,
        isVerified: user.is_verified,
        subjects: subjectsResult.rows
      },
      token
    }
  });
});

// Get current user
export const getCurrentUser = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const userResult = await pool.query(
    `SELECT id, email, full_name, role, bio, avatar_url, phone, is_verified, created_at
     FROM users
     WHERE id = $1`,
    [userId]
  );

  if (userResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const user = userResult.rows[0];

  // Get user subjects
  const subjectsResult = await pool.query(
    `SELECT s.id, s.name, s.category, us.proficiency_level
     FROM subjects s
     JOIN user_subjects us ON s.id = us.subject_id
     WHERE us.user_id = $1`,
    [userId]
  );

  res.json({
    success: true,
    data: {
      ...user,
      subjects: subjectsResult.rows
    }
  });
});

// Logout user
export const logout = asyncHandler(async (req, res) => {
  // Log activity
  await pool.query(
    `INSERT INTO activity_log (user_id, activity_type, description)
     VALUES ($1, $2, $3)`,
    [req.user.id, 'user_logout', 'User logged out']
  );

  res.json({
    success: true,
    message: 'Logout successful'
  });
});

// Change password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  // Get current password hash
  const userResult = await pool.query(
    'SELECT password_hash FROM users WHERE id = $1',
    [userId]
  );

  if (userResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Verify current password
  const isValid = await bcrypt.compare(
    currentPassword,
    userResult.rows[0].password_hash
  );

  if (!isValid) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  // Hash new password
  const newPasswordHash = await bcrypt.hash(newPassword, 10);

  // Update password
  await pool.query(
    'UPDATE users SET password_hash = $1 WHERE id = $2',
    [newPasswordHash, userId]
  );

  // Log activity
  await pool.query(
    `INSERT INTO activity_log (user_id, activity_type, description)
     VALUES ($1, $2, $3)`,
    [userId, 'password_changed', 'Password was changed']
  );

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});

// Reset password (forgot password)
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, newPassword } = req.body;

  // Find user
  const userResult = await pool.query(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );

  if (userResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'User with this email not found'
    });
  }

  const userId = userResult.rows[0].id;

  // Hash new password
  const passwordHash = await bcrypt.hash(newPassword, 10);

  // Update password
  await pool.query(
    'UPDATE users SET password_hash = $1 WHERE id = $2',
    [passwordHash, userId]
  );

  // Log activity
  await pool.query(
    `INSERT INTO activity_log (user_id, activity_type, description)
     VALUES ($1, $2, $3)`,
    [userId, 'password_reset', 'Password was reset']
  );

  res.json({
    success: true,
    message: 'Password reset successfully'
  });
});
