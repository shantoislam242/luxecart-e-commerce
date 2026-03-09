import { Request, Response } from "express";
import { db } from "../db/index.ts";

let stmtAll: ReturnType<typeof db.prepare>;
let stmtUnread: ReturnType<typeof db.prepare>;
let stmtOne: ReturnType<typeof db.prepare>;
let stmtInsert: ReturnType<typeof db.prepare>;
let stmtMarkRead: ReturnType<typeof db.prepare>;
let stmtDelete: ReturnType<typeof db.prepare>;

function initStmts() {
    if (stmtAll) return;
    stmtAll = db.prepare("SELECT * FROM contact_messages ORDER BY createdAt DESC");
    stmtUnread = db.prepare("SELECT COUNT(*) as count FROM contact_messages WHERE isRead = 0");
    stmtOne = db.prepare("SELECT * FROM contact_messages WHERE id = ?");
    stmtInsert = db.prepare(`
    INSERT INTO contact_messages (name, email, subject, message)
    VALUES (@name, @email, @subject, @message)
  `);
    stmtMarkRead = db.prepare("UPDATE contact_messages SET isRead = 1 WHERE id = ?");
    stmtDelete = db.prepare("DELETE FROM contact_messages WHERE id = ?");
}

// Public: submit a contact message
export const submitMessage = (req: Request, res: Response) => {
    initStmts();
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) return res.status(400).json({ message: "name, email, and message are required" });
    const result = stmtInsert.run({ name, email, subject: subject || "", message });
    res.status(201).json({ id: result.lastInsertRowid, message: "Message sent successfully!" });
};

// Admin: get all messages
export const getMessages = (_req: Request, res: Response) => {
    initStmts();
    const messages = stmtAll.all();
    const { count: unread } = stmtUnread.get() as { count: number };
    res.json({ messages, unread });
};

// Admin: mark a message as read
export const markAsRead = (req: Request, res: Response) => {
    initStmts();
    const msg = stmtOne.get(req.params.id);
    if (!msg) return res.status(404).json({ message: "Message not found" });
    stmtMarkRead.run(req.params.id);
    res.json({ message: "Marked as read" });
};

// Admin: delete a message
export const deleteMessage = (req: Request, res: Response) => {
    initStmts();
    const result = stmtDelete.run(req.params.id);
    if (result.changes > 0) res.json({ message: "Deleted" });
    else res.status(404).json({ message: "Message not found" });
};
