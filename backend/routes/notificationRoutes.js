
import express from "express";

import protect from "../middleware/authMiddleware.js";

import {
  subscribeDevice,
  unsubscribeDevice,
} from "../controllers/notificationController.js";

const router = express.Router();

router.post("/subscribe", protect, subscribeDevice);
router.delete("/unsubscribe", protect, unsubscribeDevice);

export default router;
