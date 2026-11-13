
import Widget from '../models/Widget.js';
import Visitor from '../models/Visitor.js';
import Conversation from '../models/Conversation.js';

// @desc Start or get visitor conversation
// @route POST /api/chat/conversation
// @access Public

export const startConversation = async (req, res) => {
    try {
        const { publicKey, visitorId, name, email } = req.body;

        // Validate required fields
        if (!publicKey || !visitorId || !name || !email) {
            return res.status(400).json({
                success: false,
                message: 'Public key, visitor ID, name and email are required',
            });
        }

        const visitorName = name.trim();
        const visitorEmail = email.trim().toLowerCase();

        if (visitorName.length < 2 || visitorName.length > 100) {
            return res.status(400).json({
                success: false,
                message: 'Name must be between 2 and 100 characters',
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(visitorEmail)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid email address',
            });
        }

        // Find active widget
        const widget = await Widget.findOne({
            publicKey,
            isActive: true,
        });

        if (!widget) {
            return res.status(404).json({
                success: false,
                message: 'Widget not found or inactive',
            });
        }

        // Find visitor belonging to this widget
        const visitor = await Visitor.findOne({
            widget: widget._id,
            visitorId,
        });

        if (!visitor) {
            return res.status(404).json({
                success: false,
                message: 'Visitor not found. Track visitor first.',
            });
        }

        // Save visitor name and email
        visitor.name = visitorName;
        visitor.email = visitorEmail;
        await visitor.save();

        // Find existing open conversation
        let conversation = await Conversation.findOne({
            widget: widget._id,
            visitor: visitor._id,
            status: 'open',
        });

        // Create conversation if it doesn't exist
        if (!conversation) {
            conversation = await Conversation.create({
                widget: widget._id,
                visitor: visitor._id,
                status: 'open',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Conversation ready',
            visitor: {
                _id: visitor._id,
                visitorId: visitor.visitorId,
                name: visitor.name,
                email: visitor.email,
            },
            conversation,
        });

    } catch (error) {
        console.error('Start Conversation Error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to start conversation',
        });
    }
};
