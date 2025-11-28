import pool from '../config/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Create exam
export const createExam = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    subjectId,
    duration,
    totalMarks,
    passingMarks,
    questions,
    scheduledAt,
    dueAt
  } = req.body;
  const tutorId = req.user.id;

  // Verify user is a tutor
  const tutorCheck = await pool.query(
    'SELECT user_id FROM tutor_profiles WHERE user_id = $1',
    [tutorId]
  );

  if (tutorCheck.rows.length === 0) {
    return res.status(403).json({
      success: false,
      message: 'Only tutors can create exams'
    });
  }

  // Create exam
  const examResult = await pool.query(
    `INSERT INTO exams (
      tutor_id, title, description, subject_id, duration,
      total_marks, passing_marks, questions, scheduled_at, due_at, status
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *`,
    [
      tutorId,
      title,
      description,
      subjectId || null,
      duration,
      totalMarks,
      passingMarks,
      JSON.stringify(questions),
      scheduledAt || null,
      dueAt || null,
      'draft'
    ]
  );

  const exam = examResult.rows[0];

  // Log activity
  await pool.query(
    `INSERT INTO activity_log (user_id, activity_type, description, metadata)
     VALUES ($1, $2, $3, $4)`,
    [tutorId, 'exam_created', `Created exam: ${title}`, JSON.stringify({ examId: exam.id })]
  );

  res.status(201).json({
    success: true,
    message: 'Exam created successfully',
    data: exam
  });
});

// Get all exams for tutor
export const getAllExams = asyncHandler(async (req, res) => {
  const tutorId = req.user.id;
  const { status, subject, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  let query = `
    SELECT
      e.id,
      e.title,
      e.description,
      e.duration,
      e.total_marks,
      e.passing_marks,
      e.scheduled_at,
      e.due_at,
      e.status,
      e.created_at,
      s.name as subject,
      (SELECT COUNT(*) FROM exam_submissions WHERE exam_id = e.id) as total_submissions,
      (SELECT COUNT(*) FROM exam_submissions WHERE exam_id = e.id AND status = 'graded') as graded_submissions
    FROM exams e
    LEFT JOIN subjects s ON e.subject_id = s.id
    WHERE e.tutor_id = $1
  `;

  const params = [tutorId];
  let paramCount = 1;

  if (status) {
    paramCount++;
    query += ` AND e.status = $${paramCount}`;
    params.push(status);
  }

  if (subject) {
    paramCount++;
    query += ` AND s.name = $${paramCount}`;
    params.push(subject);
  }

  query += ` ORDER BY e.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
  params.push(parseInt(limit), offset);

  const examsResult = await pool.query(query, params);

  // Get total count
  let countQuery = `
    SELECT COUNT(*)
    FROM exams e
    LEFT JOIN subjects s ON e.subject_id = s.id
    WHERE e.tutor_id = $1
  `;

  const countParams = [tutorId];
  let countParamCount = 1;

  if (status) {
    countParamCount++;
    countQuery += ` AND e.status = $${countParamCount}`;
    countParams.push(status);
  }

  if (subject) {
    countParamCount++;
    countQuery += ` AND s.name = $${countParamCount}`;
    countParams.push(subject);
  }

  const countResult = await pool.query(countQuery, countParams);
  const totalCount = parseInt(countResult.rows[0].count);

  res.json({
    success: true,
    data: {
      exams: examsResult.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit: parseInt(limit)
      }
    }
  });
});

// Get exam by ID
export const getExamById = asyncHandler(async (req, res) => {
  const { examId } = req.params;
  const userId = req.user.id;

  const examResult = await pool.query(
    `SELECT
      e.id,
      e.tutor_id,
      e.title,
      e.description,
      e.duration,
      e.total_marks,
      e.passing_marks,
      e.questions,
      e.scheduled_at,
      e.due_at,
      e.status,
      e.created_at,
      s.id as subject_id,
      s.name as subject,
      u.full_name as tutor_name
    FROM exams e
    LEFT JOIN subjects s ON e.subject_id = s.id
    LEFT JOIN users u ON e.tutor_id = u.id
    WHERE e.id = $1`,
    [examId]
  );

  if (examResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Exam not found'
    });
  }

  const exam = examResult.rows[0];

  // If student is viewing, check if exam is published
  if (exam.tutor_id !== userId && exam.status === 'draft') {
    return res.status(403).json({
      success: false,
      message: 'This exam is not yet published'
    });
  }

  // If student is viewing, hide correct answers
  if (exam.tutor_id !== userId && req.user.role !== 'admin') {
    const questions = JSON.parse(exam.questions);
    exam.questions = JSON.stringify(
      questions.map(q => {
        const { correctAnswer, ...questionWithoutAnswer } = q;
        return questionWithoutAnswer;
      })
    );

    // Check if student has already submitted
    const submissionResult = await pool.query(
      'SELECT id, status, score FROM exam_submissions WHERE exam_id = $1 AND student_id = $2',
      [examId, userId]
    );

    if (submissionResult.rows.length > 0) {
      exam.submission = submissionResult.rows[0];
    }
  }

  res.json({
    success: true,
    data: exam
  });
});

// Update exam
export const updateExam = asyncHandler(async (req, res) => {
  const { examId } = req.params;
  const {
    title,
    description,
    subjectId,
    duration,
    totalMarks,
    passingMarks,
    questions,
    scheduledAt,
    dueAt
  } = req.body;
  const userId = req.user.id;

  // Check if exam exists and user is the creator
  const examResult = await pool.query(
    'SELECT tutor_id, status FROM exams WHERE id = $1',
    [examId]
  );

  if (examResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Exam not found'
    });
  }

  const exam = examResult.rows[0];

  if (exam.tutor_id !== userId && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'You can only update your own exams'
    });
  }

  // Update exam
  const updateResult = await pool.query(
    `UPDATE exams
     SET title = COALESCE($1, title),
         description = COALESCE($2, description),
         subject_id = COALESCE($3, subject_id),
         duration = COALESCE($4, duration),
         total_marks = COALESCE($5, total_marks),
         passing_marks = COALESCE($6, passing_marks),
         questions = COALESCE($7, questions),
         scheduled_at = COALESCE($8, scheduled_at),
         due_at = COALESCE($9, due_at),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $10
     RETURNING *`,
    [
      title,
      description,
      subjectId,
      duration,
      totalMarks,
      passingMarks,
      questions ? JSON.stringify(questions) : null,
      scheduledAt,
      dueAt,
      examId
    ]
  );

  // Log activity
  await pool.query(
    `INSERT INTO activity_log (user_id, activity_type, description, metadata)
     VALUES ($1, $2, $3, $4)`,
    [userId, 'exam_updated', `Updated exam: ${title}`, JSON.stringify({ examId })]
  );

  res.json({
    success: true,
    message: 'Exam updated successfully',
    data: updateResult.rows[0]
  });
});

// Delete exam
export const deleteExam = asyncHandler(async (req, res) => {
  const { examId } = req.params;
  const userId = req.user.id;

  // Check if exam exists and user is the creator
  const examResult = await pool.query(
    'SELECT tutor_id, title FROM exams WHERE id = $1',
    [examId]
  );

  if (examResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Exam not found'
    });
  }

  const exam = examResult.rows[0];

  if (exam.tutor_id !== userId && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'You can only delete your own exams'
    });
  }

  // Check if exam has submissions
  const submissionsResult = await pool.query(
    'SELECT COUNT(*) FROM exam_submissions WHERE exam_id = $1',
    [examId]
  );

  if (parseInt(submissionsResult.rows[0].count) > 0) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete exam with existing submissions'
    });
  }

  // Delete exam
  await pool.query('DELETE FROM exams WHERE id = $1', [examId]);

  // Log activity
  await pool.query(
    `INSERT INTO activity_log (user_id, activity_type, description, metadata)
     VALUES ($1, $2, $3, $4)`,
    [userId, 'exam_deleted', `Deleted exam: ${exam.title}`, JSON.stringify({ examId })]
  );

  res.json({
    success: true,
    message: 'Exam deleted successfully'
  });
});

// Publish exam
export const publishExam = asyncHandler(async (req, res) => {
  const { examId } = req.params;
  const userId = req.user.id;

  // Check if exam exists and user is the creator
  const examResult = await pool.query(
    'SELECT tutor_id, title, status FROM exams WHERE id = $1',
    [examId]
  );

  if (examResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Exam not found'
    });
  }

  const exam = examResult.rows[0];

  if (exam.tutor_id !== userId && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'You can only publish your own exams'
    });
  }

  if (exam.status === 'published') {
    return res.status(400).json({
      success: false,
      message: 'Exam is already published'
    });
  }

  // Publish exam
  await pool.query(
    `UPDATE exams
     SET status = 'published', updated_at = CURRENT_TIMESTAMP
     WHERE id = $1`,
    [examId]
  );

  // Log activity
  await pool.query(
    `INSERT INTO activity_log (user_id, activity_type, description, metadata)
     VALUES ($1, $2, $3, $4)`,
    [userId, 'exam_published', `Published exam: ${exam.title}`, JSON.stringify({ examId })]
  );

  res.json({
    success: true,
    message: 'Exam published successfully'
  });
});

// Submit exam (student)
export const submitExam = asyncHandler(async (req, res) => {
  const { examId } = req.params;
  const { answers } = req.body;
  const studentId = req.user.id;

  // Check if exam exists and is published
  const examResult = await pool.query(
    `SELECT id, title, questions, total_marks, due_at
     FROM exams
     WHERE id = $1 AND status = 'published'`,
    [examId]
  );

  if (examResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Exam not found or not published'
    });
  }

  const exam = examResult.rows[0];

  // Check if exam is past due
  if (exam.due_at && new Date(exam.due_at) < new Date()) {
    return res.status(400).json({
      success: false,
      message: 'Exam submission deadline has passed'
    });
  }

  // Check if student has already submitted
  const existingSubmission = await pool.query(
    'SELECT id FROM exam_submissions WHERE exam_id = $1 AND student_id = $2',
    [examId, studentId]
  );

  if (existingSubmission.rows.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'You have already submitted this exam'
    });
  }

  // Create submission
  const submissionResult = await pool.query(
    `INSERT INTO exam_submissions (exam_id, student_id, answers, status)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [examId, studentId, JSON.stringify(answers), 'submitted']
  );

  const submission = submissionResult.rows[0];

  // Notify tutor about new submission
  const tutorResult = await pool.query('SELECT tutor_id FROM exams WHERE id = $1', [examId]);
  const tutorId = tutorResult.rows[0].tutor_id;

  await pool.query(
    `INSERT INTO notifications (user_id, type, title, message, metadata)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      tutorId,
      'exam_submitted',
      'New Exam Submission',
      `A student has submitted the exam: ${exam.title}`,
      JSON.stringify({ examId, submissionId: submission.id, studentId })
    ]
  );

  // Log activity
  await pool.query(
    `INSERT INTO activity_log (user_id, activity_type, description, metadata)
     VALUES ($1, $2, $3, $4)`,
    [studentId, 'exam_submitted', `Submitted exam: ${exam.title}`, JSON.stringify({ examId, submissionId: submission.id })]
  );

  res.status(201).json({
    success: true,
    message: 'Exam submitted successfully',
    data: submission
  });
});

// Grade exam (tutor)
export const gradeExam = asyncHandler(async (req, res) => {
  const { submissionId } = req.params;
  const { score, feedback } = req.body;
  const userId = req.user.id;

  // Get submission details
  const submissionResult = await pool.query(
    `SELECT es.id, es.exam_id, es.student_id, es.status,
            e.tutor_id, e.title, e.total_marks, e.passing_marks
     FROM exam_submissions es
     JOIN exams e ON es.exam_id = e.id
     WHERE es.id = $1`,
    [submissionId]
  );

  if (submissionResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Submission not found'
    });
  }

  const submission = submissionResult.rows[0];

  // Check if user is the tutor who created the exam
  if (submission.tutor_id !== userId && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'You can only grade submissions for your own exams'
    });
  }

  // Validate score
  if (score < 0 || score > submission.total_marks) {
    return res.status(400).json({
      success: false,
      message: `Score must be between 0 and ${submission.total_marks}`
    });
  }

  const passed = score >= submission.passing_marks;

  // Update submission with grade
  const updateResult = await pool.query(
    `UPDATE exam_submissions
     SET score = $1,
         feedback = $2,
         status = 'graded',
         graded_at = CURRENT_TIMESTAMP
     WHERE id = $3
     RETURNING *`,
    [score, feedback, submissionId]
  );

  // Notify student about grading
  await pool.query(
    `INSERT INTO notifications (user_id, type, title, message, metadata)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      submission.student_id,
      'exam_graded',
      'Exam Graded',
      `Your exam "${submission.title}" has been graded. Score: ${score}/${submission.total_marks}`,
      JSON.stringify({ examId: submission.exam_id, submissionId, score, passed })
    ]
  );

  // Log activity
  await pool.query(
    `INSERT INTO activity_log (user_id, activity_type, description, metadata)
     VALUES ($1, $2, $3, $4)`,
    [userId, 'exam_graded', `Graded exam submission for: ${submission.title}`, JSON.stringify({ submissionId, score })]
  );

  res.json({
    success: true,
    message: 'Exam graded successfully',
    data: {
      ...updateResult.rows[0],
      passed
    }
  });
});

// Get exam submissions
export const getExamSubmissions = asyncHandler(async (req, res) => {
  const { examId } = req.params;
  const { status, page = 1, limit = 10 } = req.query;
  const userId = req.user.id;
  const offset = (page - 1) * limit;

  // Verify user is the tutor who created the exam
  const examResult = await pool.query(
    'SELECT tutor_id FROM exams WHERE id = $1',
    [examId]
  );

  if (examResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Exam not found'
    });
  }

  if (examResult.rows[0].tutor_id !== userId && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'You can only view submissions for your own exams'
    });
  }

  let query = `
    SELECT
      es.id,
      es.exam_id,
      es.student_id,
      es.score,
      es.feedback,
      es.status,
      es.submitted_at,
      es.graded_at,
      u.full_name as student_name,
      u.email as student_email,
      u.avatar_url as student_avatar
    FROM exam_submissions es
    JOIN users u ON es.student_id = u.id
    WHERE es.exam_id = $1
  `;

  const params = [examId];
  let paramCount = 1;

  if (status) {
    paramCount++;
    query += ` AND es.status = $${paramCount}`;
    params.push(status);
  }

  query += ` ORDER BY es.submitted_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
  params.push(parseInt(limit), offset);

  const submissionsResult = await pool.query(query, params);

  // Get total count
  let countQuery = 'SELECT COUNT(*) FROM exam_submissions WHERE exam_id = $1';
  const countParams = [examId];

  if (status) {
    countQuery += ' AND status = $2';
    countParams.push(status);
  }

  const countResult = await pool.query(countQuery, countParams);
  const totalCount = parseInt(countResult.rows[0].count);

  res.json({
    success: true,
    data: {
      submissions: submissionsResult.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit: parseInt(limit)
      }
    }
  });
});
