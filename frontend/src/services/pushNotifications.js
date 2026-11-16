
import api from "./api";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);

  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);

  return Uint8Array.from(rawData, (char) => char.charCodeAt(0));
};

const getDeviceType = () => {
  const ua = navigator.userAgent;

  if (/iPad|Tablet/i.test(ua)) return "tablet";
  if (/Android|iPhone|Mobile/i.test(ua)) return "mobile";

  return "desktop";
};

export const enablePushNotifications = async () => {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    throw new Error("Push notifications are not supported by this browser.");
  }

  if (!VAPID_PUBLIC_KEY) {
    throw new Error("VAPID public key is missing from frontend environment.");
  }

  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    throw new Error("Notification permission was not granted.");
  }

  const registration = await navigator.serviceWorker.register(
    "/service-worker.js"
  );

  await navigator.serviceWorker.ready;

  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
  }

  await api.post("/notifications/subscribe", {
    subscription: subscription.toJSON(),
    deviceType: getDeviceType(),
  });

  return subscription;
};

export const disablePushNotifications = async () => {
  const registration = await navigator.serviceWorker.getRegistration(
    "/service-worker.js"
  );

  if (!registration) return;

  const subscription = await registration.pushManager.getSubscription();

  if (!subscription) return;

  await api.delete("/notifications/unsubscribe", {
    data: {
      endpoint: subscription.endpoint,
    },
  });

  await subscription.unsubscribe();
};
