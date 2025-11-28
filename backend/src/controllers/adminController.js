import pool from '../config/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Get all users with filters
export const getAllUsers = asyncHandler(async (req, res) => {
  const {
    search,
    role,
    isVerified,
    isActive,
    sortBy = 'created_at',
    order = 'DESC',
    page = 1,
    limit = 20
  } = req.query;

  const offset = (page - 1) * limit;

  let query = `
    SELECT
      u.id,
      u.email,
      u.full_name,
      u.role,
      u.avatar_url,
      u.phone,
      u.is_verified,
      u.is_active,
      u.created_at,
      (SELECT COUNT(*) FROM sessions WHERE student_id = u.id OR tutor_id = u.id) as total_sessions,
      CASE
        WHEN u.role IN ('tutor', 'both') THEN tp.rating
        ELSE NULL
      END as tutor_rating
    FROM users u
    LEFT JOIN tutor_profiles tp ON u.id = tp.user_id
    WHERE 1=1
  `;

  const params = [];
  let paramCount = 0;

  // Search filter
  if (search) {
    paramCount++;
    query += ` AND (u.full_name ILIKE $${paramCount} OR u.email ILIKE $${paramCount})`;
    params.push(`%${search}%`);
  }

  // Role filter
  if (role) {
    paramCount++;
    query += ` AND u.role = $${paramCount}`;
    params.push(role);
  }

  // Verified filter
  if (isVerified !== undefined) {
    paramCount++;
    query += ` AND u.is_verified = $${paramCount}`;
    params.push(isVerified === 'true');
  }

  // Active filter
  if (isActive !== undefined) {
    paramCount++;
    query += ` AND u.is_active = $${paramCount}`;
    params.push(isActive === 'true');
  }

  // Sorting
  const allowedSortFields = ['created_at', 'full_name', 'email', 'role'];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
  const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  query += ` ORDER BY u.${sortField} ${sortOrder}`;

  // Pagination
  paramCount++;
  query += ` LIMIT $${paramCount}`;
  params.push(parseInt(limit));

  paramCount++;
  query += ` OFFSET $${paramCount}`;
  params.push(offset);

  const usersResult = await pool.query(query, params);

  // Get total count
  let countQuery = 'SELECT COUNT(*) FROM users u WHERE 1=1';
  const countParams = [];
  let countParamCount = 0;

  if (search) {
    countParamCount++;
    countQuery += ` AND (u.full_name ILIKE $${countParamCount} OR u.email ILIKE $${countParamCount})`;
    countParams.push(`%${search}%`);
  }

  if (role) {
    countParamCount++;
    countQuery += ` AND u.role = $${countParamCount}`;
    countParams.push(role);
  }

  if (isVerified !== undefined) {
    countParamCount++;
    countQuery += ` AND u.is_verified = $${countParamCount}`;
    countParams.push(isVerified === 'true');
  }

  if (isActive !== undefined) {
    countParamCount++;
    countQuery += ` AND u.is_active = $${countParamCount}`;
    countParams.push(isActive === 'true');
  }

  const countResult = await pool.query(countQuery, countParams);
  const totalCount = parseInt(countResult.rows[0].count);

  res.json({
    success: true,
    data: {
      users: usersResult.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit: parseInt(limit)
      }
    }
  });
});

// Get tutor verification requests
export const getTutorVerificationRequests = asyncHandler(async (req, res) => {
  const { status = 'pending', page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  const requestsResult = await pool.query(
    `SELECT
      u.id as user_id,
      u.email,
      u.full_name,
      u.avatar_url,
      u.phone,
      u.created_at as user_created_at,
      tp.hourly_rate,
      tp.experience_years,
      tp.status,
      tp.bio,
      tp.education,
      tp.certifications,
      tp.languages,
      tp.created_at as application_date,
      tp.updated_at
    FROM tutor_profiles tp
    JOIN users u ON tp.user_id = u.id
    WHERE tp.status = $1
    ORDER BY tp.created_at ASC
    LIMIT $2 OFFSET $3`,
    [status, parseInt(limit), offset]
  );

  // Get subjects for each tutor
  const tutorsWithSubjects = await Promise.all(
    requestsResult.rows.map(async (tutor) => {
      const subjectsResult = await pool.query(
        `SELECT s.id, s.name, s.category
         FROM subjects s
         JOIN user_subjects us ON s.id = us.subject_id
         WHERE us.user_id = $1`,
        [tutor.user_id]
      );

      return {
        ...tutor,
        subjects: subjectsResult.rows
      };
    })
  );

  // Get total count
  const countResult = await pool.query(
    'SELECT COUNT(*) FROM tutor_profiles WHERE status = $1',
    [status]
  );

  const totalCount = parseInt(countResult.rows[0].count);

  res.json({
    success: true,
    data: {
      requests: tutorsWithSubjects,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit: parseInt(limit)
      }
    }
  });
});

// Approve tutor
export const approveTutor = asyncHandler(async (req, res) => {
  const { tutorId } = req.params;
  const { notes } = req.body;

  // Update tutor status
  const updateResult = await pool.query(
    `UPDATE tutor_profiles
     SET status = 'approved', updated_at = CURRENT_TIMESTAMP
     WHERE user_id = $1
     RETURNING *`,
    [tutorId]
  );

  if (updateResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Tutor profile not found'
    });
  }

  // Create notification for tutor
  await pool.query(
    `INSERT INTO notifications (user_id, type, title, message, metadata)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      tutorId,
      'tutor_approved',
      'Tutor Application Approved',
      'Congratulations! Your tutor application has been approved. You can now start teaching.',
      JSON.stringify({ notes })
    ]
  );

  // Log activity
  await pool.query(
    `INSERT INTO activity_log (user_id, activity_type, description, metadata)
     VALUES ($1, $2, $3, $4)`,
    [req.user.id, 'tutor_approved', `Approved tutor application for user ${tutorId}`, JSON.stringify({ tutorId, notes })]
  );

  res.json({
    success: true,
    message: 'Tutor approved successfully',
    data: updateResult.rows[0]
  });
});

// Reject tutor
export const rejectTutor = asyncHandler(async (req, res) => {
  const { tutorId } = req.params;
  const { reason } = req.body;

  // Update tutor status
  const updateResult = await pool.query(
    `UPDATE tutor_profiles
     SET status = 'rejected', updated_at = CURRENT_TIMESTAMP
     WHERE user_id = $1
     RETURNING *`,
    [tutorId]
  );

  if (updateResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Tutor profile not found'
    });
  }

  // Create notification for tutor
  await pool.query(
    `INSERT INTO notifications (user_id, type, title, message, metadata)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      tutorId,
      'tutor_rejected',
      'Tutor Application Rejected',
      `Your tutor application has been rejected. Reason: ${reason || 'Not specified'}`,
      JSON.stringify({ reason })
    ]
  );

  // Log activity
  await pool.query(
    `INSERT INTO activity_log (user_id, activity_type, description, metadata)
     VALUES ($1, $2, $3, $4)`,
    [req.user.id, 'tutor_rejected', `Rejected tutor application for user ${tutorId}`, JSON.stringify({ tutorId, reason })]
  );

  res.json({
    success: true,
    message: 'Tutor rejected',
    data: updateResult.rows[0]
  });
});

// Suspend tutor
export const suspendTutor = asyncHandler(async (req, res) => {
  const { tutorId } = req.params;
  const { reason, duration } = req.body;

  // Update tutor status
  const updateResult = await pool.query(
    `UPDATE tutor_profiles
     SET status = 'suspended', updated_at = CURRENT_TIMESTAMP
     WHERE user_id = $1
     RETURNING *`,
    [tutorId]
  );

  if (updateResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Tutor profile not found'
    });
  }

  // Cancel all scheduled sessions
  await pool.query(
    `UPDATE sessions
     SET status = 'cancelled',
         notes = COALESCE(notes || ' | ', '') || 'Cancelled due to tutor suspension'
     WHERE tutor_id = $1 AND status = 'scheduled'`,
    [tutorId]
  );

  // Create notification for tutor
  await pool.query(
    `INSERT INTO notifications (user_id, type, title, message, metadata)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      tutorId,
      'tutor_suspended',
      'Account Suspended',
      `Your tutor account has been suspended. Reason: ${reason || 'Not specified'}`,
      JSON.stringify({ reason, duration })
    ]
  );

  // Log activity
  await pool.query(
    `INSERT INTO activity_log (user_id, activity_type, description, metadata)
     VALUES ($1, $2, $3, $4)`,
    [req.user.id, 'tutor_suspended', `Suspended tutor ${tutorId}`, JSON.stringify({ tutorId, reason, duration })]
  );

  res.json({
    success: true,
    message: 'Tutor suspended successfully'
  });
});

// Get all sessions (admin view)
export const getAllSessions = asyncHandler(async (req, res) => {
  const { status, tutorId, studentId, startDate, endDate, page = 1, limit = 20 } = req.query;
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
      s.completed_at,
      sub.name as subject,
      student.id as student_id,
      student.full_name as student_name,
      student.email as student_email,
      tutor.id as tutor_id,
      tutor.full_name as tutor_name,
      tutor.email as tutor_email
    FROM sessions s
    LEFT JOIN subjects sub ON s.subject_id = sub.id
    LEFT JOIN users student ON s.student_id = student.id
    LEFT JOIN users tutor ON s.tutor_id = tutor.id
    WHERE 1=1
  `;

  const params = [];
  let paramCount = 0;

  if (status) {
    paramCount++;
    query += ` AND s.status = $${paramCount}`;
    params.push(status);
  }

  if (tutorId) {
    paramCount++;
    query += ` AND s.tutor_id = $${paramCount}`;
    params.push(tutorId);
  }

  if (studentId) {
    paramCount++;
    query += ` AND s.student_id = $${paramCount}`;
    params.push(studentId);
  }

  if (startDate) {
    paramCount++;
    query += ` AND s.scheduled_at >= $${paramCount}`;
    params.push(startDate);
  }

  if (endDate) {
    paramCount++;
    query += ` AND s.scheduled_at <= $${paramCount}`;
    params.push(endDate);
  }

  query += ` ORDER BY s.scheduled_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
  params.push(parseInt(limit), offset);

  const sessionsResult = await pool.query(query, params);

  // Get total count
  let countQuery = 'SELECT COUNT(*) FROM sessions s WHERE 1=1';
  const countParams = [];
  let countParamCount = 0;

  if (status) {
    countParamCount++;
    countQuery += ` AND s.status = $${countParamCount}`;
    countParams.push(status);
  }

  if (tutorId) {
    countParamCount++;
    countQuery += ` AND s.tutor_id = $${countParamCount}`;
    countParams.push(tutorId);
  }

  if (studentId) {
    countParamCount++;
    countQuery += ` AND s.student_id = $${countParamCount}`;
    countParams.push(studentId);
  }

  if (startDate) {
    countParamCount++;
    countQuery += ` AND s.scheduled_at >= $${countParamCount}`;
    countParams.push(startDate);
  }

  if (endDate) {
    countParamCount++;
    countQuery += ` AND s.scheduled_at <= $${countParamCount}`;
    countParams.push(endDate);
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

// Get all payments
export const getAllPayments = asyncHandler(async (req, res) => {
  const { status, startDate, endDate, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  let query = `
    SELECT
      p.id,
      p.amount,
      p.platform_fee,
      p.status,
      p.payment_method,
      p.transaction_id,
      p.created_at,
      s.id as session_id,
      s.title as session_title,
      student.id as student_id,
      student.full_name as student_name,
      student.email as student_email,
      tutor.id as tutor_id,
      tutor.full_name as tutor_name,
      tutor.email as tutor_email
    FROM payments p
    JOIN sessions s ON p.session_id = s.id
    JOIN users student ON p.student_id = student.id
    JOIN users tutor ON p.tutor_id = tutor.id
    WHERE 1=1
  `;

  const params = [];
  let paramCount = 0;

  if (status) {
    paramCount++;
    query += ` AND p.status = $${paramCount}`;
    params.push(status);
  }

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

  query += ` ORDER BY p.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
  params.push(parseInt(limit), offset);

  const paymentsResult = await pool.query(query, params);

  // Get total count and sum
  let summaryQuery = `
    SELECT
      COUNT(*) as total_count,
      COALESCE(SUM(amount), 0) as total_amount,
      COALESCE(SUM(platform_fee), 0) as total_fees
    FROM payments p
    WHERE 1=1
  `;

  const summaryParams = [];
  let summaryParamCount = 0;

  if (status) {
    summaryParamCount++;
    summaryQuery += ` AND p.status = $${summaryParamCount}`;
    summaryParams.push(status);
  }

  if (startDate) {
    summaryParamCount++;
    summaryQuery += ` AND p.created_at >= $${summaryParamCount}`;
    summaryParams.push(startDate);
  }

  if (endDate) {
    summaryParamCount++;
    summaryQuery += ` AND p.created_at <= $${summaryParamCount}`;
    summaryParams.push(endDate);
  }

  const summaryResult = await pool.query(summaryQuery, summaryParams);
  const totalCount = parseInt(summaryResult.rows[0].total_count);

  res.json({
    success: true,
    data: {
      payments: paymentsResult.rows,
      summary: summaryResult.rows[0],
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit: parseInt(limit)
      }
    }
  });
});

// Get disputes
export const getDisputes = asyncHandler(async (req, res) => {
  const { status = 'open', page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  const disputesResult = await pool.query(
    `SELECT
      d.id,
      d.title,
      d.description,
      d.status,
      d.resolution,
      d.created_at,
      d.resolved_at,
      s.id as session_id,
      s.title as session_title,
      reporter.id as reporter_id,
      reporter.full_name as reporter_name,
      reporter.email as reporter_email,
      reported.id as reported_id,
      reported.full_name as reported_name,
      reported.email as reported_email
    FROM disputes d
    JOIN sessions s ON d.session_id = s.id
    JOIN users reporter ON d.reporter_id = reporter.id
    JOIN users reported ON d.reported_id = reported.id
    WHERE d.status = $1
    ORDER BY d.created_at DESC
    LIMIT $2 OFFSET $3`,
    [status, parseInt(limit), offset]
  );

  const countResult = await pool.query(
    'SELECT COUNT(*) FROM disputes WHERE status = $1',
    [status]
  );

  const totalCount = parseInt(countResult.rows[0].count);

  res.json({
    success: true,
    data: {
      disputes: disputesResult.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit: parseInt(limit)
      }
    }
  });
});

// Resolve dispute
export const resolveDispute = asyncHandler(async (req, res) => {
  const { disputeId } = req.params;
  const { resolution, action } = req.body;

  // Update dispute status
  const updateResult = await pool.query(
    `UPDATE disputes
     SET status = 'resolved',
         resolution = $1,
         resolved_at = CURRENT_TIMESTAMP,
         resolved_by = $2
     WHERE id = $3
     RETURNING *`,
    [resolution, req.user.id, disputeId]
  );

  if (updateResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Dispute not found'
    });
  }

  const dispute = updateResult.rows[0];

  // Notify both parties
  await pool.query(
    `INSERT INTO notifications (user_id, type, title, message, metadata)
     VALUES
       ($1, $2, $3, $4, $5),
       ($6, $2, $3, $4, $5)`,
    [
      dispute.reporter_id,
      'dispute_resolved',
      'Dispute Resolved',
      `The dispute has been resolved. Resolution: ${resolution}`,
      JSON.stringify({ disputeId, action }),
      dispute.reported_id
    ]
  );

  // Log activity
  await pool.query(
    `INSERT INTO activity_log (user_id, activity_type, description, metadata)
     VALUES ($1, $2, $3, $4)`,
    [req.user.id, 'dispute_resolved', `Resolved dispute ${disputeId}`, JSON.stringify({ disputeId, resolution, action })]
  );

  res.json({
    success: true,
    message: 'Dispute resolved successfully',
    data: updateResult.rows[0]
  });
});

// Get coupons
export const getCoupons = asyncHandler(async (req, res) => {
  const { isActive, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  let query = `
    SELECT
      id, code, description, discount_type, discount_value,
      max_uses, current_uses, valid_from, valid_until, is_active, created_at
    FROM coupons
    WHERE 1=1
  `;

  const params = [];
  let paramCount = 0;

  if (isActive !== undefined) {
    paramCount++;
    query += ` AND is_active = $${paramCount}`;
    params.push(isActive === 'true');
  }

  query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
  params.push(parseInt(limit), offset);

  const couponsResult = await pool.query(query, params);

  let countQuery = 'SELECT COUNT(*) FROM coupons WHERE 1=1';
  const countParams = [];

  if (isActive !== undefined) {
    countQuery += ' AND is_active = $1';
    countParams.push(isActive === 'true');
  }

  const countResult = await pool.query(countQuery, countParams);
  const totalCount = parseInt(countResult.rows[0].count);

  res.json({
    success: true,
    data: {
      coupons: couponsResult.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit: parseInt(limit)
      }
    }
  });
});

// Create coupon
export const createCoupon = asyncHandler(async (req, res) => {
  const {
    code,
    description,
    discountType,
    discountValue,
    maxUses,
    validFrom,
    validUntil
  } = req.body;

  // Check if coupon code already exists
  const existingCoupon = await pool.query(
    'SELECT id FROM coupons WHERE code = $1',
    [code]
  );

  if (existingCoupon.rows.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Coupon code already exists'
    });
  }

  const couponResult = await pool.query(
    `INSERT INTO coupons (
      code, description, discount_type, discount_value,
      max_uses, valid_from, valid_until, is_active
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, true)
    RETURNING *`,
    [code, description, discountType, discountValue, maxUses || null, validFrom || null, validUntil || null]
  );

  // Log activity
  await pool.query(
    `INSERT INTO activity_log (user_id, activity_type, description, metadata)
     VALUES ($1, $2, $3, $4)`,
    [req.user.id, 'coupon_created', `Created coupon: ${code}`, JSON.stringify({ couponId: couponResult.rows[0].id })]
  );

  res.status(201).json({
    success: true,
    message: 'Coupon created successfully',
    data: couponResult.rows[0]
  });
});

// Update coupon
export const updateCoupon = asyncHandler(async (req, res) => {
  const { couponId } = req.params;
  const {
    description,
    discountType,
    discountValue,
    maxUses,
    validFrom,
    validUntil,
    isActive
  } = req.body;

  const updateResult = await pool.query(
    `UPDATE coupons
     SET description = COALESCE($1, description),
         discount_type = COALESCE($2, discount_type),
         discount_value = COALESCE($3, discount_value),
         max_uses = COALESCE($4, max_uses),
         valid_from = COALESCE($5, valid_from),
         valid_until = COALESCE($6, valid_until),
         is_active = COALESCE($7, is_active)
     WHERE id = $8
     RETURNING *`,
    [description, discountType, discountValue, maxUses, validFrom, validUntil, isActive, couponId]
  );

  if (updateResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Coupon not found'
    });
  }

  // Log activity
  await pool.query(
    `INSERT INTO activity_log (user_id, activity_type, description, metadata)
     VALUES ($1, $2, $3, $4)`,
    [req.user.id, 'coupon_updated', `Updated coupon ${couponId}`, JSON.stringify({ couponId })]
  );

  res.json({
    success: true,
    message: 'Coupon updated successfully',
    data: updateResult.rows[0]
  });
});

// Get analytics
export const getAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  // User statistics
  const userStats = await pool.query(
    `SELECT
       COUNT(*) as total_users,
       COUNT(*) FILTER (WHERE role = 'student') as total_students,
       COUNT(*) FILTER (WHERE role = 'tutor') as total_tutors,
       COUNT(*) FILTER (WHERE role = 'both') as total_both,
       COUNT(*) FILTER (WHERE is_verified = true) as verified_users,
       COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_users_30d
     FROM users
     WHERE is_active = true`
  );

  // Session statistics
  let sessionQuery = `
    SELECT
      COUNT(*) as total_sessions,
      COUNT(*) FILTER (WHERE status = 'completed') as completed_sessions,
      COUNT(*) FILTER (WHERE status = 'scheduled') as scheduled_sessions,
      COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_sessions,
      COALESCE(AVG(duration) FILTER (WHERE status = 'completed'), 0) as avg_duration
    FROM sessions
    WHERE 1=1
  `;

  const sessionParams = [];
  let sessionParamCount = 0;

  if (startDate) {
    sessionParamCount++;
    sessionQuery += ` AND created_at >= $${sessionParamCount}`;
    sessionParams.push(startDate);
  }

  if (endDate) {
    sessionParamCount++;
    sessionQuery += ` AND created_at <= $${sessionParamCount}`;
    sessionParams.push(endDate);
  }

  const sessionStats = await pool.query(sessionQuery, sessionParams);

  // Revenue statistics
  let revenueQuery = `
    SELECT
      COALESCE(SUM(amount), 0) as total_revenue,
      COALESCE(SUM(platform_fee), 0) as total_platform_fees,
      COALESCE(AVG(amount), 0) as avg_transaction_amount,
      COUNT(*) as total_transactions
    FROM payments
    WHERE status = 'completed'
  `;

  const revenueParams = [];
  let revenueParamCount = 0;

  if (startDate) {
    revenueParamCount++;
    revenueQuery += ` AND created_at >= $${revenueParamCount}`;
    revenueParams.push(startDate);
  }

  if (endDate) {
    revenueParamCount++;
    revenueQuery += ` AND created_at <= $${revenueParamCount}`;
    revenueParams.push(endDate);
  }

  const revenueStats = await pool.query(revenueQuery, revenueParams);

  // Top subjects
  const topSubjects = await pool.query(
    `SELECT
       s.name,
       s.category,
       COUNT(DISTINCT us.user_id) as user_count,
       COUNT(DISTINCT ses.id) as session_count
     FROM subjects s
     LEFT JOIN user_subjects us ON s.id = us.subject_id
     LEFT JOIN sessions ses ON s.id = ses.subject_id
     GROUP BY s.id, s.name, s.category
     ORDER BY session_count DESC, user_count DESC
     LIMIT 10`
  );

  // Top tutors
  const topTutors = await pool.query(
    `SELECT
       u.id,
       u.full_name,
       u.avatar_url,
       tp.rating,
       tp.total_reviews,
       tp.total_sessions,
       COALESCE(SUM(p.amount - p.platform_fee), 0) as total_earnings
     FROM users u
     JOIN tutor_profiles tp ON u.id = tp.user_id
     LEFT JOIN sessions s ON u.id = s.tutor_id AND s.status = 'completed'
     LEFT JOIN payments p ON s.id = p.session_id AND p.status = 'completed'
     WHERE tp.status = 'approved'
     GROUP BY u.id, u.full_name, u.avatar_url, tp.rating, tp.total_reviews, tp.total_sessions
     ORDER BY tp.rating DESC, tp.total_reviews DESC
     LIMIT 10`
  );

  // Monthly growth
  const monthlyGrowth = await pool.query(
    `SELECT
       TO_CHAR(created_at, 'YYYY-MM') as month,
       COUNT(*) as new_users
     FROM users
     WHERE created_at >= CURRENT_DATE - INTERVAL '12 months'
     GROUP BY TO_CHAR(created_at, 'YYYY-MM')
     ORDER BY month DESC`
  );

  res.json({
    success: true,
    data: {
      users: userStats.rows[0],
      sessions: sessionStats.rows[0],
      revenue: revenueStats.rows[0],
      topSubjects: topSubjects.rows,
      topTutors: topTutors.rows,
      monthlyGrowth: monthlyGrowth.rows
    }
  });
});

// Export data (CSV export)
export const exportData = asyncHandler(async (req, res) => {
  const { type, startDate, endDate } = req.query;

  let query = '';
  let params = [];
  let paramCount = 0;

  switch (type) {
    case 'users':
      query = `
        SELECT
          u.id, u.email, u.full_name, u.role, u.phone,
          u.is_verified, u.is_active, u.created_at
        FROM users u
        WHERE 1=1
      `;
      break;

    case 'sessions':
      query = `
        SELECT
          s.id, s.title, s.scheduled_at, s.duration, s.status, s.price,
          student.full_name as student_name, student.email as student_email,
          tutor.full_name as tutor_name, tutor.email as tutor_email,
          sub.name as subject, s.created_at
        FROM sessions s
        LEFT JOIN users student ON s.student_id = student.id
        LEFT JOIN users tutor ON s.tutor_id = tutor.id
        LEFT JOIN subjects sub ON s.subject_id = sub.id
        WHERE 1=1
      `;
      break;

    case 'payments':
      query = `
        SELECT
          p.id, p.amount, p.platform_fee, p.status, p.payment_method,
          p.transaction_id, p.created_at,
          student.full_name as student_name, student.email as student_email,
          tutor.full_name as tutor_name, tutor.email as tutor_email
        FROM payments p
        JOIN users student ON p.student_id = student.id
        JOIN users tutor ON p.tutor_id = tutor.id
        WHERE 1=1
      `;
      break;

    default:
      return res.status(400).json({
        success: false,
        message: 'Invalid export type. Must be one of: users, sessions, payments'
      });
  }

  if (startDate) {
    paramCount++;
    query += ` AND created_at >= $${paramCount}`;
    params.push(startDate);
  }

  if (endDate) {
    paramCount++;
    query += ` AND created_at <= $${paramCount}`;
    params.push(endDate);
  }

  query += ` ORDER BY created_at DESC`;

  const result = await pool.query(query, params);

  // Convert to CSV
  if (result.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'No data found for export'
    });
  }

  const headers = Object.keys(result.rows[0]);
  const csvRows = [headers.join(',')];

  for (const row of result.rows) {
    const values = headers.map(header => {
      const value = row[header];
      return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
    });
    csvRows.push(values.join(','));
  }

  const csvContent = csvRows.join('\n');

  // Log activity
  await pool.query(
    `INSERT INTO activity_log (user_id, activity_type, description, metadata)
     VALUES ($1, $2, $3, $4)`,
    [req.user.id, 'data_exported', `Exported ${type} data`, JSON.stringify({ type, recordCount: result.rows.length })]
  );

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=${type}_export_${Date.now()}.csv`);
  res.send(csvContent);
});
