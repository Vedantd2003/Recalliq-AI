import express from 'express';
import { register, login, refreshToken, logout, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { registerSchema, loginSchema } from '../validators/schemas.js';

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refreshToken); // Validation handled in controller due to cookie extraction
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

export default router;