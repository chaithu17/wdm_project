import pool from '../config/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Send message
export const sendMessage = asyncHandler(async (req, res) => {
  const { receiverId, content, attachmentUrl, attachmentType } = req.body;
  const senderId = req.user.id;

  // Validate that sender is not sending to themselves
  if (senderId === receiverId) {
    return res.status(400).json({
      success: false,
      message: 'Cannot send message to yourself'
    });
  }

  // Check if receiver exists and is active
  const receiverResult = await pool.query(
    'SELECT id, full_name FROM users WHERE id = $1 AND is_active = true',
    [receiverId]
  );

  if (receiverResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Receiver not found'
    });
  }

  // Create message
  const messageResult = await pool.query(
    `INSERT INTO messages (sender_id, receiver_id, content, attachment_url, attachment_type)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, sender_id, receiver_id, content, attachment_url, attachment_type, is_read, created_at`,
    [senderId, receiverId, content, attachmentUrl || null, attachmentType || null]
  );

  const message = messageResult.rows[0];

  // Create notification for receiver
  await pool.query(
    `INSERT INTO notifications (user_id, type, title, message, metadata)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      receiverId,
      'new_message',
      'New Message',
      `You have a new message from ${req.user.fullName || 'a user'}`,
      JSON.stringify({ messageId: message.id, senderId })
    ]
  );

  // Get sender info for response
  const senderInfo = await pool.query(
    'SELECT id, full_name, avatar_url FROM users WHERE id = $1',
    [senderId]
  );

  res.status(201).json({
    success: true,
    message: 'Message sent successfully',
    data: {
      ...message,
      sender: senderInfo.rows[0],
      receiver: receiverResult.rows[0]
    }
  });
});

// Get conversation between two users
export const getConversation = asyncHandler(async (req, res) => {
  const { otherUserId } = req.params;
  const userId = req.user.id;
  const { page = 1, limit = 50 } = req.query;
  const offset = (page - 1) * limit;

  // Check if other user exists
  const otherUserResult = await pool.query(
    'SELECT id, full_name, avatar_url FROM users WHERE id = $1 AND is_active = true',
    [otherUserId]
  );

  if (otherUserResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Get messages between the two users
  const messagesResult = await pool.query(
    `SELECT
      m.id,
      m.sender_id,
      m.receiver_id,
      m.content,
      m.attachment_url,
      m.attachment_type,
      m.is_read,
      m.created_at,
      sender.full_name as sender_name,
      sender.avatar_url as sender_avatar
    FROM messages m
    JOIN users sender ON m.sender_id = sender.id
    WHERE (m.sender_id = $1 AND m.receiver_id = $2)
       OR (m.sender_id = $2 AND m.receiver_id = $1)
    ORDER BY m.created_at DESC
    LIMIT $3 OFFSET $4`,
    [userId, otherUserId, parseInt(limit), offset]
  );

  // Get total count
  const countResult = await pool.query(
    `SELECT COUNT(*)
     FROM messages
     WHERE (sender_id = $1 AND receiver_id = $2)
        OR (sender_id = $2 AND receiver_id = $1)`,
    [userId, otherUserId]
  );

  const totalCount = parseInt(countResult.rows[0].count);

  // Mark messages from other user as read
  await pool.query(
    `UPDATE messages
     SET is_read = true
     WHERE sender_id = $1 AND receiver_id = $2 AND is_read = false`,
    [otherUserId, userId]
  );

  res.json({
    success: true,
    data: {
      otherUser: otherUserResult.rows[0],
      messages: messagesResult.rows.reverse(), // Reverse to show oldest first
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit: parseInt(limit)
      }
    }
  });
});

// Get all conversations for user
export const getConversations = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  // Get all unique conversations with last message
  const conversationsResult = await pool.query(
    `WITH ranked_messages AS (
      SELECT
        m.id,
        m.sender_id,
        m.receiver_id,
        m.content,
        m.attachment_url,
        m.attachment_type,
        m.is_read,
        m.created_at,
        CASE
          WHEN m.sender_id = $1 THEN m.receiver_id
          ELSE m.sender_id
        END as other_user_id,
        ROW_NUMBER() OVER (
          PARTITION BY CASE
            WHEN m.sender_id = $1 THEN m.receiver_id
            ELSE m.sender_id
          END
          ORDER BY m.created_at DESC
        ) as rn
      FROM messages m
      WHERE m.sender_id = $1 OR m.receiver_id = $1
    ),
    unread_counts AS (
      SELECT
        sender_id as other_user_id,
        COUNT(*) as unread_count
      FROM messages
      WHERE receiver_id = $1 AND is_read = false
      GROUP BY sender_id
    )
    SELECT
      rm.id as last_message_id,
      rm.content as last_message,
      rm.attachment_url,
      rm.attachment_type,
      rm.created_at as last_message_at,
      rm.is_read,
      rm.sender_id = $1 as i_sent_last,
      u.id as other_user_id,
      u.full_name as other_user_name,
      u.avatar_url as other_user_avatar,
      u.role as other_user_role,
      COALESCE(uc.unread_count, 0) as unread_count
    FROM ranked_messages rm
    JOIN users u ON rm.other_user_id = u.id
    LEFT JOIN unread_counts uc ON u.id = uc.other_user_id
    WHERE rm.rn = 1
    ORDER BY rm.created_at DESC
    LIMIT $2 OFFSET $3`,
    [userId, parseInt(limit), offset]
  );

  // Get total count of conversations
  const countResult = await pool.query(
    `SELECT COUNT(DISTINCT
      CASE
        WHEN sender_id = $1 THEN receiver_id
        ELSE sender_id
      END
    ) FROM messages
    WHERE sender_id = $1 OR receiver_id = $1`,
    [userId]
  );

  const totalCount = parseInt(countResult.rows[0].count);

  // Get total unread messages count
  const unreadResult = await pool.query(
    'SELECT COUNT(*) FROM messages WHERE receiver_id = $1 AND is_read = false',
    [userId]
  );

  const totalUnread = parseInt(unreadResult.rows[0].count);

  res.json({
    success: true,
    data: {
      conversations: conversationsResult.rows,
      totalUnreadMessages: totalUnread,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit: parseInt(limit)
      }
    }
  });
});

// Mark messages as read
export const markAsRead = asyncHandler(async (req, res) => {
  const { otherUserId } = req.params;
  const userId = req.user.id;

  // Mark all messages from other user as read
  const updateResult = await pool.query(
    `UPDATE messages
     SET is_read = true
     WHERE sender_id = $1 AND receiver_id = $2 AND is_read = false
     RETURNING id`,
    [otherUserId, userId]
  );

  const markedCount = updateResult.rows.length;

  res.json({
    success: true,
    message: `${markedCount} message(s) marked as read`,
    data: {
      markedCount
    }
  });
});

// Delete message
export const deleteMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const userId = req.user.id;

  // Check if message exists and user is the sender
  const messageResult = await pool.query(
    'SELECT sender_id, content FROM messages WHERE id = $1',
    [messageId]
  );

  if (messageResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Message not found'
    });
  }

  const message = messageResult.rows[0];

  if (message.sender_id !== userId && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'You can only delete your own messages'
    });
  }

  // Delete message
  await pool.query('DELETE FROM messages WHERE id = $1', [messageId]);

  res.json({
    success: true,
    message: 'Message deleted successfully'
  });
});

// Get unread message count
export const getUnreadCount = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const countResult = await pool.query(
    'SELECT COUNT(*) FROM messages WHERE receiver_id = $1 AND is_read = false',
    [userId]
  );

  const unreadCount = parseInt(countResult.rows[0].count);

  res.json({
    success: true,
    data: {
      unreadCount
    }
  });
});
