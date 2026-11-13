
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
    try {
        const token = req.cookies?.bulkchat_token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized. Please login.'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id);

        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'User not found or account is inactive'
            });
        }

        req.user = user;

        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired authentication token'
        });
    }
};

export default protect;
