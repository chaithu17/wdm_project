import pool from '../config/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Get user profile
export const getUserProfile = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const userResult = await pool.query(
    `SELECT id, email, full_name, role, bio, avatar_url, phone, is_verified, created_at
     FROM users
     WHERE id = $1 AND is_active = true`,
    [userId]
  );

  if (userResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const user = userResult.rows[0];

  // Get subjects
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

// Update user profile
export const updateUserProfile = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { fullName, bio, phone, avatarUrl } = req.body;

  // Check if user is updating their own profile or is admin
  if (req.user.id !== userId && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'You can only update your own profile'
    });
  }

  const updateResult = await pool.query(
    `UPDATE users
     SET full_name = COALESCE($1, full_name),
         bio = COALESCE($2, bio),
         phone = COALESCE($3, phone),
         avatar_url = COALESCE($4, avatar_url)
     WHERE id = $5
     RETURNING id, email, full_name, role, bio, avatar_url, phone, is_verified`,
    [fullName, bio, phone, avatarUrl, userId]
  );

  if (updateResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Log activity
  await pool.query(
    `INSERT INTO activity_log (user_id, activity_type, description)
     VALUES ($1, $2, $3)`,
    [userId, 'profile_updated', 'Profile information updated']
  );

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: updateResult.rows[0]
  });
});

// Get user statistics
export const getUserStatistics = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Get session stats
  const sessionStats = await pool.query(
    `SELECT
       COUNT(*) FILTER (WHERE status = 'completed') as completed_sessions,
       COUNT(*) FILTER (WHERE status = 'scheduled') as upcoming_sessions,
       COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_sessions,
       COALESCE(SUM(duration) FILTER (WHERE status = 'completed'), 0) as total_hours
     FROM sessions
     WHERE student_id = $1 OR tutor_id = $1`,
    [userId]
  );

  // Get average rating if tutor
  const ratingStats = await pool.query(
    `SELECT
       COALESCE(AVG(rating), 0) as average_rating,
       COUNT(*) as total_reviews
     FROM reviews
     WHERE reviewee_id = $1`,
    [userId]
  );

  // Get documents count
  const documentsStats = await pool.query(
    `SELECT COUNT(*) as total_documents
     FROM documents
     WHERE user_id = $1`,
    [userId]
  );

  // Get achievements count
  const achievementsStats = await pool.query(
    `SELECT COUNT(*) as total_achievements
     FROM user_achievements
     WHERE user_id = $1`,
    [userId]
  );

  res.json({
    success: true,
    data: {
      sessions: sessionStats.rows[0],
      rating: ratingStats.rows[0],
      documents: documentsStats.rows[0].total_documents,
      achievements: achievementsStats.rows[0].total_achievements
    }
  });
});

// Get learning progress
export const getLearningProgress = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const progressResult = await pool.query(
    `SELECT lp.id, s.name as subject, lp.progress_percentage,
            lp.hours_studied, lp.last_studied_at
     FROM learning_progress lp
     JOIN subjects s ON lp.subject_id = s.id
     WHERE lp.user_id = $1
     ORDER BY lp.last_studied_at DESC NULLS LAST`,
    [userId]
  );

  res.json({
    success: true,
    data: progressResult.rows
  });
});

// Update learning progress
export const updateLearningProgress = asyncHandler(async (req, res) => {
  const { userId, subject } = req.params;
  const { progressPercentage, hoursStudied } = req.body;

  // Get subject ID
  const subjectResult = await pool.query(
    'SELECT id FROM subjects WHERE name = $1',
    [subject]
  );

  if (subjectResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Subject not found'
    });
  }

  const subjectId = subjectResult.rows[0].id;

  // Upsert progress
  const progressResult = await pool.query(
    `INSERT INTO learning_progress (user_id, subject_id, progress_percentage, hours_studied, last_studied_at)
     VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
     ON CONFLICT (user_id, subject_id)
     DO UPDATE SET
       progress_percentage = COALESCE($3, learning_progress.progress_percentage),
       hours_studied = COALESCE($4, learning_progress.hours_studied),
       last_studied_at = CURRENT_TIMESTAMP
     RETURNING *`,
    [userId, subjectId, progressPercentage, hoursStudied]
  );

  res.json({
    success: true,
    message: 'Learning progress updated',
    data: progressResult.rows[0]
  });
});

// Get user activity
export const getUserActivity = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const limit = parseInt(req.query.limit) || 20;

  const activityResult = await pool.query(
    `SELECT activity_type, description, metadata, created_at
     FROM activity_log
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [userId, limit]
  );

  res.json({
    success: true,
    data: activityResult.rows
  });
});

// Get user achievements
export const getUserAchievements = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const achievementsResult = await pool.query(
    `SELECT a.id, a.name, a.description, a.icon, ua.earned_at
     FROM achievements a
     JOIN user_achievements ua ON a.id = ua.achievement_id
     WHERE ua.user_id = $1
     ORDER BY ua.earned_at DESC`,
    [userId]
  );

  res.json({
    success: true,
    data: achievementsResult.rows
  });
});

// Get user settings
export const getUserSettings = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const settingsResult = await pool.query(
    `SELECT notifications_enabled, email_notifications, theme, language,
            timezone, privacy_level
     FROM user_settings
     WHERE user_id = $1`,
    [userId]
  );

  if (settingsResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'User settings not found'
    });
  }

  res.json({
    success: true,
    data: settingsResult.rows[0]
  });
});

// Update user settings
export const updateUserSettings = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const {
    notificationsEnabled,
    emailNotifications,
    theme,
    language,
    timezone,
    privacyLevel
  } = req.body;

  const updateResult = await pool.query(
    `UPDATE user_settings
     SET notifications_enabled = COALESCE($1, notifications_enabled),
         email_notifications = COALESCE($2, email_notifications),
         theme = COALESCE($3, theme),
         language = COALESCE($4, language),
         timezone = COALESCE($5, timezone),
         privacy_level = COALESCE($6, privacy_level)
     WHERE user_id = $7
     RETURNING *`,
    [notificationsEnabled, emailNotifications, theme, language, timezone, privacyLevel, userId]
  );

  if (updateResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'User settings not found'
    });
  }

  res.json({
    success: true,
    message: 'Settings updated successfully',
    data: updateResult.rows[0]
  });
});
