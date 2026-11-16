
import express from 'express';

import {
  createWidget,
  getWidgets,
  getPublicWidget,
} from '../controllers/widgetController.js';

import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// Public widget configuration
router.get('/public/:publicKey', getPublicWidget);

// Private agent routes
router.get('/', protect, getWidgets);
router.post('/', protect, createWidget);

export default router;
