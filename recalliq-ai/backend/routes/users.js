import express from 'express';
import { getProfile, updateProfile, getAllUsers } from '../controllers/userController.js';
import { protect, requireRole } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { updateProfileSchema } from '../validators/schemas.js';

const router = express.Router();

router.use(protect);
router.get('/profile', getProfile);
router.patch('/profile', validate(updateProfileSchema), updateProfile);
router.get('/', requireRole('admin'), getAllUsers);

export default router;
