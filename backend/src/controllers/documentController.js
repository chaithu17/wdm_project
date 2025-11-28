import pool from '../config/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Upload document
export const uploadDocument = asyncHandler(async (req, res) => {
  const { title, description, fileUrl, fileType, fileSize, subjectId, category, tags } = req.body;
  const userId = req.user.id;

  // Insert document
  const documentResult = await pool.query(
    `INSERT INTO documents (user_id, title, description, file_url, file_type, file_size, subject_id, category, tags)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id, user_id, title, description, file_url, file_type, file_size, subject_id, category, tags, created_at`,
    [userId, title, description, fileUrl, fileType, fileSize, subjectId || null, category || null, tags || null]
  );

  const document = documentResult.rows[0];

  // Log activity
  await pool.query(
    `INSERT INTO activity_log (user_id, activity_type, description, metadata)
     VALUES ($1, $2, $3, $4)`,
    [userId, 'document_uploaded', `Uploaded document: ${title}`, JSON.stringify({ documentId: document.id })]
  );

  res.status(201).json({
    success: true,
    message: 'Document uploaded successfully',
    data: document
  });
});

// Get all documents for user
export const getAllDocuments = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const {
    search,
    category,
    subject,
    fileType,
    sortBy = 'created_at',
    order = 'DESC',
    page = 1,
    limit = 20
  } = req.query;

  const offset = (page - 1) * limit;

  let query = `
    SELECT
      d.id,
      d.title,
      d.description,
      d.file_url,
      d.file_type,
      d.file_size,
      d.category,
      d.tags,
      d.created_at,
      d.updated_at,
      s.name as subject_name,
      EXISTS(SELECT 1 FROM favorite_documents WHERE user_id = $1 AND document_id = d.id) as is_favorite
    FROM documents d
    LEFT JOIN subjects s ON d.subject_id = s.id
    WHERE d.user_id = $1
  `;

  const params = [userId];
  let paramCount = 1;

  // Search filter
  if (search) {
    paramCount++;
    query += ` AND (d.title ILIKE $${paramCount} OR d.description ILIKE $${paramCount})`;
    params.push(`%${search}%`);
  }

  // Category filter
  if (category) {
    paramCount++;
    query += ` AND d.category = $${paramCount}`;
    params.push(category);
  }

  // Subject filter
  if (subject) {
    paramCount++;
    query += ` AND s.name = $${paramCount}`;
    params.push(subject);
  }

  // File type filter
  if (fileType) {
    paramCount++;
    query += ` AND d.file_type = $${paramCount}`;
    params.push(fileType);
  }

  // Sorting
  const allowedSortFields = ['created_at', 'updated_at', 'title', 'file_size'];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
  const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  query += ` ORDER BY d.${sortField} ${sortOrder}`;

  // Pagination
  paramCount++;
  query += ` LIMIT $${paramCount}`;
  params.push(parseInt(limit));

  paramCount++;
  query += ` OFFSET $${paramCount}`;
  params.push(offset);

  const documentsResult = await pool.query(query, params);

  // Get total count
  let countQuery = 'SELECT COUNT(*) FROM documents d LEFT JOIN subjects s ON d.subject_id = s.id WHERE d.user_id = $1';
  const countParams = [userId];
  let countParamCount = 1;

  if (search) {
    countParamCount++;
    countQuery += ` AND (d.title ILIKE $${countParamCount} OR d.description ILIKE $${countParamCount})`;
    countParams.push(`%${search}%`);
  }

  if (category) {
    countParamCount++;
    countQuery += ` AND d.category = $${countParamCount}`;
    countParams.push(category);
  }

  if (subject) {
    countParamCount++;
    countQuery += ` AND s.name = $${countParamCount}`;
    countParams.push(subject);
  }

  if (fileType) {
    countParamCount++;
    countQuery += ` AND d.file_type = $${countParamCount}`;
    countParams.push(fileType);
  }

  const countResult = await pool.query(countQuery, countParams);
  const totalCount = parseInt(countResult.rows[0].count);

  res.json({
    success: true,
    data: {
      documents: documentsResult.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit: parseInt(limit)
      }
    }
  });
});

// Get document by ID
export const getDocumentById = asyncHandler(async (req, res) => {
  const { documentId } = req.params;
  const userId = req.user.id;

  const documentResult = await pool.query(
    `SELECT
      d.id,
      d.user_id,
      d.title,
      d.description,
      d.file_url,
      d.file_type,
      d.file_size,
      d.category,
      d.tags,
      d.created_at,
      d.updated_at,
      s.id as subject_id,
      s.name as subject_name,
      u.full_name as owner_name,
      EXISTS(SELECT 1 FROM favorite_documents WHERE user_id = $1 AND document_id = d.id) as is_favorite,
      EXISTS(SELECT 1 FROM shared_documents WHERE document_id = d.id AND shared_with_user_id = $1) as is_shared_with_me
    FROM documents d
    LEFT JOIN subjects s ON d.subject_id = s.id
    LEFT JOIN users u ON d.user_id = u.id
    WHERE d.id = $2`,
    [userId, documentId]
  );

  if (documentResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Document not found'
    });
  }

  const document = documentResult.rows[0];

  // Check if user has access to document (owner or shared with them)
  if (document.user_id !== userId && !document.is_shared_with_me) {
    return res.status(403).json({
      success: false,
      message: 'You do not have access to this document'
    });
  }

  res.json({
    success: true,
    data: document
  });
});

// Download document
export const downloadDocument = asyncHandler(async (req, res) => {
  const { documentId } = req.params;
  const userId = req.user.id;

  const documentResult = await pool.query(
    `SELECT
      d.id,
      d.user_id,
      d.title,
      d.file_url,
      EXISTS(SELECT 1 FROM shared_documents WHERE document_id = d.id AND shared_with_user_id = $1) as is_shared_with_me
    FROM documents d
    WHERE d.id = $2`,
    [userId, documentId]
  );

  if (documentResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Document not found'
    });
  }

  const document = documentResult.rows[0];

  // Check if user has access to document
  if (document.user_id !== userId && !document.is_shared_with_me) {
    return res.status(403).json({
      success: false,
      message: 'You do not have access to this document'
    });
  }

  // Log activity
  await pool.query(
    `INSERT INTO activity_log (user_id, activity_type, description, metadata)
     VALUES ($1, $2, $3, $4)`,
    [userId, 'document_downloaded', `Downloaded document: ${document.title}`, JSON.stringify({ documentId })]
  );

  res.json({
    success: true,
    message: 'Document ready for download',
    data: {
      fileUrl: document.file_url,
      title: document.title
    }
  });
});

// Delete document
export const deleteDocument = asyncHandler(async (req, res) => {
  const { documentId } = req.params;
  const userId = req.user.id;

  // Check if document exists and user owns it
  const documentResult = await pool.query(
    'SELECT id, user_id, title FROM documents WHERE id = $1',
    [documentId]
  );

  if (documentResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Document not found'
    });
  }

  const document = documentResult.rows[0];

  // Check ownership
  if (document.user_id !== userId && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'You can only delete your own documents'
    });
  }

  // Delete related records first
  await pool.query('DELETE FROM favorite_documents WHERE document_id = $1', [documentId]);
  await pool.query('DELETE FROM shared_documents WHERE document_id = $1', [documentId]);

  // Delete document
  await pool.query('DELETE FROM documents WHERE id = $1', [documentId]);

  // Log activity
  await pool.query(
    `INSERT INTO activity_log (user_id, activity_type, description, metadata)
     VALUES ($1, $2, $3, $4)`,
    [userId, 'document_deleted', `Deleted document: ${document.title}`, JSON.stringify({ documentId })]
  );

  res.json({
    success: true,
    message: 'Document deleted successfully'
  });
});

// Toggle favorite
export const toggleFavorite = asyncHandler(async (req, res) => {
  const { documentId } = req.params;
  const userId = req.user.id;

  // Check if document exists
  const documentResult = await pool.query(
    'SELECT id FROM documents WHERE id = $1',
    [documentId]
  );

  if (documentResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Document not found'
    });
  }

  // Check if already favorited
  const favoriteResult = await pool.query(
    'SELECT id FROM favorite_documents WHERE user_id = $1 AND document_id = $2',
    [userId, documentId]
  );

  let isFavorited = false;
  let message = '';

  if (favoriteResult.rows.length > 0) {
    // Remove from favorites
    await pool.query(
      'DELETE FROM favorite_documents WHERE user_id = $1 AND document_id = $2',
      [userId, documentId]
    );
    isFavorited = false;
    message = 'Document removed from favorites';
  } else {
    // Add to favorites
    await pool.query(
      'INSERT INTO favorite_documents (user_id, document_id) VALUES ($1, $2)',
      [userId, documentId]
    );
    isFavorited = true;
    message = 'Document added to favorites';
  }

  res.json({
    success: true,
    message,
    data: {
      isFavorited
    }
  });
});

// Share document
export const shareDocument = asyncHandler(async (req, res) => {
  const { documentId } = req.params;
  const { sharedWithUserId, permissions = 'view' } = req.body;
  const userId = req.user.id;

  // Check if document exists and user owns it
  const documentResult = await pool.query(
    'SELECT id, user_id, title FROM documents WHERE id = $1',
    [documentId]
  );

  if (documentResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Document not found'
    });
  }

  const document = documentResult.rows[0];

  // Check ownership
  if (document.user_id !== userId) {
    return res.status(403).json({
      success: false,
      message: 'You can only share your own documents'
    });
  }

  // Check if user to share with exists
  const userToShareResult = await pool.query(
    'SELECT id, full_name FROM users WHERE id = $1 AND is_active = true',
    [sharedWithUserId]
  );

  if (userToShareResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'User to share with not found'
    });
  }

  // Share document
  await pool.query(
    `INSERT INTO shared_documents (document_id, shared_by_user_id, shared_with_user_id, permissions)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (document_id, shared_with_user_id)
     DO UPDATE SET permissions = $4, shared_at = CURRENT_TIMESTAMP`,
    [documentId, userId, sharedWithUserId, permissions]
  );

  // Create notification for the user
  await pool.query(
    `INSERT INTO notifications (user_id, type, title, message, metadata)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      sharedWithUserId,
      'document_shared',
      'Document Shared',
      `${req.user.fullName || 'A user'} shared a document with you: ${document.title}`,
      JSON.stringify({ documentId, sharedBy: userId })
    ]
  );

  // Log activity
  await pool.query(
    `INSERT INTO activity_log (user_id, activity_type, description, metadata)
     VALUES ($1, $2, $3, $4)`,
    [userId, 'document_shared', `Shared document: ${document.title}`, JSON.stringify({ documentId, sharedWith: sharedWithUserId })]
  );

  res.json({
    success: true,
    message: 'Document shared successfully',
    data: {
      documentId,
      sharedWith: userToShareResult.rows[0].full_name
    }
  });
});
