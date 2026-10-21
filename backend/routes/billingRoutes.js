import express from "express";
import {
  createCheckoutSession,
  verifyCheckoutSession,
  cancelSubscription,
} from "../controllers/billingController.js";

const router = express.Router();

router.post("/create-checkout-session", createCheckoutSession);
router.post("/verify-session", verifyCheckoutSession);
router.post("/cancel-subscription", cancelSubscription);

export default router;
