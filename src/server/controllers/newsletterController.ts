import { Request, Response } from "express";
import { Subscription } from "../models/index.ts";

export const subscribeNewsletter = async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email || !email.includes("@")) {
        return res.status(400).json({ message: "Please provide a valid email address" });
    }

    try {
        const existing = await Subscription.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: "This email is already subscribed" });
        }

        const subscription = await Subscription.create({ email });

        if (subscription) {
            res.status(201).json({ message: "Successfully subscribed to newsletter!" });
        } else {
            res.status(400).json({ message: "Subscription failed" });
        }
    } catch (err: any) {
        console.error("Newsletter subscription error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getSubscriptions = async (req: Request, res: Response) => {
    try {
        const subscriptions = await Subscription.find({}).sort({ createdAt: -1 });
        const mapped = subscriptions.map((s) => {
            const obj = s.toJSON() as any;
            obj.id = obj._id;
            return obj;
        });
        res.json(mapped);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch subscriptions" });
    }
};
