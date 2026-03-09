import express from "express";
import {
    submitMessage,
    getMessages,
    markAsRead,
    deleteMessage,
} from "../controllers/messagesController.ts";

const router = express.Router();

// Public: submit contact form
router.post("/", submitMessage);

// Admin
router.get("/", getMessages);
router.put("/:id/read", markAsRead);
router.delete("/:id", deleteMessage);

export default router;
