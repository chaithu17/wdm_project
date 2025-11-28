import pool from '../config/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Create session/booking
export const createSession = asyncHandler(async (req, res) => {
  const {
    tutorId,
    title,
    description,
    subjectId,
    scheduledAt,
    duration,
    price,
    meetingLink,
    notes
  } = req.body;
  const studentId = req.user.id;

  // Validate tutor exists and is active
  const tutorResult = await pool.query(
    `SELECT u.id, u.full_name, tp.status, tp.hourly_rate
     FROM users u
     JOIN tutor_profiles tp ON u.id = tp.user_id
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

  if (tutor.status !== 'approved') {
    return res.status(400).json({
      success: false,
      message: 'Tutor is not approved to take sessions'
    });
  }

  // Check for scheduling conflicts
  const conflictResult = await pool.query(
    `SELECT id FROM sessions
     WHERE tutor_id = $1
     AND status IN ('scheduled', 'in_progress')
     AND scheduled_at = $2`,
    [tutorId, scheduledAt]
  );

  if (conflictResult.rows.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Tutor is not available at this time'
    });
  }

  // Create session
  const sessionResult = await pool.query(
    `INSERT INTO sessions (
      student_id, tutor_id, title, description, subject_id,
      scheduled_at, duration, status, price, meeting_link, notes
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *`,
    [
      studentId,
      tutorId,
      title,
      description,
      subjectId || null,
      scheduledAt,
      duration,
      'scheduled',
      price || tutor.hourly_rate * (duration / 60),
      meetingLink || null,
      notes || null
    ]
  );

  const session = sessionResult.rows[0];

  // Create notification for tutor
  await pool.query(
    `INSERT INTO notifications (user_id, type, title, message, metadata)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      tutorId,
      'session_booked',
      'New Session Booked',
      `A new session has been booked: ${title}`,
      JSON.stringify({ sessionId: session.id, studentId })
    ]
  );

  // Log activity
  await pool.query(
    `INSERT INTO activity_log (user_id, activity_type, description, metadata)
     VALUES ($1, $2, $3)`,
    [studentId, 'session_created', `Created session: ${title}`, JSON.stringify({ sessionId: session.id })]
  );

  res.status(201).json({
    success: true,
    message: 'Session created successfully',
    data: session
  });
});

// Get all sessions for user (as student or tutor)
export const getAllSessions = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const {
    role, // 'student' or 'tutor'
    status,
    startDate,
    endDate,
    page = 1,
    limit = 10
  } = req.query;

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
      s.meeting_link,
      s.created_at,
      s.updated_at,
      sub.name as subject,
      CASE
        WHEN s.student_id = $1 THEN json_build_object(
          'id', tutor.id,
          'name', tutor.full_name,
          'avatar', tutor.avatar_url,
          'role', 'tutor'
        )
        ELSE json_build_object(
          'id', student.id,
          'name', student.full_name,
          'avatar', student.avatar_url,
          'role', 'student'
        )
      END as other_user
    FROM sessions s
    LEFT JOIN subjects sub ON s.subject_id = sub.id
    LEFT JOIN users student ON s.student_id = student.id
    LEFT JOIN users tutor ON s.tutor_id = tutor.id
    WHERE (s.student_id = $1 OR s.tutor_id = $1)
  `;

  const params = [userId];
  let paramCount = 1;

  // Role filter
  if (role === 'student') {
    query += ` AND s.student_id = $1`;
  } else if (role === 'tutor') {
    query += ` AND s.tutor_id = $1`;
  }

  // Status filter
  if (status) {
    paramCount++;
    query += ` AND s.status = $${paramCount}`;
    params.push(status);
  }

  // Date range filter
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
  let countQuery = `
    SELECT COUNT(*)
    FROM sessions s
    WHERE (s.student_id = $1 OR s.tutor_id = $1)
  `;

  const countParams = [userId];
  let countParamCount = 1;

  if (role === 'student') {
    countQuery += ` AND s.student_id = $1`;
  } else if (role === 'tutor') {
    countQuery += ` AND s.tutor_id = $1`;
  }

  if (status) {
    countParamCount++;
    countQuery += ` AND s.status = $${countParamCount}`;
    countParams.push(status);
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

// Get session by ID
export const getSessionById = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user.id;

  const sessionResult = await pool.query(
    `SELECT
      s.id,
      s.title,
      s.description,
      s.scheduled_at,
      s.duration,
      s.status,
      s.price,
      s.meeting_link,
      s.notes,
      s.created_at,
      s.updated_at,
      sub.id as subject_id,
      sub.name as subject,
      json_build_object(
        'id', student.id,
        'name', student.full_name,
        'email', student.email,
        'avatar', student.avatar_url
      ) as student,
      json_build_object(
        'id', tutor.id,
        'name', tutor.full_name,
        'email', tutor.email,
        'avatar', tutor.avatar_url
      ) as tutor
    FROM sessions s
    LEFT JOIN subjects sub ON s.subject_id = sub.id
    LEFT JOIN users student ON s.student_id = student.id
    LEFT JOIN users tutor ON s.tutor_id = tutor.id
    WHERE s.id = $1`,
    [sessionId]
  );

  if (sessionResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Session not found'
    });
  }

  const session = sessionResult.rows[0];

  // Check if user is part of the session
  if (session.student.id !== userId && session.tutor.id !== userId && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'You do not have access to this session'
    });
  }

  res.json({
    success: true,
    data: session
  });
});

// Update session
export const updateSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { scheduledAt, duration, meetingLink, notes, status } = req.body;
  const userId = req.user.id;

  // Get session details
  const sessionResult = await pool.query(
    'SELECT student_id, tutor_id, status FROM sessions WHERE id = $1',
    [sessionId]
  );

  if (sessionResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Session not found'
    });
  }

  const session = sessionResult.rows[0];

  // Check if user is part of the session
  if (session.student_id !== userId && session.tutor_id !== userId && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'You can only update sessions you are part of'
    });
  }

  // Only allow updates if session is scheduled
  if (session.status !== 'scheduled' && status !== 'in_progress' && status !== 'completed') {
    return res.status(400).json({
      success: false,
      message: 'Cannot update session in current status'
    });
  }

  // Update session
  const updateResult = await pool.query(
    `UPDATE sessions
     SET scheduled_at = COALESCE($1, scheduled_at),
         duration = COALESCE($2, duration),
         meeting_link = COALESCE($3, meeting_link),
         notes = COALESCE($4, notes),
         status = COALESCE($5, status),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $6
     RETURNING *`,
    [scheduledAt, duration, meetingLink, notes, status, sessionId]
  );

  // Notify other user about update
  const otherUserId = session.student_id === userId ? session.tutor_id : session.student_id;
  await pool.query(
    `INSERT INTO notifications (user_id, type, title, message, metadata)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      otherUserId,
      'session_updated',
      'Session Updated',
      'A session has been updated',
      JSON.stringify({ sessionId })
    ]
  );

  // Log activity
  await pool.query(
    `INSERT INTO activity_log (user_id, activity_type, description, metadata)
     VALUES ($1, $2, $3, $4)`,
    [userId, 'session_updated', 'Updated session', JSON.stringify({ sessionId })]
  );

  res.json({
    success: true,
    message: 'Session updated successfully',
    data: updateResult.rows[0]
  });
});

// Cancel session
export const cancelSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { reason } = req.body;
  const userId = req.user.id;

  // Get session details
  const sessionResult = await pool.query(
    'SELECT student_id, tutor_id, status, title FROM sessions WHERE id = $1',
    [sessionId]
  );

  if (sessionResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Session not found'
    });
  }

  const session = sessionResult.rows[0];

  // Check if user is part of the session
  if (session.student_id !== userId && session.tutor_id !== userId && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'You can only cancel sessions you are part of'
    });
  }

  // Only allow cancellation if session is scheduled
  if (session.status !== 'scheduled') {
    return res.status(400).json({
      success: false,
      message: 'Can only cancel scheduled sessions'
    });
  }

  // Update session status to cancelled
  await pool.query(
    `UPDATE sessions
     SET status = 'cancelled',
         notes = COALESCE(notes || ' | ', '') || 'Cancelled: ' || $1,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $2`,
    [reason || 'No reason provided', sessionId]
  );

  // Notify other user about cancellation
  const otherUserId = session.student_id === userId ? session.tutor_id : session.student_id;
  await pool.query(
    `INSERT INTO notifications (user_id, type, title, message, metadata)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      otherUserId,
      'session_cancelled',
      'Session Cancelled',
      `Session "${session.title}" has been cancelled`,
      JSON.stringify({ sessionId, reason })
    ]
  );

  // Log activity
  await pool.query(
    `INSERT INTO activity_log (user_id, activity_type, description, metadata)
     VALUES ($1, $2, $3, $4)`,
    [userId, 'session_cancelled', `Cancelled session: ${session.title}`, JSON.stringify({ sessionId, reason })]
  );

  res.json({
    success: true,
    message: 'Session cancelled successfully'
  });
});

// Complete session
export const completeSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { notes, rating, review } = req.body;
  const userId = req.user.id;

  // Get session details
  const sessionResult = await pool.query(
    'SELECT student_id, tutor_id, status, title FROM sessions WHERE id = $1',
    [sessionId]
  );

  if (sessionResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Session not found'
    });
  }

  const session = sessionResult.rows[0];

  // Check if user is the tutor (only tutor can mark as complete)
  if (session.tutor_id !== userId && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Only the tutor can mark a session as complete'
    });
  }

  // Only allow completion if session is in progress or scheduled
  if (session.status !== 'in_progress' && session.status !== 'scheduled') {
    return res.status(400).json({
      success: false,
      message: 'Can only complete sessions that are in progress or scheduled'
    });
  }

  // Update session status to completed
  await pool.query(
    `UPDATE sessions
     SET status = 'completed',
         notes = COALESCE($1, notes),
         completed_at = CURRENT_TIMESTAMP,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $2`,
    [notes, sessionId]
  );

  // Update tutor statistics
  await pool.query(
    `UPDATE tutor_profiles
     SET total_sessions = total_sessions + 1
     WHERE user_id = $1`,
    [session.tutor_id]
  );

  // Create payment record
  const sessionPrice = await pool.query('SELECT price FROM sessions WHERE id = $1', [sessionId]);
  const price = sessionPrice.rows[0].price;
  const platformFee = price * 0.15; // 15% platform fee

  await pool.query(
    `INSERT INTO payments (
      session_id, student_id, tutor_id, amount, platform_fee, status
    )
    VALUES ($1, $2, $3, $4, $5, $6)`,
    [sessionId, session.student_id, session.tutor_id, price, platformFee, 'pending']
  );

  // If student provided rating, create review
  if (rating && review) {
    await pool.query(
      `INSERT INTO reviews (
        reviewer_id, reviewee_id, session_id, rating, comment
      )
      VALUES ($1, $2, $3, $4, $5)`,
      [session.student_id, session.tutor_id, sessionId, rating, review]
    );

    // Update tutor rating
    const ratingResult = await pool.query(
      `SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews
       FROM reviews
       WHERE reviewee_id = $1`,
      [session.tutor_id]
    );

    await pool.query(
      `UPDATE tutor_profiles
       SET rating = $1, total_reviews = $2
       WHERE user_id = $3`,
      [ratingResult.rows[0].avg_rating, ratingResult.rows[0].total_reviews, session.tutor_id]
    );
  }

  // Notify student about completion
  await pool.query(
    `INSERT INTO notifications (user_id, type, title, message, metadata)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      session.student_id,
      'session_completed',
      'Session Completed',
      `Session "${session.title}" has been completed`,
      JSON.stringify({ sessionId })
    ]
  );

  // Log activity
  await pool.query(
    `INSERT INTO activity_log (user_id, activity_type, description, metadata)
     VALUES ($1, $2, $3, $4)`,
    [userId, 'session_completed', `Completed session: ${session.title}`, JSON.stringify({ sessionId })]
  );

  res.json({
    success: true,
    message: 'Session completed successfully'
  });
});
