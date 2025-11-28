import express from 'express';
import {
  getAllUsers,
  getTutorVerificationRequests,
  approveTutor,
  rejectTutor,
  suspendTutor,
  getAllSessions,
  getAllPayments,
  getDisputes,
  resolveDispute,
  getCoupons,
  createCoupon,
  updateCoupon,
  getAnalytics,
  exportData
} from '../controllers/adminController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// All routes require admin authentication
router.use(authenticate);
router.use(requireAdmin);

// User management
router.get('/users', getAllUsers);

// Tutor verification
router.get('/tutors/verification-requests', getTutorVerificationRequests);
router.post('/tutors/:tutorId/approve', approveTutor);
router.post('/tutors/:tutorId/reject', rejectTutor);
router.post('/tutors/:tutorId/suspend', suspendTutor);

// Sessions
router.get('/sessions', getAllSessions);

// Payments
router.get('/payments', getAllPayments);

// Disputes
router.get('/disputes', getDisputes);
router.post('/disputes/:disputeId/resolve', resolveDispute);

// Coupons
router.get('/coupons', getCoupons);
router.post('/coupons', createCoupon);
router.patch('/coupons/:couponId', updateCoupon);

// Analytics
router.get('/analytics', getAnalytics);

// Data export
router.get('/export/:type', exportData);

export default router;
