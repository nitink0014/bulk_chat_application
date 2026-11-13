import express from 'express';

import {
    registerUser,
    loginUser,
    getProfile,
    logoutUser
} from '../controllers/authController.js';

import protect from '../middleware/authMiddleware.js';
import activityMiddleware from '../middleware/activityMiddleware.js';
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', protect, logoutUser);
// Protected route
router.get('/profile', protect, activityMiddleware, getProfile);

export default router;