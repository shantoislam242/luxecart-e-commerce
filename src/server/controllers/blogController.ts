import { Request, Response } from "express";
import { BlogPost } from "../models/index.ts";

// Public: all published posts
export const getBlogPosts = async (_req: Request, res: Response) => {
    try {
        const posts = await BlogPost.find({ published: true }).sort({ createdAt: -1 });
        const mapped = posts.map(p => {
            const obj = p.toJSON() as any;
            obj.id = obj._id;
            return obj;
        });

        res.set("Cache-Control", "public, max-age=10, stale-while-revalidate=60");
        res.json(mapped);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Admin: all posts including drafts
export const getAllBlogPosts = async (_req: Request, res: Response) => {
    try {
        const posts = await BlogPost.find({}).sort({ createdAt: -1 });
        const mapped = posts.map(p => {
            const obj = p.toJSON() as any;
            obj.id = obj._id;
            return obj;
        });

        res.json(mapped);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getBlogPostById = async (req: Request, res: Response) => {
    try {
        const post = await BlogPost.findById(req.params.id);
        if (post) {
            const obj = post.toJSON() as any;
            obj.id = obj._id;
            res.json(obj);
        } else {
            res.status(404).json({ message: "Post not found" });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createBlogPost = async (req: Request, res: Response) => {
    try {
        const { title, slug, excerpt, content, category, author, authorImg, coverImg, readTime, published } = req.body;
        if (!title || !slug) return res.status(400).json({ message: "title and slug required" });

        const exist = await BlogPost.findOne({ slug });
        if (exist) return res.status(409).json({ message: "Slug already exists" });

        const post = await BlogPost.create({
            title, slug, excerpt, content, category, author, authorImg, coverImg, readTime, published
        });

        res.status(201).json({ id: post._id });
    } catch (error: any) {
        res.status(500).json({ message: "Failed to create post", error: error.message });
    }
};

export const updateBlogPost = async (req: Request, res: Response) => {
    try {
        const { title, slug, excerpt, content, category, author, authorImg, coverImg, readTime, published } = req.body;
        const post = await BlogPost.findById(req.params.id);

        if (!post) return res.status(404).json({ message: "Post not found" });

        if (title !== undefined) post.title = title;
        if (slug !== undefined) post.slug = slug;
        if (excerpt !== undefined) post.excerpt = excerpt;
        if (content !== undefined) post.content = content;
        if (category !== undefined) post.category = category;
        if (author !== undefined) post.author = author;
        if (authorImg !== undefined) post.authorImg = authorImg;
        if (coverImg !== undefined) post.coverImg = coverImg;
        if (readTime !== undefined) post.readTime = readTime;
        if (published !== undefined) post.published = published;

        await post.save();
        res.json({ message: "Updated" });
    } catch (error: any) {
        res.status(500).json({ message: "Failed to update post", error: error.message });
    }
};

export const deleteBlogPost = async (req: Request, res: Response) => {
    try {
        const post = await BlogPost.findByIdAndDelete(req.params.id);
        if (post) res.json({ message: "Deleted" });
        else res.status(404).json({ message: "Post not found" });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
