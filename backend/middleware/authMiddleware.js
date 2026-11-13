
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
    try {
        let token;

        // Get JWT from HttpOnly cookie
        if (req.cookies?.bulkchat_token) {
            token = req.cookies.bulkchat_token;
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized. Please login first.',
            });
        }

        // Verify JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find authenticated user
        const user = await User.findById(decoded.id).select('-password');

        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'User not found or account is inactive.',
            });
        }

        req.user = user;
        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token.',
        });
    }
};

export default protect;
