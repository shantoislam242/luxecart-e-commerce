import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cors from "cors";
import compression from "compression";

// Routes
import authRoutes from "./src/server/routes/auth.ts";
import productRoutes from "./src/server/routes/products.ts";
import orderRoutes from "./src/server/routes/orders.ts";
import newsletterRoutes from "./src/server/routes/newsletter.ts";
import blogRoutes from "./src/server/routes/blog.ts";
import teamRoutes from "./src/server/routes/team.ts";
import messagesRoutes from "./src/server/routes/messages.ts";
import uploadRoutes from "./src/server/routes/upload.ts";
import { proxyImage } from "./src/server/controllers/imageProxyController.ts";
import { initDB } from "./src/server/db/index.ts";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize Database
  try {
    console.log("Initializing database...");
    initDB();
    console.log("Database initialized.");
  } catch (err) {
    console.error("Failed to initialize database:", err);
  }

  // ── Gzip compression — shrinks JSON responses by ~70% ──
  app.use(compression());
  app.use(cors());
  app.use(express.json());

  // API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/newsletter", newsletterRoutes);
  app.use("/api/blog", blogRoutes);
  app.use("/api/team", teamRoutes);
  app.use("/api/messages", messagesRoutes);
  app.use("/api/upload", uploadRoutes);          // Image upload (multer)
  app.get("/api/img", proxyImage);               // External image proxy

  // Serve uploaded images as static files (with 7-day cache)
  app.use("/uploads", express.static(path.join(__dirname, "public/uploads"), {
    maxAge: "7d",
    immutable: true,
  }));

  // Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  if (process.env.NODE_ENV === "production") {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`API server running on http://localhost:${PORT}`);
    if (process.env.NODE_ENV !== "production") {
      console.log(`Frontend (Vite) running on http://localhost:5173`);
    }
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
