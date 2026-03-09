import { Request, Response } from "express";
import { db } from "../db/index.ts";

// Lazy-initialized prepared statements (so initDB() runs before tables are used)
let stmtAll: ReturnType<typeof db.prepare>;
let stmtPub: ReturnType<typeof db.prepare>;
let stmtOne: ReturnType<typeof db.prepare>;
let stmtInsert: ReturnType<typeof db.prepare>;
let stmtUpdate: ReturnType<typeof db.prepare>;
let stmtDelete: ReturnType<typeof db.prepare>;

function initStmts() {
    if (stmtAll) return;
    stmtAll = db.prepare("SELECT * FROM blog_posts ORDER BY createdAt DESC");
    stmtPub = db.prepare("SELECT * FROM blog_posts WHERE published = 1 ORDER BY createdAt DESC");
    stmtOne = db.prepare("SELECT * FROM blog_posts WHERE id = ?");
    stmtInsert = db.prepare(`
    INSERT INTO blog_posts (title, slug, excerpt, content, category, author, authorImg, coverImg, readTime, published)
    VALUES (@title, @slug, @excerpt, @content, @category, @author, @authorImg, @coverImg, @readTime, @published)
  `);
    stmtUpdate = db.prepare(`
    UPDATE blog_posts SET title=@title, slug=@slug, excerpt=@excerpt, content=@content,
      category=@category, author=@author, authorImg=@authorImg, coverImg=@coverImg,
      readTime=@readTime, published=@published
    WHERE id=@id
  `);
    stmtDelete = db.prepare("DELETE FROM blog_posts WHERE id = ?");
}

// Public: all published posts
export const getBlogPosts = (_req: Request, res: Response) => {
    initStmts();
    res.set("Cache-Control", "public, max-age=10, stale-while-revalidate=60");
    res.json(stmtPub.all());
};

// Admin: all posts including drafts
export const getAllBlogPosts = (_req: Request, res: Response) => {
    initStmts();
    res.json(stmtAll.all());
};

export const getBlogPostById = (req: Request, res: Response) => {
    initStmts();
    const post = stmtOne.get(req.params.id);
    if (post) res.json(post);
    else res.status(404).json({ message: "Post not found" });
};

export const createBlogPost = (req: Request, res: Response) => {
    initStmts();
    const { title, slug, excerpt, content, category, author, authorImg, coverImg, readTime, published } = req.body;
    if (!title || !slug) return res.status(400).json({ message: "title and slug required" });
    try {
        const result = stmtInsert.run({ title, slug, excerpt, content, category, author, authorImg, coverImg, readTime, published: published ? 1 : 0 });
        res.status(201).json({ id: result.lastInsertRowid });
    } catch (err: any) {
        if (err.code === "SQLITE_CONSTRAINT_UNIQUE") return res.status(409).json({ message: "Slug already exists" });
        res.status(500).json({ message: "Failed to create post" });
    }
};

export const updateBlogPost = (req: Request, res: Response) => {
    initStmts();
    const existing = stmtOne.get(req.params.id) as any;
    if (!existing) return res.status(404).json({ message: "Post not found" });
    const { title, slug, excerpt, content, category, author, authorImg, coverImg, readTime, published } = req.body;
    stmtUpdate.run({
        id: req.params.id,
        title: title ?? existing.title,
        slug: slug ?? existing.slug,
        excerpt: excerpt ?? existing.excerpt,
        content: content ?? existing.content,
        category: category ?? existing.category,
        author: author ?? existing.author,
        authorImg: authorImg ?? existing.authorImg,
        coverImg: coverImg ?? existing.coverImg,
        readTime: readTime ?? existing.readTime,
        published: published !== undefined ? (published ? 1 : 0) : existing.published,
    });
    res.json({ message: "Updated" });
};

export const deleteBlogPost = (req: Request, res: Response) => {
    initStmts();
    const result = stmtDelete.run(req.params.id);
    if (result.changes > 0) res.json({ message: "Deleted" });
    else res.status(404).json({ message: "Post not found" });
};
