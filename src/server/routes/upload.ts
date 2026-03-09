import express from "express";
import multer from "multer";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { Readable } from "stream";
import { protect } from "../middleware/auth.ts";

// Configure Cloudinary
// Ensure these environment variables are set in your .env or server (Vercel/Render) dashboard
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
});

const router = express.Router();

// Helper to stream file to Cloudinary
const uploadToCloudinary = (buffer: Buffer, folder: string = "luxecart_uploads"): Promise<UploadApiResponse> => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder },
            (error, result) => {
                if (error || !result) return reject(error || new Error("Upload failed"));
                resolve(result);
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
            const result = await uploadToCloudinary(req.file.buffer);
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
            const uploadPromises = (req.files as any[]).map((f) => uploadToCloudinary(f.buffer));
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
