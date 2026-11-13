
import DeviceSession from '../models/DeviceSession.js';

const activityMiddleware = async (req, res, next) => {
    try {
        const sessionId = req.headers['x-session-id'];

        if (sessionId) {
            await DeviceSession.findOneAndUpdate(
                {
                    _id: sessionId,
                    user: req.user._id,
                    isOnline: true,
                },
                {
                    lastActiveAt: new Date(),
                }
            );
        }

        next();

    } catch (error) {
        console.error('Activity tracking error:', error.message);
        next();
    }
};

export default activityMiddleware;
