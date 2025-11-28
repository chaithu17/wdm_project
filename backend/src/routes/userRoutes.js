import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  getUserStatistics,
  getLearningProgress,
  updateLearningProgress,
  getUserActivity,
  getUserAchievements,
  getUserSettings,
  updateUserSettings
} from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Profile routes
router.get('/:userId', getUserProfile);
router.patch('/:userId', updateUserProfile);

// Statistics and progress
router.get('/:userId/statistics', getUserStatistics);
router.get('/:userId/progress', getLearningProgress);
router.patch('/:userId/progress/:subject', updateLearningProgress);

// Activity and achievements
router.get('/:userId/activity', getUserActivity);
router.get('/:userId/achievements', getUserAchievements);

// Settings
router.get('/:userId/settings', getUserSettings);
router.patch('/:userId/settings', updateUserSettings);

export default router;
