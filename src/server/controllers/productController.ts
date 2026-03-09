import { Request, Response } from "express";
import { db } from "../db/index.ts";

// ── Lazy-initialized prepared statements ────────────────────────────────────
// db.prepare() must NOT run at module load time — tables may not exist yet.
// initStmts() is called inside each handler (no-op after first call).
let stmtCount: ReturnType<typeof db.prepare>;
let stmtList: ReturnType<typeof db.prepare>;
let stmtById: ReturnType<typeof db.prepare>;
let stmtInsert: ReturnType<typeof db.prepare>;
let stmtFindForUpdate: ReturnType<typeof db.prepare>;
let stmtUpdate: ReturnType<typeof db.prepare>;
let stmtDelete: ReturnType<typeof db.prepare>;

function initStmts() {
  if (stmtCount) return; // already initialized
  stmtCount = db.prepare(
    "SELECT COUNT(*) as count FROM products WHERE name LIKE ? AND category LIKE ?"
  );
  stmtList = db.prepare(
    "SELECT id, name, category, price, discount, images, stock, ratings, numReviews FROM products WHERE name LIKE ? AND category LIKE ? LIMIT ? OFFSET ?"
  );
  stmtById = db.prepare("SELECT * FROM products WHERE id = ?");
  stmtInsert = db.prepare(
    "INSERT INTO products (name, price, description, images, category, stock) VALUES (?, ?, ?, ?, ?, ?)"
  );
  stmtFindForUpdate = db.prepare("SELECT * FROM products WHERE id = ?");
  stmtUpdate = db.prepare(
    "UPDATE products SET name = ?, price = ?, description = ?, images = ?, category = ?, stock = ? WHERE id = ?"
  );
  stmtDelete = db.prepare("DELETE FROM products WHERE id = ?");
}

// ── Controllers ─────────────────────────────────────────────────────────────

export const getProducts = (req: Request, res: Response) => {
  initStmts();
  const keyword = req.query.keyword ? `%${req.query.keyword}%` : "%";
  const category = req.query.category ? `%${req.query.category}%` : "%";

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  const { count: totalProducts } = stmtCount.get(keyword, category) as { count: number };
  const totalPages = Math.ceil(totalProducts / limit);
  const products = stmtList.all(keyword, category, limit, offset);

  res.set("Cache-Control", "public, max-age=10, stale-while-revalidate=60");
  res.json({ products, page, totalPages, totalProducts });
};

export const getProductById = (req: Request, res: Response) => {
  initStmts();
  const product = stmtById.get(req.params.id);
  if (product) {
    res.set("Cache-Control", "public, max-age=30, stale-while-revalidate=120");
    res.json(product);
  } else {
    res.status(404).json({ message: "Product not found" });
  }
};

export const createProduct = (req: Request, res: Response) => {
  initStmts();
  const { name, price, description, images, image, category, stock } = req.body;
  // Accept either 'images' (array string) or 'image' (single URL)
  const imagesJson = images ?? JSON.stringify([image]);
  const result = stmtInsert.run(name, price, description, imagesJson, category, stock);
  if (result.lastInsertRowid) {
    res.status(201).json({ id: result.lastInsertRowid, ...req.body });
  } else {
    res.status(400).json({ message: "Invalid product data" });
  }
};

export const updateProduct = (req: Request, res: Response) => {
  initStmts();
  const { name, price, description, images, image, category, stock } = req.body;
  const product = stmtFindForUpdate.get(req.params.id) as any;
  if (product) {
    // Accept either 'images' (JSON string) or 'image' (single URL)
    const newImages = images ?? (image ? JSON.stringify([image]) : product.images);
    stmtUpdate.run(
      name ?? product.name,
      price ?? product.price,
      description ?? product.description,
      newImages,
      category ?? product.category,
      stock !== undefined ? stock : product.stock,
      req.params.id
    );
    res.json({ message: "Product updated" });
  } else {
    res.status(404).json({ message: "Product not found" });
  }
};

export const deleteProduct = (req: Request, res: Response) => {
  initStmts();
  const result = stmtDelete.run(req.params.id);
  if (result.changes > 0) {
    res.json({ message: "Product removed" });
  } else {
    res.status(404).json({ message: "Product not found" });
  }
};
