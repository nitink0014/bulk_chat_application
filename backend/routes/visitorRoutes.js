
import express from 'express';

import {
    trackVisitor,
    getVisitors,
    getVisitorById,
} from '../controllers/visitorController.js';

import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route: Track website visitor
router.post('/track', trackVisitor);

// Private route: Get all visitors belonging to logged-in agent
router.get('/', protect, getVisitors);

// Private route: Get single visitor details
router.get('/:id', protect, getVisitorById);

// Temporary test route
router.get('/test', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Visitor route is working',
    });
});

export default router;
