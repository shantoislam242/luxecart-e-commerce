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

  // ── Gzip / Brotli compression — shrinks responses by ~70% ──
  app.use(compression());
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));

  // API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/newsletter", newsletterRoutes);

  // Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  if (process.env.NODE_ENV === "production") {
    // Long-lived cache for hashed static assets (fonts, images, JS chunks)
    app.use(
      "/assets",
      express.static(path.join(__dirname, "dist", "assets"), {
        maxAge: "30d",
        immutable: true,
      })
    );
    // Serve everything else (index.html, etc.) without long cache
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (_req, res) =>
      res.sendFile(path.join(__dirname, "dist", "index.html"))
    );
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
