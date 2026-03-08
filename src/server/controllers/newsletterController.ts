import { Request, Response } from "express";
import { db } from "../db/index.ts";

export const subscribeNewsletter = async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email || !email.includes("@")) {
        return res.status(400).json({ message: "Please provide a valid email address" });
    }

    try {
        const existing = db.prepare("SELECT * FROM subscriptions WHERE email = ?").get(email);
        if (existing) {
            return res.status(400).json({ message: "This email is already subscribed" });
        }

        const result = db.prepare(`
      INSERT INTO subscriptions (email)
      VALUES (?)
    `).run(email);

        if (result.lastInsertRowid) {
            res.status(201).json({ message: "Successfully subscribed to newsletter!" });
        } else {
            res.status(400).json({ message: "Subscription failed" });
        }
    } catch (err) {
        console.error("Newsletter subscription error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getSubscriptions = async (req: Request, res: Response) => {
    try {
        const subscriptions = db.prepare("SELECT * FROM subscriptions ORDER BY createdAt DESC").all();
        res.json(subscriptions);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch subscriptions" });
    }
};
