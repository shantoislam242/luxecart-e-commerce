import express from "express";
import {
    getBlogPosts,
    getAllBlogPosts,
    getBlogPostById,
    createBlogPost,
    updateBlogPost,
    deleteBlogPost,
} from "../controllers/blogController.ts";

const router = express.Router();

// Public
router.get("/", getBlogPosts);
router.get("/:id", getBlogPostById);

// Admin
router.get("/admin/all", getAllBlogPosts);
router.post("/", createBlogPost);
router.put("/:id", updateBlogPost);
router.delete("/:id", deleteBlogPost);

export default router;
