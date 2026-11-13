
import express from 'express';
import protect from '../middleware/authMiddleware.js';

import {
    getAgentDashboard,
    getAgentAnalytics,
} from '../controllers/agentController.js';

const router = express.Router();

router.use(protect);

router.get('/dashboard', getAgentDashboard);
router.get('/analytics', getAgentAnalytics);

export default router;
