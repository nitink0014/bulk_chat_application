
import DeviceSession from '../models/DeviceSession.js';

// @desc    Get Agent dashboard
// @route   GET /api/agent/dashboard
// @access  Private (Agent)

export const getAgentDashboard = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            message: 'Welcome to Agent Dashboard',
            agent: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: 'agent',
                isActive: req.user.isActive,
            },
        });

    } catch (error) {
        console.error('Agent Dashboard Error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to load Agent dashboard',
        });
    }
};


// @desc    Get Agent analytics
// @route   GET /api/agent/analytics
// @access  Private (Agent)

export const getAgentAnalytics = async (req, res) => {
    try {
        const agentId = req.user._id;

        const [
            totalSessions,
            onlineSessions,
            offlineSessions,
        ] = await Promise.all([
            DeviceSession.countDocuments({ user: agentId }),
            DeviceSession.countDocuments({
                user: agentId,
                isOnline: true,
            }),
            DeviceSession.countDocuments({
                user: agentId,
                isOnline: false,
            }),
        ]);

        return res.status(200).json({
            success: true,
            analytics: {
                totalSessions,
                onlineSessions,
                offlineSessions,
                isOnline: onlineSessions > 0,
            },
        });

    } catch (error) {
        console.error('Agent Analytics Error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch Agent analytics',
        });
    }
};


// @desc    Get logged-in Agent sessions
// @route   GET /api/agent/sessions
// @access  Private (Agent)

export const getAgentSessions = async (req, res) => {
    try {
        const sessions = await DeviceSession.find({
            user: req.user._id,
        }).sort({ loginAt: -1 });

        return res.status(200).json({
            success: true,
            count: sessions.length,
            sessions,
        });

    } catch (error) {
        console.error('Agent Sessions Error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch Agent sessions',
        });
    }
};
