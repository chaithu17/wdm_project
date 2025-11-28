import pool from '../config/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Get all tutors with search, filters, and pagination
export const getAllTutors = asyncHandler(async (req, res) => {
  const {
    search,
    subject,
    minRating,
    maxHourlyRate,
    minHourlyRate,
    experience,
    status,
    page = 1,
    limit = 10
  } = req.query;

  const offset = (page - 1) * limit;
  let query = `
    SELECT DISTINCT
      u.id,
      u.full_name,
      u.email,
      u.avatar_url,
      u.bio,
      tp.hourly_rate,
      tp.experience_years,
      tp.status,
      tp.rating,
      tp.total_reviews,
      tp.total_sessions,
      tp.created_at,
      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object('id', s.id, 'name', s.name, 'category', s.category)
        ) FILTER (WHERE s.id IS NOT NULL),
        '[]'
      ) as subjects
    FROM users u
    INNER JOIN tutor_profiles tp ON u.id = tp.user_id
    LEFT JOIN user_subjects us ON u.id = us.user_id
    LEFT JOIN subjects s ON us.subject_id = s.id
    WHERE u.is_active = true
  `;

  const params = [];
  let paramCount = 0;

  // Search filter
  if (search) {
    paramCount++;
    query += ` AND (u.full_name ILIKE $${paramCount} OR u.bio ILIKE $${paramCount})`;
    params.push(`%${search}%`);
  }

  // Subject filter
  if (subject) {
    paramCount++;
    query += ` AND s.name = $${paramCount}`;
    params.push(subject);
  }

  // Rating filter
  if (minRating) {
    paramCount++;
    query += ` AND tp.rating >= $${paramCount}`;
    params.push(parseFloat(minRating));
  }

  // Hourly rate filters
  if (minHourlyRate) {
    paramCount++;
    query += ` AND tp.hourly_rate >= $${paramCount}`;
    params.push(parseFloat(minHourlyRate));
  }

  if (maxHourlyRate) {
    paramCount++;
    query += ` AND tp.hourly_rate <= $${paramCount}`;
    params.push(parseFloat(maxHourlyRate));
  }

  // Experience filter
  if (experience) {
    paramCount++;
    query += ` AND tp.experience_years >= $${paramCount}`;
    params.push(parseInt(experience));
  }

  // Status filter
  if (status) {
    paramCount++;
    query += ` AND tp.status = $${paramCount}`;
    params.push(status);
  }

  query += ` GROUP BY u.id, tp.hourly_rate, tp.experience_years, tp.status, tp.rating, tp.total_reviews, tp.total_sessions, tp.created_at`;
  query += ` ORDER BY tp.rating DESC, tp.total_reviews DESC`;

  // Add pagination
  paramCount++;
  query += ` LIMIT $${paramCount}`;
  params.push(parseInt(limit));

  paramCount++;
  query += ` OFFSET $${paramCount}`;
  params.push(offset);

  const tutorsResult = await pool.query(query, params);

  // Get total count for pagination
  let countQuery = `
    SELECT COUNT(DISTINCT u.id)
    FROM users u
    INNER JOIN tutor_profiles tp ON u.id = tp.user_id
    LEFT JOIN user_subjects us ON u.id = us.user_id
    LEFT JOIN subjects s ON us.subject_id = s.id
    WHERE u.is_active = true
  `;

  const countParams = [];
  let countParamCount = 0;

  if (search) {
    countParamCount++;
    countQuery += ` AND (u.full_name ILIKE $${countParamCount} OR u.bio ILIKE $${countParamCount})`;
    countParams.push(`%${search}%`);
  }

  if (subject) {
    countParamCount++;
    countQuery += ` AND s.name = $${countParamCount}`;
    countParams.push(subject);
  }

  if (minRating) {
    countParamCount++;
    countQuery += ` AND tp.rating >= $${countParamCount}`;
    countParams.push(parseFloat(minRating));
  }

  if (minHourlyRate) {
    countParamCount++;
    countQuery += ` AND tp.hourly_rate >= $${countParamCount}`;
    countParams.push(parseFloat(minHourlyRate));
  }

  if (maxHourlyRate) {
    countParamCount++;
    countQuery += ` AND tp.hourly_rate <= $${countParamCount}`;
    countParams.push(parseFloat(maxHourlyRate));
  }

  if (experience) {
    countParamCount++;
    countQuery += ` AND tp.experience_years >= $${countParamCount}`;
    countParams.push(parseInt(experience));
  }

  if (status) {
    countParamCount++;
    countQuery += ` AND tp.status = $${countParamCount}`;
    countParams.push(status);
  }

  const countResult = await pool.query(countQuery, countParams);
  const totalCount = parseInt(countResult.rows[0].count);

  res.json({
    success: true,
    data: {
      tutors: tutorsResult.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit: parseInt(limit)
      }
    }
  });
});

// Get tutor by ID
export const getTutorById = asyncHandler(async (req, res) => {
  const { tutorId } = req.params;

  const tutorResult = await pool.query(
    `SELECT
      u.id,
      u.full_name,
      u.email,
      u.avatar_url,
      u.bio,
      u.phone,
      u.created_at,
      tp.hourly_rate,
      tp.experience_years,
      tp.status,
      tp.rating,
      tp.total_reviews,
      tp.total_sessions,
      tp.bio as tutor_bio,
      tp.education,
      tp.certifications,
      tp.languages,
      tp.availability
    FROM users u
    INNER JOIN tutor_profiles tp ON u.id = tp.user_id
    WHERE u.id = $1 AND u.is_active = true`,
    [tutorId]
  );

  if (tutorResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Tutor not found'
    });
  }

  const tutor = tutorResult.rows[0];

  // Get subjects
  const subjectsResult = await pool.query(
    `SELECT s.id, s.name, s.category, us.proficiency_level
     FROM subjects s
     JOIN user_subjects us ON s.id = us.subject_id
     WHERE us.user_id = $1`,
    [tutorId]
  );

  // Get recent reviews (limit to 5)
  const reviewsResult = await pool.query(
    `SELECT
      r.id,
      r.rating,
      r.comment,
      r.created_at,
      u.full_name as reviewer_name,
      u.avatar_url as reviewer_avatar
    FROM reviews r
    JOIN users u ON r.reviewer_id = u.id
    WHERE r.reviewee_id = $1
    ORDER BY r.created_at DESC
    LIMIT 5`,
    [tutorId]
  );

  res.json({
    success: true,
    data: {
      ...tutor,
      subjects: subjectsResult.rows,
      recentReviews: reviewsResult.rows
    }
  });
});

// Update tutor profile
export const updateTutorProfile = asyncHandler(async (req, res) => {
  const { tutorId } = req.params;
  const {
    hourlyRate,
    experienceYears,
    bio,
    education,
    certifications,
    languages,
    availability,
    subjects
  } = req.body;

  // Check if user is updating their own profile or is admin
  if (req.user.id !== tutorId && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'You can only update your own tutor profile'
    });
  }

  // Check if tutor profile exists
  const existingProfile = await pool.query(
    'SELECT user_id FROM tutor_profiles WHERE user_id = $1',
    [tutorId]
  );

  if (existingProfile.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Tutor profile not found'
    });
  }

  // Update tutor profile
  const updateResult = await pool.query(
    `UPDATE tutor_profiles
     SET hourly_rate = COALESCE($1, hourly_rate),
         experience_years = COALESCE($2, experience_years),
         bio = COALESCE($3, bio),
         education = COALESCE($4, education),
         certifications = COALESCE($5, certifications),
         languages = COALESCE($6, languages),
         availability = COALESCE($7, availability)
     WHERE user_id = $8
     RETURNING *`,
    [hourlyRate, experienceYears, bio, education, certifications, languages, availability, tutorId]
  );

  // Update subjects if provided
  if (subjects && Array.isArray(subjects) && subjects.length > 0) {
    // Remove existing subjects
    await pool.query('DELETE FROM user_subjects WHERE user_id = $1', [tutorId]);

    // Add new subjects
    for (const subjectName of subjects) {
      const subjectResult = await pool.query(
        `INSERT INTO subjects (name) VALUES ($1)
         ON CONFLICT (name) DO UPDATE SET name = $1
         RETURNING id`,
        [subjectName]
      );

      const subjectId = subjectResult.rows[0].id;

      await pool.query(
        `INSERT INTO user_subjects (user_id, subject_id)
         VALUES ($1, $2)
         ON CONFLICT (user_id, subject_id) DO NOTHING`,
        [tutorId, subjectId]
      );
    }
  }

  // Log activity
  await pool.query(
    `INSERT INTO activity_log (user_id, activity_type, description)
     VALUES ($1, $2, $3)`,
    [tutorId, 'tutor_profile_updated', 'Tutor profile information updated']
  );

  res.json({
    success: true,
    message: 'Tutor profile updated successfully',
    data: updateResult.rows[0]
  });
});

// Get tutor reviews
export const getTutorReviews = asyncHandler(async (req, res) => {
  const { tutorId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  const reviewsResult = await pool.query(
    `SELECT
      r.id,
      r.rating,
      r.comment,
      r.created_at,
      u.id as reviewer_id,
      u.full_name as reviewer_name,
      u.avatar_url as reviewer_avatar,
      s.id as session_id
    FROM reviews r
    JOIN users u ON r.reviewer_id = u.id
    LEFT JOIN sessions s ON r.session_id = s.id
    WHERE r.reviewee_id = $1
    ORDER BY r.created_at DESC
    LIMIT $2 OFFSET $3`,
    [tutorId, parseInt(limit), offset]
  );

  // Get total count
  const countResult = await pool.query(
    'SELECT COUNT(*) FROM reviews WHERE reviewee_id = $1',
    [tutorId]
  );

  const totalCount = parseInt(countResult.rows[0].count);

  res.json({
    success: true,
    data: {
      reviews: reviewsResult.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit: parseInt(limit)
      }
    }
  });
});

// Get tutor sessions
export const getTutorSessions = asyncHandler(async (req, res) => {
  const { tutorId } = req.params;
  const { status, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  let query = `
    SELECT
      s.id,
      s.title,
      s.description,
      s.scheduled_at,
      s.duration,
      s.status,
      s.price,
      s.created_at,
      u.id as student_id,
      u.full_name as student_name,
      u.avatar_url as student_avatar,
      sub.name as subject
    FROM sessions s
    JOIN users u ON s.student_id = u.id
    LEFT JOIN subjects sub ON s.subject_id = sub.id
    WHERE s.tutor_id = $1
  `;

  const params = [tutorId];
  let paramCount = 1;

  if (status) {
    paramCount++;
    query += ` AND s.status = $${paramCount}`;
    params.push(status);
  }

  query += ` ORDER BY s.scheduled_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
  params.push(parseInt(limit), offset);

  const sessionsResult = await pool.query(query, params);

  // Get total count
  let countQuery = 'SELECT COUNT(*) FROM sessions WHERE tutor_id = $1';
  const countParams = [tutorId];

  if (status) {
    countQuery += ' AND status = $2';
    countParams.push(status);
  }

  const countResult = await pool.query(countQuery, countParams);
  const totalCount = parseInt(countResult.rows[0].count);

  res.json({
    success: true,
    data: {
      sessions: sessionsResult.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit: parseInt(limit)
      }
    }
  });
});

// Get tutor earnings
export const getTutorEarnings = asyncHandler(async (req, res) => {
  const { tutorId } = req.params;
  const { startDate, endDate } = req.query;

  // Check if user is requesting their own earnings or is admin
  if (req.user.id !== tutorId && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'You can only view your own earnings'
    });
  }

  let query = `
    SELECT
      COALESCE(SUM(p.amount), 0) as total_earnings,
      COALESCE(SUM(p.platform_fee), 0) as total_fees,
      COALESCE(SUM(p.amount - p.platform_fee), 0) as net_earnings,
      COUNT(DISTINCT p.id) as total_transactions,
      COUNT(DISTINCT s.id) as completed_sessions
    FROM payments p
    JOIN sessions s ON p.session_id = s.id
    WHERE s.tutor_id = $1 AND p.status = 'completed'
  `;

  const params = [tutorId];
  let paramCount = 1;

  if (startDate) {
    paramCount++;
    query += ` AND p.created_at >= $${paramCount}`;
    params.push(startDate);
  }

  if (endDate) {
    paramCount++;
    query += ` AND p.created_at <= $${paramCount}`;
    params.push(endDate);
  }

  const earningsResult = await pool.query(query, params);

  // Get monthly breakdown
  let monthlyQuery = `
    SELECT
      TO_CHAR(p.created_at, 'YYYY-MM') as month,
      COALESCE(SUM(p.amount - p.platform_fee), 0) as net_earnings,
      COUNT(DISTINCT s.id) as sessions
    FROM payments p
    JOIN sessions s ON p.session_id = s.id
    WHERE s.tutor_id = $1 AND p.status = 'completed'
  `;

  const monthlyParams = [tutorId];
  let monthlyParamCount = 1;

  if (startDate) {
    monthlyParamCount++;
    monthlyQuery += ` AND p.created_at >= $${monthlyParamCount}`;
    monthlyParams.push(startDate);
  }

  if (endDate) {
    monthlyParamCount++;
    monthlyQuery += ` AND p.created_at <= $${monthlyParamCount}`;
    monthlyParams.push(endDate);
  }

  monthlyQuery += ` GROUP BY TO_CHAR(p.created_at, 'YYYY-MM') ORDER BY month DESC LIMIT 12`;

  const monthlyResult = await pool.query(monthlyQuery, monthlyParams);

  res.json({
    success: true,
    data: {
      summary: earningsResult.rows[0],
      monthlyBreakdown: monthlyResult.rows
    }
  });
});
