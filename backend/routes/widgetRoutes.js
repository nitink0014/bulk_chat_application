
import express from 'express';

import { createWidget } from '../controllers/widgetController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// Create website widget
router.post('/', protect, createWidget);

export default router;
