import express from 'express';

import { startConversation } from '../controllers/chatController.js';
import { getMessages } from '../controllers/messageController.js';
import {
  getConversations,
  assignConversationToMe,
} from '../controllers/conversationController.js';

import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// Visitor: Start or get conversation
router.post('/conversation', startConversation);

// Agent: Get all conversations
router.get('/conversations', protect, getConversations);

// Agent: Assign conversation to current agent
router.patch('/:conversationId/assign', protect, assignConversationToMe);

// Agent: Get conversation messages
router.get('/:conversationId/messages', protect, getMessages);

export default router;