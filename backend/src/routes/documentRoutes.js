import express from 'express';
import {
  uploadDocument,
  getAllDocuments,
  getDocumentById,
  downloadDocument,
  deleteDocument,
  toggleFavorite,
  shareDocument
} from '../controllers/documentController.js';
import { authenticate } from '../middleware/auth.js';
import { uploadMiddleware, validateFileType, documentFileTypes } from '../middleware/upload.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.post('/', uploadMiddleware, validateFileType(documentFileTypes), uploadDocument);
router.get('/', getAllDocuments);
router.get('/:documentId', getDocumentById);
router.get('/:documentId/download', downloadDocument);
router.delete('/:documentId', deleteDocument);
router.post('/:documentId/favorite', toggleFavorite);
router.post('/:documentId/share', shareDocument);

export default router;
