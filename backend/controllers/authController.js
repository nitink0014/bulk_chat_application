
import User from '../models/User.js';
import DeviceSession from '../models/DeviceSession.js';

import generateToken from '../utils/generateToken.js';
import getDeviceInfo from '../utils/deviceInfo.js';

// Cookie configuration
const cookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: Number(process.env.COOKIE_EXPIRES_IN || 7) * 24 * 60 * 60 * 1000,
    path: '/',
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email and password',
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long',
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists',
            });
        }

        const user = await User.create({
            name,
            email,
            password,
        });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Login user and create monitoring session
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password',
            });
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Your account has been disabled',
            });
        }

        // Generate JWT
        const token = generateToken(user._id);

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Collect device information
        const deviceInfo = getDeviceInfo(req);

        // Create monitoring session
        const deviceSession = await DeviceSession.create({
            user: user._id,
            ...deviceInfo,
            isOnline: true,
            loginAt: new Date(),
            lastActiveAt: new Date(),
        });

        // Set authentication cookie
        res.cookie('bulkchat_token', token, cookieOptions());

        res.status(200).json({
            success: true,
            message: 'Login successful',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            sessionId: deviceSession._id,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get logged-in user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role,
            },
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private

export const logoutUser = async (req, res) => {
    try {
        // Find the latest active session for this user
        const activeSession = await DeviceSession.findOne({
            user: req.user._id,
            isOnline: true,
        }).sort({ loginAt: -1 });

        // Mark session as offline
        if (activeSession) {
            activeSession.isOnline = false;
            activeSession.logoutAt = new Date();
            activeSession.lastActiveAt = new Date();

            await activeSession.save();
        }

        // Clear authentication cookie
        res.clearCookie('bulkchat_token', {
            ...cookieOptions(),
            expires: new Date(0),
            maxAge: 0,
        });

        res.status(200).json({
            success: true,
            message: 'Logout successful',
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

