import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { protect } from "../middleware/auth.ts";

// Absolute base URL for serving uploaded files
// Set BACKEND_URL on Render: https://luxecart-e-commerce.onrender.com
const BACKEND_URL = (process.env.BACKEND_URL || "http://localhost:3000").replace(/\/$/, "");

// Use process.cwd() for reliable path resolution regardless of __dirname tricks
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

console.log("[upload] Upload directory:", UPLOAD_DIR);

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (_req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
        const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
        cb(null, `${unique}${ext}`);
    },
});

// Lenient file filter — accept any image/* or common extensions
const fileFilter = (_req: any, file: any, cb: any) => {
    const allowedMime = /^image\//;
    const allowedExt = /\.(jpe?g|png|webp|gif|avif|bmp|svg)$/i;
    const mimeOk = allowedMime.test(file.mimetype);
    const extOk = allowedExt.test(file.originalname);
    if (mimeOk || extOk) {
        cb(null, true);
    } else {
        cb(new Error(`File type not allowed: ${file.mimetype}`));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

const router = express.Router();

// POST /api/upload  — any authenticated user, single file
router.post(
    "/",
    protect,
    (req: any, res: any, next: any) => {
        upload.single("image")(req, res, (err: any) => {
            if (err) {
                console.error("[upload] Multer error:", err.message);
                return res.status(400).json({ message: err.message });
            }
            next();
        });
    },
    (req: any, res: any) => {
        console.log("[upload] req.file:", req.file);
        if (!req.file) {
            return res.status(400).json({ message: "No image file received. Make sure to send a file with field name 'image'." });
        }
        const url = `${BACKEND_URL}/uploads/${req.file.filename}`;
        console.log("[upload] Saved:", url);
        res.json({ url, filename: req.file.filename });
    }
);

// POST /api/upload/multi — up to 5 images
router.post(
    "/multi",
    protect,
    (req: any, res: any, next: any) => {
        upload.array("images", 5)(req, res, (err: any) => {
            if (err) {
                console.error("[upload] Multer error:", err.message);
                return res.status(400).json({ message: err.message });
            }
            next();
        });
    },
    (req: any, res: any) => {
        if (!req.files || (req.files as any[]).length === 0) {
            return res.status(400).json({ message: "No image files received." });
        }
        const urls = (req.files as any[]).map((f) => `${BACKEND_URL}/uploads/${f.filename}`);
        res.json({ urls });
    }
);

export default router;
