import express from 'express';
import {
  analyzeMeeting,
  getMeetings,
  getMeeting,
  updateActionItem,
  regenerateEmail,
  deleteMeeting,
  getStats,
} from '../controllers/meetingController.js';

import { protect } from '../middleware/auth.js'; 
import validate from '../middleware/validate.js';
import { analyzeMeetingSchema, updateActionItemSchema } from '../validators/schemas.js';

const router = express.Router();

// All routes require authentication
// Note: We changed 'authenticate' to 'protect' in our middleware file
router.use(protect);

router.get('/stats', getStats);
router.get('/', getMeetings);
router.post('/', validate(analyzeMeetingSchema), analyzeMeeting);
router.get('/:id', getMeeting);
router.delete('/:id', deleteMeeting);
router.patch('/:id/action-items/:itemId', validate(updateActionItemSchema), updateActionItem);
router.post('/:id/regenerate-email', regenerateEmail);

// CHANGE: module.exports = router; -> export default router;
export default router;