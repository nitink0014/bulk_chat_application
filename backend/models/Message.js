
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
    {
        conversation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Conversation',
            required: true,
        },

        senderType: {
            type: String,
            enum: ['visitor', 'agent'],
            required: true,
        },

        sender: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
        },

        content: {
            type: String,
            required: true,
            trim: true,
            maxlength: 5000,
        },

        isRead: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

messageSchema.index({ conversation: 1, createdAt: 1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;
