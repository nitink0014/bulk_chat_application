
import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import {
  enablePushNotifications,
  disablePushNotifications,
} from "../services/pushNotifications";

function NotificationSetup() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const registration =
          await navigator.serviceWorker.getRegistration("/service-worker.js");

        const subscription =
          await registration?.pushManager.getSubscription();

        setEnabled(Boolean(subscription));
      } catch (err) {
        console.error("Notification check failed:", err);
      }
    };

    checkSubscription();
  }, []);

  const handleToggle = async () => {
    try {
      setLoading(true);
      setError("");

      if (enabled) {
        await disablePushNotifications();
        setEnabled(false);
      } else {
        await enablePushNotifications();
        setEnabled(true);
      }
    } catch (err) {
      console.error("Notification setup failed:", err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleToggle}
        disabled={loading}
        className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
      >
        {enabled ? <BellOff size={16} /> : <Bell size={16} />}
        {loading
          ? "Please wait..."
          : enabled
            ? "Notifications On"
            : "Enable Notifications"}
      </button>

      {error && (
        <p className="absolute right-0 top-full z-20 mt-2 w-64 rounded-lg bg-red-50 p-2 text-xs text-red-600 shadow">
          {error}
        </p>
      )}
    </div>
  );
}

export default NotificationSetup;
