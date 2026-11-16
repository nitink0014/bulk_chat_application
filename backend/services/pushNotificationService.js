
import "dotenv/config";
import { createRequire } from "module";
import PushSubscription from "../models/PushSubscription.js";

const require = createRequire(import.meta.url);
const webpush = require("web-push");

// Read VAPID credentials
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT;

// Validate environment variables
if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY || !VAPID_SUBJECT) {
    throw new Error(
        "Missing VAPID environment variables. Check backend/.env"
    );
}

// Configure VAPID
webpush.setVapidDetails(
    VAPID_SUBJECT,
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
);

// Send push notification
export const sendPushNotification = async (
    savedSubscription,
    payload
) => {
    try {
        await webpush.sendNotification(
            {
                endpoint: savedSubscription.endpoint,
                keys: savedSubscription.keys,
            },
            JSON.stringify(payload)
        );

        console.log("Push notification sent successfully.");

        return true;

    } catch (error) {
        console.error(
            "Push Notification Error:",
            error.statusCode,
            error.message
        );

        if (error.statusCode === 404 || error.statusCode === 410) {
            await PushSubscription.deleteOne({
                _id: savedSubscription._id,
            });

            console.log("Expired push subscription removed.");
        }

        return false;
    }
};
