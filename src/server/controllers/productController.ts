import { Request, Response } from "express";
import { db } from "../db/index.ts";

// ── Pre-compile all statements once at module load ─────────────────────────
// better-sqlite3 prepared statements are far faster than re-preparing each call.
const stmtCount = db.prepare(
  "SELECT COUNT(*) as count FROM products WHERE name LIKE ? AND category LIKE ?"
);
const stmtList = db.prepare(
  "SELECT id, name, category, price, discount, images, stock, ratings, numReviews FROM products WHERE name LIKE ? AND category LIKE ? LIMIT ? OFFSET ?"
);
const stmtByIdFull = db.prepare("SELECT * FROM products WHERE id = ?");
const stmtInsert = db.prepare(
  "INSERT INTO products (name, price, description, images, category, stock) VALUES (?, ?, ?, ?, ?, ?)"
);
const stmtFindForUpdate = db.prepare("SELECT * FROM products WHERE id = ?");
const stmtUpdate = db.prepare(
  "UPDATE products SET name = ?, price = ?, description = ?, images = ?, category = ?, stock = ? WHERE id = ?"
);
const stmtDelete = db.prepare("DELETE FROM products WHERE id = ?");

// ── Controllers ─────────────────────────────────────────────────────────────

export const getProducts = (req: Request, res: Response) => {
  const keyword = req.query.keyword ? `%${req.query.keyword}%` : "%";
  const category = req.query.category ? `%${req.query.category}%` : "%";

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  const { count: totalProducts } = stmtCount.get(keyword, category) as { count: number };
  const totalPages = Math.ceil(totalProducts / limit);
  const products = stmtList.all(keyword, category, limit, offset);

  // Cache for 10 s in the browser, revalidate in background (stale-while-revalidate)
  res.set("Cache-Control", "public, max-age=10, stale-while-revalidate=60");
  res.json({ products, page, totalPages, totalProducts });
};

export const getProductById = (req: Request, res: Response) => {
  const product = stmtByIdFull.get(req.params.id);
  if (product) {
    res.set("Cache-Control", "public, max-age=30, stale-while-revalidate=120");
    res.json(product);
  } else {
    res.status(404).json({ message: "Product not found" });
  }
};

export const createProduct = (req: Request, res: Response) => {
  const { name, price, description, image, category, stock } = req.body;
  const result = stmtInsert.run(name, price, description, JSON.stringify([image]), category, stock);
  if (result.lastInsertRowid) {
    res.status(201).json({ id: result.lastInsertRowid, ...req.body });
  } else {
    res.status(400).json({ message: "Invalid product data" });
  }
};

export const updateProduct = (req: Request, res: Response) => {
  const { name, price, description, image, category, stock } = req.body;
  const product = stmtFindForUpdate.get(req.params.id) as any;
  if (product) {
    stmtUpdate.run(
      name ?? product.name,
      price ?? product.price,
      description ?? product.description,
      image ? JSON.stringify([image]) : product.images,
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
  const result = stmtDelete.run(req.params.id);
  if (result.changes > 0) {
    res.json({ message: "Product removed" });
  } else {
    res.status(404).json({ message: "Product not found" });
  }
};
