import express from 'express';
import {
  createSession,
  getAllSessions,
  getSessionById,
  updateSession,
  cancelSession,
  completeSession
} from '../controllers/sessionController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.post('/', createSession);
router.get('/', getAllSessions);
router.get('/:sessionId', getSessionById);
router.patch('/:sessionId', updateSession);
router.post('/:sessionId/cancel', cancelSession);
router.post('/:sessionId/complete', completeSession);

export default router;
