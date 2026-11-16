
import PushSubscription from "../models/PushSubscription.js";

// @desc Register an agent's device for push notifications
// @route POST /api/notifications/subscribe
// @access Private

export const subscribeDevice = async (req, res) => {
  try {
    const { subscription, deviceType } = req.body;

    if (
      !subscription?.endpoint ||
      !subscription?.keys?.p256dh ||
      !subscription?.keys?.auth
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid push subscription data.",
      });
    }

    const savedSubscription = await PushSubscription.findOneAndUpdate(
      { endpoint: subscription.endpoint },
      {
        agent: req.user._id,
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
        deviceType: deviceType || "unknown",
        userAgent: req.headers["user-agent"] || "",
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    return res.status(201).json({
      success: true,
      message: "Device registered for notifications.",
      subscriptionId: savedSubscription._id,
    });
  } catch (error) {
    console.error("Subscribe device error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not register notification device.",
    });
  }
};


// @desc Remove an agent's device subscription
// @route DELETE /api/notifications/unsubscribe
// @access Private

export const unsubscribeDevice = async (req, res) => {
  try {
    const { endpoint } = req.body;

    if (!endpoint) {
      return res.status(400).json({
        success: false,
        message: "Device endpoint is required.",
      });
    }

    const deletedSubscription = await PushSubscription.findOneAndDelete({
      endpoint,
      agent: req.user._id,
    });

    return res.status(200).json({
      success: true,
      message: deletedSubscription
        ? "Device unsubscribed successfully."
        : "Device subscription not found.",
    });
  } catch (error) {
    console.error("Unsubscribe device error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not unsubscribe device.",
    });
  }
};
