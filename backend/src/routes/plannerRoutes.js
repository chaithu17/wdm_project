import express from 'express';
import {
  createPlannerItem,
  getPlannerItems,
  updatePlannerItem,
  deletePlannerItem
} from '../controllers/plannerController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.post('/', createPlannerItem);
router.get('/', getPlannerItems);
router.patch('/:itemId', updatePlannerItem);
router.delete('/:itemId', deletePlannerItem);

export default router;
