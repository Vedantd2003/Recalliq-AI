import express from 'express';
import { getUsage, getCredits } from '../controllers/usageController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.get('/', getUsage);
router.get('/credits', getCredits);

export default router;
