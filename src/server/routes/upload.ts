import express from "express";
import multer from "multer";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { Readable } from "stream";
import { protect } from "../middleware/auth.ts";

// We will configure cloudinary dynamically when uploading to avoid ES module hoisting issues with dotenv
const configureCloudinary = () => {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
};

// Use memory storage for serverless environments
const storage = multer.memoryStorage();

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
});

const router = express.Router();

import fs from "fs";
import path from "path";
import crypto from "crypto";

// Ensure local uploads directory exists
const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(LOCAL_UPLOAD_DIR)) {
    fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });
}

// Helper to stream file to Cloudinary (or local fallback)
const uploadToCloudinary = async (buffer: Buffer, folder: string = "luxecart_uploads", originalName?: string): Promise<{ secure_url: string, public_id: string }> => {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

    // Fallback: If cloudinary is not configured, save locally
    if (!cloudName || cloudName === "your_cloud_name" || cloudName === "") {
        console.log("[upload] Cloudinary not configured. Using local filesystem fallback.");
        return new Promise((resolve, reject) => {
            try {
                // Generate a unique filename
                const ext = originalName ? path.extname(originalName) : ".jpg";
                const hash = crypto.randomBytes(8).toString("hex");
                const filename = `${Date.now()}-${hash}${ext}`;
                const filepath = path.join(LOCAL_UPLOAD_DIR, filename);

                fs.writeFileSync(filepath, buffer);

                // Return URL relative to the backend server (handled by static file serving in server.ts)
                const backendUrl = process.env.BACKEND_URL || "http://localhost:3000";
                resolve({
                    secure_url: `${backendUrl}/uploads/${filename}`,
                    public_id: `local_${filename}`
                });
            } catch (err) {
                reject(err);
            }
        });
    }

    // Normal Cloudinary upload
    return new Promise((resolve, reject) => {
        configureCloudinary(); // Ensure Cloudinary is loaded with updated env variables
        const stream = cloudinary.uploader.upload_stream(
            { folder },
            (error, result) => {
                if (error || !result) return reject(error || new Error("Upload failed"));
                resolve(result as any);
            }
        );
        const bufferStream = new Readable();
        bufferStream.push(buffer);
        bufferStream.push(null);
        bufferStream.pipe(stream);
    });
};

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
    async (req: any, res: any) => {
        if (!req.file) {
            return res.status(400).json({ message: "No image file received. Make sure to send a file with field name 'image'." });
        }

        try {
            console.log("[upload] Uploading image to Cloudinary...");
            const result = await uploadToCloudinary(req.file.buffer, "luxecart_uploads", req.file.originalname);
            console.log("[upload] Saved:", result.secure_url);
            res.json({ url: result.secure_url, filename: result.public_id });
        } catch (error: any) {
            console.error("[upload] Cloudinary error:", error);
            res.status(500).json({ message: "Failed to upload image to Cloudinary", error: error.message });
        }
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
    async (req: any, res: any) => {
        if (!req.files || (req.files as any[]).length === 0) {
            return res.status(400).json({ message: "No image files received." });
        }

        try {
            console.log("[upload] Uploading multiple images to Cloudinary...");
            const uploadPromises = (req.files as any[]).map((f) => uploadToCloudinary(f.buffer, "luxecart_uploads", f.originalname));
            const results = await Promise.all(uploadPromises);

            const urls = results.map((r) => r.secure_url);
            console.log("[upload] Saved multi:", urls);
            res.json({ urls });
        } catch (error: any) {
            console.error("[upload] Cloudinary multi upload error:", error);
            res.status(500).json({ message: "Failed to upload images to Cloudinary", error: error.message });
        }
    }
);

export default router;
