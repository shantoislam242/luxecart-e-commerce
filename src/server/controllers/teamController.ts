import { Request, Response } from "express";
import { TeamMember } from "../models/index.ts";

export const getTeamMembers = async (_req: Request, res: Response) => {
    try {
        const team = await TeamMember.find({}).sort({ displayOrder: 1 });
        const mapped = team.map(t => {
            const obj = t.toJSON() as any;
            obj.id = obj._id;
            return obj;
        });

        res.set("Cache-Control", "public, max-age=30, stale-while-revalidate=120");
        res.json(mapped);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createTeamMember = async (req: Request, res: Response) => {
    try {
        const { name, role, bio, img, displayOrder } = req.body;
        if (!name || !role) return res.status(400).json({ message: "name and role required" });

        const member = await TeamMember.create({
            name,
            role,
            bio: bio || "",
            img: img || "https://i.pravatar.cc/200",
            displayOrder: displayOrder || 0
        });

        res.status(201).json({ id: member._id });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateTeamMember = async (req: Request, res: Response) => {
    try {
        const { name, role, bio, img, displayOrder } = req.body;
        const member = await TeamMember.findById(req.params.id);

        if (!member) return res.status(404).json({ message: "Member not found" });

        if (name !== undefined) member.name = name;
        if (role !== undefined) member.role = role;
        if (bio !== undefined) member.bio = bio;
        if (img !== undefined) member.img = img;
        if (displayOrder !== undefined) member.displayOrder = displayOrder;

        await member.save();
        res.json({ message: "Updated" });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteTeamMember = async (req: Request, res: Response) => {
    try {
        const member = await TeamMember.findByIdAndDelete(req.params.id);
        if (member) res.json({ message: "Deleted" });
        else res.status(404).json({ message: "Member not found" });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
