
import api from "../services/api";

// Get customer website URL from iframe referrer
const getCustomerPageUrl = () => {
  return document.referrer || window.location.href;
};

// Generate a separate visitor ID for each widget and website
const getVisitorStorageKey = (publicKey) => {
  let hostname = "unknown";

  try {
    hostname = new URL(getCustomerPageUrl()).hostname;
  } catch {
    // Keep fallback hostname
  }

  return `bulkchat_visitor_${publicKey}_${hostname}`;
};

// Get or create visitor ID
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

// Track website visitor
export const trackVisitor = async (
  publicKey,
  visitorId,
  customerPageUrl
) => {
  const response = await api.post("/visitors/track", {
    publicKey,
    visitorId,
    currentPage: customerPageUrl,
    referrer: document.referrer || "",
  });

  return response.data;
};