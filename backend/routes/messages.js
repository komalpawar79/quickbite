import express from 'express';
import { 
  submitMessage, 
  getAllMessages, 
  getMessageById, 
  replyMessage, 
  toggleStarMessage, 
  deleteMessage,
  getUserMessages
} from '../controllers/messageController.js';
import authMiddleware from '../middleware/auth.js';
import { roleMiddleware } from '../middleware/rbac.js';

const router = express.Router();

// Public route - anyone can submit a message
router.post('/', submitMessage);

// Public route - users can get their messages by email
router.get('/user/my-messages', getUserMessages);

// Admin only routes
router.get('/', authMiddleware, roleMiddleware(['admin']), getAllMessages);
router.get('/:id', authMiddleware, roleMiddleware(['admin']), getMessageById);
router.put('/:id/reply', authMiddleware, roleMiddleware(['admin']), replyMessage);
router.put('/:id/star', authMiddleware, roleMiddleware(['admin']), toggleStarMessage);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), deleteMessage);

export default router;
