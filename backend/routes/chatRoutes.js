
import express from 'express';

import { startConversation } from '../controllers/chatController.js';
import { getMessages } from '../controllers/messageController.js';

import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// Visitor: Start or get conversation
router.post('/conversation', startConversation);

// Agent: Get conversation messages
router.get('/:conversationId/messages', protect, getMessages);

export default router;
