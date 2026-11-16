
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';

// @desc    Get conversation messages
// @route   GET /api/chat/:conversationId/messages
// @access  Private (Agent)

export const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;

        // Find conversation belonging to this agent
        const conversation = await Conversation.findOne({
            _id: conversationId,
            widget: {
                $in: await (
                    await import('../models/Widget.js')
                ).default.find({ owner: req.user._id }).distinct('_id'),
            },
        });

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found',
            });
        }

        const messages = await Message.find({
            conversation: conversationId,
        }).sort({ createdAt: 1 });

        return res.status(200).json({
            success: true,
            count: messages.length,
            messages,
        });

    } catch (error) {
        console.error('Get Messages Error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch messages',
        });
    }
};
