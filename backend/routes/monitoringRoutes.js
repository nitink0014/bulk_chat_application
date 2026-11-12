
import express from 'express';
import protect from '../middleware/authMiddleware.js';
import { createDeviceSession } from '../controllers/monitoringController.js';

const router = express.Router();

// Create device session
router.post('/session', protect, createDeviceSession);

export default router;
