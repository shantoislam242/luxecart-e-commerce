import { Request, Response } from "express";
import { db } from "../db/index.ts";

let stmtAll: ReturnType<typeof db.prepare>;
let stmtOne: ReturnType<typeof db.prepare>;
let stmtInsert: ReturnType<typeof db.prepare>;
let stmtUpdate: ReturnType<typeof db.prepare>;
let stmtDelete: ReturnType<typeof db.prepare>;

function initStmts() {
    if (stmtAll) return;
    stmtAll = db.prepare("SELECT * FROM team_members ORDER BY displayOrder ASC");
    stmtOne = db.prepare("SELECT * FROM team_members WHERE id = ?");
    stmtInsert = db.prepare(`
    INSERT INTO team_members (name, role, bio, img, displayOrder)
    VALUES (@name, @role, @bio, @img, @displayOrder)
  `);
    stmtUpdate = db.prepare(`
    UPDATE team_members SET name=@name, role=@role, bio=@bio, img=@img, displayOrder=@displayOrder WHERE id=@id
  `);
    stmtDelete = db.prepare("DELETE FROM team_members WHERE id = ?");
}

export const getTeamMembers = (_req: Request, res: Response) => {
    initStmts();
    res.set("Cache-Control", "public, max-age=30, stale-while-revalidate=120");
    res.json(stmtAll.all());
};

export const createTeamMember = (req: Request, res: Response) => {
    initStmts();
    const { name, role, bio, img, displayOrder } = req.body;
    if (!name || !role) return res.status(400).json({ message: "name and role required" });
    const result = stmtInsert.run({ name, role, bio: bio || "", img: img || "https://i.pravatar.cc/200", displayOrder: displayOrder || 0 });
    res.status(201).json({ id: result.lastInsertRowid });
};

export const updateTeamMember = (req: Request, res: Response) => {
    initStmts();
    const existing = stmtOne.get(req.params.id) as any;
    if (!existing) return res.status(404).json({ message: "Member not found" });
    const { name, role, bio, img, displayOrder } = req.body;
    stmtUpdate.run({
        id: req.params.id,
        name: name ?? existing.name,
        role: role ?? existing.role,
        bio: bio ?? existing.bio,
        img: img ?? existing.img,
        displayOrder: displayOrder !== undefined ? displayOrder : existing.displayOrder,
    });
    res.json({ message: "Updated" });
};

export const deleteTeamMember = (req: Request, res: Response) => {
    initStmts();
    const result = stmtDelete.run(req.params.id);
    if (result.changes > 0) res.json({ message: "Deleted" });
    else res.status(404).json({ message: "Member not found" });
};
