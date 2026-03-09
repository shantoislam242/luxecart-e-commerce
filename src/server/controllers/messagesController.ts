import { Request, Response } from "express";
import { ContactMessage } from "../models/index.ts";

// Public: submit a contact message
export const submitMessage = async (req: Request, res: Response) => {
    try {
        const { name, email, subject, message } = req.body;
        if (!name || !email || !message) return res.status(400).json({ message: "name, email, and message are required" });

        const contactMessage = await ContactMessage.create({
            name, email, subject: subject || "", message
        });

        res.status(201).json({ id: contactMessage._id, message: "Message sent successfully!" });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Admin: get all messages
export const getMessages = async (_req: Request, res: Response) => {
    try {
        const messages = await ContactMessage.find({}).sort({ createdAt: -1 });
        const unread = await ContactMessage.countDocuments({ isRead: false });

        const mapped = messages.map(m => {
            const obj = m.toJSON() as any;
            obj.id = obj._id;
            return obj;
        });

        res.json({ messages: mapped, unread });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Admin: mark a message as read
export const markAsRead = async (req: Request, res: Response) => {
    try {
        const msg = await ContactMessage.findById(req.params.id);
        if (!msg) return res.status(404).json({ message: "Message not found" });

        msg.isRead = true;
        await msg.save();

        res.json({ message: "Marked as read" });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Admin: delete a message
export const deleteMessage = async (req: Request, res: Response) => {
    try {
        const msg = await ContactMessage.findByIdAndDelete(req.params.id);
        if (msg) res.json({ message: "Deleted" });
        else res.status(404).json({ message: "Message not found" });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
