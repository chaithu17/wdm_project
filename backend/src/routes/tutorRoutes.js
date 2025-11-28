import express from 'express';
import {
  getAllTutors,
  getTutorById,
  updateTutorProfile,
  getTutorReviews,
  getTutorSessions,
  getTutorEarnings
} from '../controllers/tutorController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllTutors);
router.get('/:tutorId', getTutorById);
router.get('/:tutorId/reviews', getTutorReviews);

// Protected routes
router.patch('/:tutorId', authenticate, updateTutorProfile);
router.get('/:tutorId/sessions', authenticate, getTutorSessions);
router.get('/:tutorId/earnings', authenticate, getTutorEarnings);

export default router;
