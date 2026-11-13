
import express from 'express';

import protect from '../middleware/authMiddleware.js';

import {
    getAgentDashboard,
    getAgentAnalytics,
    getAgentSessions,
} from '../controllers/agentController.js';

const router = express.Router();

// All Agent routes require authentication
router.use(protect);

// Agent Dashboard
router.get('/dashboard', getAgentDashboard);

// Agent Analytics
router.get('/analytics', getAgentAnalytics);

// Logged-in Agent's sessions
router.get('/sessions', getAgentSessions);

export default router;
