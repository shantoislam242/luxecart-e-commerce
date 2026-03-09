import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { protect, admin } from "../middleware/auth.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Uploads directory: <project-root>/public/uploads/
const UPLOAD_DIR = path.join(__dirname, "../../../public/uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (_req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${unique}${ext}`);
    },
});

const fileFilter = (_req: any, file: any, cb: any) => {
    const allowed = /jpeg|jpg|png|webp|gif|avif/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) cb(null, true);
    else cb(new Error("Only image files are allowed (jpg, png, webp, gif, avif)"));
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
});

const router = express.Router();

// POST /api/upload  — admin only, single image
router.post("/", protect, admin, upload.single("image"), (req: any, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
    }
    // Return the public URL path
    const url = `/uploads/${req.file.filename}`;
    res.json({ url, filename: req.file.filename });
});

// POST /api/upload/multi  — admin only, up to 5 images
router.post("/multi", protect, admin, upload.array("images", 5), (req: any, res) => {
    if (!req.files || (req.files as any[]).length === 0) {
        return res.status(400).json({ message: "No image files provided" });
    }
    const urls = (req.files as any[]).map((f) => `/uploads/${f.filename}`);
    res.json({ urls });
});

// Error handler for multer size/type errors
router.use((err: any, _req: any, res: any, _next: any) => {
    res.status(400).json({ message: err.message });
});

export default router;
