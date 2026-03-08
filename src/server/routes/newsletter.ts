import express from "express";
import { subscribeNewsletter, getSubscriptions } from "../controllers/newsletterController.ts";
import { protect, admin } from "../middleware/auth.ts";

const router = express.Router();

router.post("/subscribe", subscribeNewsletter);
router.get("/", protect, admin, getSubscriptions);

export default router;
