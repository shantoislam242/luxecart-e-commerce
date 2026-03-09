import { Request, Response } from "express";
import { Product } from "../models/index.ts";

export const getProducts = async (req: Request, res: Response) => {
  try {
    const keyword = req.query.keyword
      ? { name: { $regex: req.query.keyword, $options: "i" } }
      : {};

    const category = req.query.category && req.query.category !== ""
      ? { category: { $regex: req.query.category, $options: "i" } }
      : {};

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const query = { ...keyword, ...category };

    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limit);
    const products = await Product.find(query)
      .limit(limit)
      .skip(offset)
      .select("id name category price discount images stock ratings numReviews");

    // Map _id to id
    const mappedProducts = products.map((p) => {
      const pObj = p.toJSON() as any;
      pObj.id = pObj._id;
      return pObj;
    });

    res.set("Cache-Control", "public, max-age=10, stale-while-revalidate=60");
    res.json({ products: mappedProducts, page, totalPages, totalProducts });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      const pObj = product.toJSON() as any;
      pObj.id = pObj._id;
      res.set("Cache-Control", "public, max-age=30, stale-while-revalidate=120");
      res.json(pObj);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, price, description, images, image, category, stock } = req.body;
    let newImages = [];
    if (images && Array.isArray(images)) {
      newImages = images;
    } else if (images && typeof images === "string") {
      try { newImages = JSON.parse(images); } catch (e) { }
    } else if (image) {
      newImages = [image];
    }

    const product = await Product.create({
      name, price, description, images: newImages, category, stock
    });

    res.status(201).json({ id: product._id, ...req.body });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { name, price, description, images, image, category, stock } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      let newImages = product.images;
      if (images && Array.isArray(images)) {
        newImages = images;
      } else if (images && typeof images === "string") {
        try { newImages = JSON.parse(images); } catch (e) { }
      } else if (image) {
        newImages = [image];
      }

      product.name = name ?? product.name;
      product.price = price ?? product.price;
      product.description = description ?? product.description;
      product.images = newImages;
      product.category = category ?? product.category;
      product.stock = stock !== undefined ? stock : product.stock;

      await product.save();
      res.json({ message: "Product updated" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (product) {
      res.json({ message: "Product removed" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
