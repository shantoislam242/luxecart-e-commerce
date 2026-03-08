import { Request, Response } from "express";
import { db } from "../db/index.ts";

export const getProducts = async (req: Request, res: Response) => {
  const keyword = req.query.keyword ? `%${req.query.keyword}%` : "%";
  const category = req.query.category ? req.query.category : "%";

  const products = db.prepare(`
    SELECT * FROM products 
    WHERE name LIKE ? AND category LIKE ?
  `).all(keyword, category);

  res.json(products);
};

export const getProductById = async (req: Request, res: Response) => {
  const product = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);

  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: "Product not found" });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  const { name, price, description, image, category, stock } = req.body;

  const result = db.prepare(`
    INSERT INTO products (name, price, description, images, category, stock)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(name, price, description, JSON.stringify([image]), category, stock);

  if (result.lastInsertRowid) {
    res.status(201).json({ id: result.lastInsertRowid, ...req.body });
  } else {
    res.status(400).json({ message: "Invalid product data" });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  const { name, price, description, image, category, stock } = req.body;

  const product = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);

  if (product) {
    db.prepare(`
      UPDATE products 
      SET name = ?, price = ?, description = ?, images = ?, category = ?, stock = ?
      WHERE id = ?
    `).run(
      name || product.name,
      price || product.price,
      description || product.description,
      image ? JSON.stringify([image]) : product.images,
      category || product.category,
      stock !== undefined ? stock : product.stock,
      req.params.id
    );

    res.json({ message: "Product updated" });
  } else {
    res.status(404).json({ message: "Product not found" });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  const result = db.prepare("DELETE FROM products WHERE id = ?").run(req.params.id);

  if (result.changes > 0) {
    res.json({ message: "Product removed" });
  } else {
    res.status(404).json({ message: "Product not found" });
  }
};
