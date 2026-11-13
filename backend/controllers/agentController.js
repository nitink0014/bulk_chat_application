
import Widget from '../models/Widget.js';
import Visitor from '../models/Visitor.js';

// Get Agent dashboard
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

// Get Agent visitor analytics
export const getAgentAnalytics = async (req, res) => {
    try {
        const widgets = await Widget.find({
            owner: req.user._id,
        }).select('_id');

        const widgetIds = widgets.map(widget => widget._id);

        const [
            totalVisitors,
            onlineVisitors,
            offlineVisitors,
        ] = await Promise.all([
            Visitor.countDocuments({ widget: { $in: widgetIds } }),
            Visitor.countDocuments({
                widget: { $in: widgetIds },
                isOnline: true,
            }),
            Visitor.countDocuments({
                widget: { $in: widgetIds },
                isOnline: false,
            }),
        ]);

        return res.status(200).json({
            success: true,
            analytics: {
                totalVisitors,
                onlineVisitors,
                offlineVisitors,
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
