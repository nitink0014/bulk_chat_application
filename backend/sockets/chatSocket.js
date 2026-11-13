
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

import User from '../models/User.js';
import Widget from '../models/Widget.js';
import Visitor from '../models/Visitor.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

const initializeChatSockets = (io) => {

    // Authentication for Agents and Visitors
    io.use(async (socket, next) => {
        try {
            const auth = socket.handshake.auth || {};

            // VISITOR AUTHENTICATION
            if (auth.role === 'visitor') {
                const { publicKey, visitorId } = auth;

                if (!publicKey || !visitorId) {
                    return next(new Error('Public key and visitor ID are required'));
                }

                // Verify website origin
                const origin = socket.handshake.headers.origin;

                if (!origin) {
                    return next(new Error('Website origin is required'));
                }

                let hostname;

                try {
                    hostname = new URL(origin).hostname.toLowerCase();
                } catch {
                    return next(new Error('Invalid website origin'));
                }

                // Find active widget
                const widget = await Widget.findOne({
                    publicKey,
                    isActive: true,
                });

                if (!widget) {
                    return next(new Error('Widget not found or inactive'));
                }

                // Verify allowed domain
                const allowedDomains = widget.allowedDomains.map(
                    domain => domain.toLowerCase()
                );

                if (!allowedDomains.includes(hostname)) {
                    return next(new Error('Website domain is not allowed'));
                }

                // Find visitor
                const visitor = await Visitor.findOne({
                    widget: widget._id,
                    visitorId,
                });

                if (!visitor) {
                    return next(new Error('Visitor not found. Track visitor first.'));
                }

                socket.role = 'visitor';
                socket.widget = widget;
                socket.visitor = visitor;

                return next();
            }

            // AGENT AUTHENTICATION
            if (auth.role && auth.role !== 'agent') {
                return next(new Error('Invalid socket role'));
            }

            const cookieHeader = socket.handshake.headers.cookie || '';

            const cookies = Object.fromEntries(
                cookieHeader.split(';').filter(Boolean).map(cookie => {
                    const [key, ...value] = cookie.trim().split('=');
                    return [key, decodeURIComponent(value.join('='))];
                })
            );

            const token = cookies.bulkchat_token;

            if (!token) {
                return next(new Error('Authentication required'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const user = await User.findById(decoded.id).select('-password');

            if (!user || !user.isActive) {
                return next(new Error('Invalid or inactive agent'));
            }

            socket.role = 'agent';
            socket.user = user;

            next();

        } catch (error) {
            console.error('Socket Authentication Error:', error);
            next(new Error('Socket authentication failed'));
        }
    });

    // Socket connection
    io.on('connection', (socket) => {

        if (socket.role === 'agent') {
            console.log(`Agent connected: ${socket.user._id}`);

            socket.join(`agent:${socket.user._id}`);
        } else {
            console.log(`Visitor connected: ${socket.visitor.visitorId}`);
        }

        // JOIN CONVERSATION
        socket.on('join_conversation', async (data, callback) => {
            try {
                const { conversationId } = data || {};

                if (!mongoose.isValidObjectId(conversationId)) {
                    return callback?.({
                        success: false,
                        message: 'Invalid conversation ID',
                    });
                }

                let conversation;

                if (socket.role === 'agent') {

                    const widgetIds = await Widget.find({
                        owner: socket.user._id,
                    }).distinct('_id');

                    conversation = await Conversation.findOne({
                        _id: conversationId,
                        widget: { $in: widgetIds },
                        status: 'open',
                    });

                } else {

                    conversation = await Conversation.findOne({
                        _id: conversationId,
                        widget: socket.widget._id,
                        visitor: socket.visitor._id,
                        status: 'open',
                    });
                }

                if (!conversation) {
                    return callback?.({
                        success: false,
                        message: 'Conversation not found or closed',
                    });
                }

                socket.join(`conversation:${conversationId}`);

                callback?.({
                    success: true,
                    message: 'Joined conversation successfully',
                });

            } catch (error) {
                console.error('Join Conversation Error:', error);

                callback?.({
                    success: false,
                    message: 'Failed to join conversation',
                });
            }
        });

        // SEND MESSAGE (AGENT AND VISITOR)
        socket.on('send_message', async (data, callback) => {
            try {
                const { conversationId, content } = data || {};

                if (
                    !mongoose.isValidObjectId(conversationId) ||
                    typeof content !== 'string' ||
                    !content.trim() ||
                    content.trim().length > 5000
                ) {
                    return callback?.({
                        success: false,
                        message: 'Valid conversation ID and message are required',
                    });
                }

                let conversation;

                if (socket.role === 'agent') {

                    const widgetIds = await Widget.find({
                        owner: socket.user._id,
                    }).distinct('_id');

                    conversation = await Conversation.findOne({
                        _id: conversationId,
                        widget: { $in: widgetIds },
                        status: 'open',
                    });

                } else {

                    conversation = await Conversation.findOne({
                        _id: conversationId,
                        widget: socket.widget._id,
                        visitor: socket.visitor._id,
                        status: 'open',
                    });
                }

                if (!conversation) {
                    return callback?.({
                        success: false,
                        message: 'Conversation not found or closed',
                    });
                }

                // Sender details come from authenticated socket
                const message = await Message.create({
                    conversation: conversation._id,
                    senderType: socket.role,
                    sender: socket.role === 'agent'
                        ? socket.user._id
                        : socket.visitor._id,
                    content: content.trim(),
                });

                conversation.lastMessage = message.content;
                conversation.lastMessageAt = message.createdAt;

                await conversation.save();

                // Send message to everyone in conversation
                io.to(`conversation:${conversationId}`).emit(
                    'new_message',
                    message
                );

                callback?.({
                    success: true,
                    message: 'Message sent successfully',
                    data: message,
                });

            } catch (error) {
                console.error('Send Message Error:', error);

                callback?.({
                    success: false,
                    message: 'Failed to send message',
                });
            }
        });

        // DISCONNECT
        socket.on('disconnect', () => {
            if (socket.role === 'agent') {
                console.log(`Agent disconnected: ${socket.user._id}`);
            } else {
                console.log(`Visitor disconnected: ${socket.visitor.visitorId}`);
            }
        });
    });
};

export default initializeChatSockets;
