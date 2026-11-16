
import mongoose from 'mongoose';

const widgetSchema = new mongoose.Schema(
  {
    // Agent who owns this widget
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    websiteUrl: {
      type: String,
      required: true,
      trim: true,
    },

    // Public key used by the website installation script
    publicKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    allowedDomains: {
      type: [String],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    settings: {
      primaryColor: {
        type: String,
        default: '#2563eb',
      },

      welcomeMessage: {
        type: String,
        default: 'Hi! How can we help you?',
      },

      position: {
        type: String,
        enum: ['bottom-right', 'bottom-left'],
        default: 'bottom-right',
      },
    },
  },
  {
    timestamps: true,
  }
);

const Widget = mongoose.model('Widget', widgetSchema);

export default Widget;
