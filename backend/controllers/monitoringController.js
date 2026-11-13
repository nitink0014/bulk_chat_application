
import DeviceSession from '../models/DeviceSession.js';
import getDeviceInfo from '../utils/deviceInfo.js';

// @desc    Create a user device session
// @route   POST /api/monitoring/session
// @access  Private
export const createDeviceSession = async (req, res) => {
    try {
        const deviceInfo = getDeviceInfo(req);

        const session = await DeviceSession.create({
            user: req.user._id,
            ...deviceInfo,
            isOnline: true,
            loginAt: new Date(),
            lastActiveAt: new Date(),
        });

        res.status(201).json({
            success: true,
            message: 'Device session created successfully',
            session,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
