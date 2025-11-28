import pool from '../config/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Create planner item
export const createPlannerItem = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    itemType,
    startTime,
    endTime,
    priority,
    subjectId,
    relatedId,
    reminderTime,
    isRecurring,
    recurrencePattern
  } = req.body;
  const userId = req.user.id;

  // Create planner item
  const plannerResult = await pool.query(
    `INSERT INTO planner_items (
      user_id, title, description, item_type, start_time, end_time,
      priority, subject_id, related_id, reminder_time,
      is_recurring, recurrence_pattern, status
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING *`,
    [
      userId,
      title,
      description,
      itemType,
      startTime,
      endTime || null,
      priority || 'medium',
      subjectId || null,
      relatedId || null,
      reminderTime || null,
      isRecurring || false,
      recurrencePattern || null,
      'pending'
    ]
  );

  const plannerItem = plannerResult.rows[0];

  // If reminder is set, create notification
  if (reminderTime) {
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, scheduled_for, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        userId,
        'planner_reminder',
        `Reminder: ${title}`,
        description || `Upcoming: ${title}`,
        reminderTime,
        JSON.stringify({ plannerId: plannerItem.id })
      ]
    );
  }

  // Log activity
  await pool.query(
    `INSERT INTO activity_log (user_id, activity_type, description, metadata)
     VALUES ($1, $2, $3, $4)`,
    [userId, 'planner_item_created', `Created planner item: ${title}`, JSON.stringify({ plannerId: plannerItem.id })]
  );

  res.status(201).json({
    success: true,
    message: 'Planner item created successfully',
    data: plannerItem
  });
});

// Get planner items for user
export const getPlannerItems = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const {
    startDate,
    endDate,
    itemType,
    priority,
    status,
    subjectId,
    page = 1,
    limit = 50
  } = req.query;

  const offset = (page - 1) * limit;

  let query = `
    SELECT
      pi.id,
      pi.title,
      pi.description,
      pi.item_type,
      pi.start_time,
      pi.end_time,
      pi.priority,
      pi.status,
      pi.reminder_time,
      pi.is_recurring,
      pi.recurrence_pattern,
      pi.created_at,
      pi.updated_at,
      s.name as subject_name,
      s.category as subject_category
    FROM planner_items pi
    LEFT JOIN subjects s ON pi.subject_id = s.id
    WHERE pi.user_id = $1
  `;

  const params = [userId];
  let paramCount = 1;

  // Date range filter
  if (startDate) {
    paramCount++;
    query += ` AND pi.start_time >= $${paramCount}`;
    params.push(startDate);
  }

  if (endDate) {
    paramCount++;
    query += ` AND pi.start_time <= $${paramCount}`;
    params.push(endDate);
  }

  // Item type filter
  if (itemType) {
    paramCount++;
    query += ` AND pi.item_type = $${paramCount}`;
    params.push(itemType);
  }

  // Priority filter
  if (priority) {
    paramCount++;
    query += ` AND pi.priority = $${paramCount}`;
    params.push(priority);
  }

  // Status filter
  if (status) {
    paramCount++;
    query += ` AND pi.status = $${paramCount}`;
    params.push(status);
  }

  // Subject filter
  if (subjectId) {
    paramCount++;
    query += ` AND pi.subject_id = $${paramCount}`;
    params.push(subjectId);
  }

  query += ` ORDER BY pi.start_time ASC, pi.priority DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
  params.push(parseInt(limit), offset);

  const plannerResult = await pool.query(query, params);

  // Get total count
  let countQuery = `
    SELECT COUNT(*)
    FROM planner_items pi
    WHERE pi.user_id = $1
  `;

  const countParams = [userId];
  let countParamCount = 1;

  if (startDate) {
    countParamCount++;
    countQuery += ` AND pi.start_time >= $${countParamCount}`;
    countParams.push(startDate);
  }

  if (endDate) {
    countParamCount++;
    countQuery += ` AND pi.start_time <= $${countParamCount}`;
    countParams.push(endDate);
  }

  if (itemType) {
    countParamCount++;
    countQuery += ` AND pi.item_type = $${countParamCount}`;
    countParams.push(itemType);
  }

  if (priority) {
    countParamCount++;
    countQuery += ` AND pi.priority = $${countParamCount}`;
    countParams.push(priority);
  }

  if (status) {
    countParamCount++;
    countQuery += ` AND pi.status = $${countParamCount}`;
    countParams.push(status);
  }

  if (subjectId) {
    countParamCount++;
    countQuery += ` AND pi.subject_id = $${countParamCount}`;
    countParams.push(subjectId);
  }

  const countResult = await pool.query(countQuery, countParams);
  const totalCount = parseInt(countResult.rows[0].count);

  // Get statistics
  const statsResult = await pool.query(
    `SELECT
       COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
       COUNT(*) FILTER (WHERE status = 'completed') as completed_count,
       COUNT(*) FILTER (WHERE priority = 'high') as high_priority_count,
       COUNT(*) FILTER (WHERE start_time >= CURRENT_DATE AND start_time < CURRENT_DATE + INTERVAL '1 day') as today_count,
       COUNT(*) FILTER (WHERE start_time >= CURRENT_DATE AND start_time < CURRENT_DATE + INTERVAL '7 days') as week_count
     FROM planner_items
     WHERE user_id = $1`,
    [userId]
  );

  res.json({
    success: true,
    data: {
      items: plannerResult.rows,
      statistics: statsResult.rows[0],
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit: parseInt(limit)
      }
    }
  });
});

// Update planner item
export const updatePlannerItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const {
    title,
    description,
    itemType,
    startTime,
    endTime,
    priority,
    subjectId,
    status,
    reminderTime,
    isRecurring,
    recurrencePattern
  } = req.body;
  const userId = req.user.id;

  // Check if planner item exists and user owns it
  const existingItem = await pool.query(
    'SELECT user_id, title FROM planner_items WHERE id = $1',
    [itemId]
  );

  if (existingItem.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Planner item not found'
    });
  }

  if (existingItem.rows[0].user_id !== userId) {
    return res.status(403).json({
      success: false,
      message: 'You can only update your own planner items'
    });
  }

  // Update planner item
  const updateResult = await pool.query(
    `UPDATE planner_items
     SET title = COALESCE($1, title),
         description = COALESCE($2, description),
         item_type = COALESCE($3, item_type),
         start_time = COALESCE($4, start_time),
         end_time = COALESCE($5, end_time),
         priority = COALESCE($6, priority),
         subject_id = COALESCE($7, subject_id),
         status = COALESCE($8, status),
         reminder_time = COALESCE($9, reminder_time),
         is_recurring = COALESCE($10, is_recurring),
         recurrence_pattern = COALESCE($11, recurrence_pattern),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $12
     RETURNING *`,
    [
      title,
      description,
      itemType,
      startTime,
      endTime,
      priority,
      subjectId,
      status,
      reminderTime,
      isRecurring,
      recurrencePattern,
      itemId
    ]
  );

  // If reminder time was updated, update or create notification
  if (reminderTime) {
    // Delete existing reminder notification if any
    await pool.query(
      `DELETE FROM notifications
       WHERE user_id = $1
       AND type = 'planner_reminder'
       AND metadata->>'plannerId' = $2
       AND is_read = false`,
      [userId, itemId]
    );

    // Create new reminder
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, scheduled_for, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        userId,
        'planner_reminder',
        `Reminder: ${title || existingItem.rows[0].title}`,
        description || `Upcoming: ${title || existingItem.rows[0].title}`,
        reminderTime,
        JSON.stringify({ plannerId: itemId })
      ]
    );
  }

  // Log activity
  await pool.query(
    `INSERT INTO activity_log (user_id, activity_type, description, metadata)
     VALUES ($1, $2, $3, $4)`,
    [userId, 'planner_item_updated', `Updated planner item: ${title || existingItem.rows[0].title}`, JSON.stringify({ plannerId: itemId })]
  );

  res.json({
    success: true,
    message: 'Planner item updated successfully',
    data: updateResult.rows[0]
  });
});

// Delete planner item
export const deletePlannerItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const userId = req.user.id;

  // Check if planner item exists and user owns it
  const existingItem = await pool.query(
    'SELECT user_id, title FROM planner_items WHERE id = $1',
    [itemId]
  );

  if (existingItem.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Planner item not found'
    });
  }

  if (existingItem.rows[0].user_id !== userId && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'You can only delete your own planner items'
    });
  }

  // Delete associated reminder notifications
  await pool.query(
    `DELETE FROM notifications
     WHERE user_id = $1
     AND type = 'planner_reminder'
     AND metadata->>'plannerId' = $2`,
    [userId, itemId]
  );

  // Delete planner item
  await pool.query('DELETE FROM planner_items WHERE id = $1', [itemId]);

  // Log activity
  await pool.query(
    `INSERT INTO activity_log (user_id, activity_type, description, metadata)
     VALUES ($1, $2, $3, $4)`,
    [userId, 'planner_item_deleted', `Deleted planner item: ${existingItem.rows[0].title}`, JSON.stringify({ plannerId: itemId })]
  );

  res.json({
    success: true,
    message: 'Planner item deleted successfully'
  });
});
