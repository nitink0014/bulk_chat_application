
import mongoose from 'mongoose';

const deviceSessionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        deviceId: {
            type: String,
            default: null,
        },

        ipAddress: {
            type: String,
            default: null,
        },

        userAgent: {
            type: String,
            default: null,
        },

        browser: {
            name: String,
            version: String,
        },

        operatingSystem: {
            name: String,
            version: String,
        },

        device: {
            type: String,
            default: 'Unknown',
        },

        isOnline: {
            type: Boolean,
            default: false,
        },

        loginAt: {
            type: Date,
            default: Date.now,
        },

        lastActiveAt: {
            type: Date,
            default: Date.now,
        },

        logoutAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

const DeviceSession = mongoose.model(
    'DeviceSession',
    deviceSessionSchema
);

export default DeviceSession;
