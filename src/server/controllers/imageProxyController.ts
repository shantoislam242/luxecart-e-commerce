import { Request, Response } from "express";
import https from "https";
import http from "http";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cache directory: <project-root>/image-cache/
const CACHE_DIR = path.join(__dirname, "../../../image-cache");
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

function getCacheKey(url: string): string {
    return crypto.createHash("md5").update(url).digest("hex");
}

function getCachePath(key: string, ext: string): string {
    return path.join(CACHE_DIR, `${key}.${ext}`);
}

// Detect extension from URL or default to jpg
function getExtFromUrl(url: string): string {
    const fm = new URL(url).searchParams.get("fm");
    if (fm) return fm;
    const p = url.split("?")[0];
    const last = p.split(".").pop()?.toLowerCase() || "jpg";
    return ["jpg", "jpeg", "png", "webp", "gif", "avif"].includes(last) ? last : "jpg";
}

export async function proxyImage(req: Request, res: Response) {
    const rawUrl = req.query.url as string;
    if (!rawUrl) return res.status(400).json({ error: "Missing url" });

    let parsedUrl: URL;
    try {
        parsedUrl = new URL(rawUrl);
    } catch {
        return res.status(400).json({ error: "Invalid URL" });
    }

    // Only allow Unsplash and similar image hosts
    const ALLOWED = ["images.unsplash.com", "i.pravatar.cc", "picsum.photos", "placehold.co"];
    if (!ALLOWED.some((h) => parsedUrl.hostname === h)) {
        return res.status(403).json({ error: "Host not allowed" });
    }

    const ext = getExtFromUrl(rawUrl);
    const key = getCacheKey(rawUrl);
    const cachePath = getCachePath(key, ext);

    // ── Serve from disk cache if it exists ──────────────────────────────────
    if (fs.existsSync(cachePath)) {
        const mimeMap: Record<string, string> = {
            webp: "image/webp", jpg: "image/jpeg", jpeg: "image/jpeg",
            png: "image/png", gif: "image/gif", avif: "image/avif",
        };
        res.set("Content-Type", mimeMap[ext] || "image/jpeg");
        res.set("Cache-Control", "public, max-age=604800, immutable"); // 7 days
        res.set("X-Cache", "HIT");
        return fs.createReadStream(cachePath).pipe(res);
    }

    // ── Fetch from upstream ──────────────────────────────────────────────────
    try {
        const response = await fetch(parsedUrl.toString(), {
            headers: {
                "User-Agent": "Mozilla/5.0 (LuxeCart Image Proxy)",
                "Accept": "image/webp,image/avif,image/*,*/*;q=0.8",
            },
        });

        if (!response.ok) {
            res.status(response.status || 502).end();
            return;
        }

        const contentType = response.headers.get("content-type") || "image/jpeg";
        res.set("Content-Type", contentType);
        res.set("Cache-Control", "public, max-age=604800, immutable");
        res.set("X-Cache", "MISS");

        const writeStream = fs.createWriteStream(cachePath);

        // Use Node streams to pipe the fetch Response body
        const { Readable } = await import("stream");
        const bodyStream = Readable.fromWeb(response.body as any);

        bodyStream.pipe(writeStream);
        bodyStream.pipe(res);

        writeStream.on("error", () => {
            if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
        });

    } catch (err: any) {
        console.error("[ImageProxy] Error:", err.message);
        if (!res.headersSent) res.status(502).end();
    }
}
