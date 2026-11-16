
import mongoose from "mongoose";

const pushSubscriptionSchema = new mongoose.Schema(
  {
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    endpoint: {
      type: String,
      required: true,
      unique: true,
    },

    keys: {
      p256dh: {
        type: String,
        required: true,
      },
      auth: {
        type: String,
        required: true,
      },
    },

    deviceType: {
      type: String,
      enum: ["desktop", "mobile", "tablet", "unknown"],
      default: "unknown",
    },

    userAgent: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const PushSubscription = mongoose.model(
  "PushSubscription",
  pushSubscriptionSchema
);

export default PushSubscription;
