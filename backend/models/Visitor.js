
import mongoose from 'mongoose';

const visitorSchema = new mongoose.Schema(
  {
    // Widget through which visitor entered
    widget: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Widget',
      required: true,
    },

    // Unique browser-generated visitor ID
    visitorId: {
      type: String,
      required: true,
      trim: true,
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
      name: {
        type: String,
        default: 'Unknown',
      },
      version: {
        type: String,
        default: 'Unknown',
      },
    },

    operatingSystem: {
      name: {
        type: String,
        default: 'Unknown',
      },
      version: {
        type: String,
        default: 'Unknown',
      },
    },

    device: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet', 'Unknown'],
      default: 'Unknown',
    },

    currentPage: {
      type: String,
      default: null,
    },

    referrer: {
      type: String,
      default: null,
    },

    // Optional visitor-provided information
    name: {
      type: String,
      default: null,
      trim: true,
    },

    email: {
      type: String,
      default: null,
      trim: true,
      lowercase: true,
    },

    isOnline: {
      type: Boolean,
      default: false,
    },

    firstSeen: {
      type: Date,
      default: Date.now,
    },

    lastSeen: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// One visitor ID per widget
visitorSchema.index(
  { widget: 1, visitorId: 1 },
  { unique: true }
);

const Visitor = mongoose.model('Visitor', visitorSchema);

export default Visitor;
