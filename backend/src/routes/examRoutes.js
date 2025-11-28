import express from 'express';
import {
  createExam,
  getAllExams,
  getExamById,
  updateExam,
  deleteExam,
  publishExam,
  submitExam,
  gradeExam,
  getExamSubmissions
} from '../controllers/examController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.post('/', authorize('tutor', 'both', 'admin'), createExam);
router.get('/', getAllExams);
router.get('/:examId', getExamById);
router.patch('/:examId', authorize('tutor', 'both', 'admin'), updateExam);
router.delete('/:examId', authorize('tutor', 'both', 'admin'), deleteExam);
router.post('/:examId/publish', authorize('tutor', 'both', 'admin'), publishExam);
router.post('/:examId/submit', submitExam);
router.post('/:examId/submissions/:submissionId/grade', authorize('tutor', 'both', 'admin'), gradeExam);
router.get('/:examId/submissions', authorize('tutor', 'both', 'admin'), getExamSubmissions);

export default router;
