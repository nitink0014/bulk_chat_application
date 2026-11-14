
import api from "../services/api";

const getVisitorStorageKey = (publicKey) => {
  return `bulkchat_visitor_${publicKey}`;
};

export const getVisitorId = (publicKey) => {
  if (!publicKey) {
    throw new Error("Widget public key is missing");
  }

  const storageKey = getVisitorStorageKey(publicKey);

  let visitorId = localStorage.getItem(storageKey);

  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem(storageKey, visitorId);
  }

  return visitorId;
};

export const trackVisitor = async (publicKey, visitorId) => {
  const response = await api.post("/visitors/track", {
    publicKey,
    visitorId,
    currentPage: window.location.href,
    referrer: document.referrer || "",
  });

  return response.data;
};
