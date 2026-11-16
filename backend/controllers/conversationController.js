import Conversation from '../models/Conversation.js';
import Widget from '../models/Widget.js';

// @desc Get all conversations belonging to the logged-in agent
// @route GET /api/chat/conversations
// @access Private (Agent)

export const getConversations = async (req, res) => {
    try {
        // Find widgets owned by this agent
        const widgetIds = await Widget.find({
            owner: req.user._id,
        }).distinct('_id');

        // Find conversations belonging to those widgets
        const conversations = await Conversation.find({
            widget: { $in: widgetIds },
        })
            .populate('visitor', 'name email isOnline currentPage lastSeen')
            .populate('widget', 'name')
            .sort({
                lastMessageAt: -1,
                updatedAt: -1,
            });

        return res.status(200).json({
            success: true,
            count: conversations.length,
            conversations,
        });

    } catch (error) {
        console.error('Get Conversations Error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch conversations',
        });
    }
};
// @desc Assign conversation to the logged-in agent
// @route PATCH /api/chat/:conversationId/assign
// @access Private (Agent)
export const assignConversationToMe = async (req, res) => {
  try {
    const widgetIds = await Widget.find({
      owner: req.user._id,
    }).distinct("_id");

    const conversation = await Conversation.findOneAndUpdate(
      {
        _id: req.params.conversationId,
        widget: { $in: widgetIds },
        $or: [
          { agent: null },
          { agent: req.user._id },
        ],
      },
      {
        $set: { agent: req.user._id },
      },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("visitor", "name email")
      .populate("agent", "name email")
      .populate("widget", "name");

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found or already assigned to another agent",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Conversation assigned successfully",
      conversation,
    });
  } catch (error) {
    console.error("Assign Conversation Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to assign conversation",
    });
  }
};