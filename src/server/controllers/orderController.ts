import { Response } from "express";
import { db } from "../db/index.ts";
import { AuthRequest } from "../middleware/auth.ts";

export const addOrderItems = async (req: AuthRequest, res: Response) => {
  const { orderItems, shippingAddress, paymentMethod, totalPrice } = req.body;

  if (orderItems && orderItems.length === 0) {
    return res.status(400).json({ message: "No order items" });
  }

  const transaction = db.transaction(() => {
    const orderResult = db.prepare(`
      INSERT INTO orders (userId, shippingAddress, paymentMethod, totalPrice)
      VALUES (?, ?, ?, ?)
    `).run(req.user.id, JSON.stringify(shippingAddress), paymentMethod, totalPrice);

    const orderId = orderResult.lastInsertRowid;

    const insertItem = db.prepare(`
      INSERT INTO order_items (orderId, productId, name, quantity, price, image)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const item of orderItems) {
      insertItem.run(orderId, item.productId, item.name, item.quantity, item.price, item.image);
    }

    return orderId;
  });

  try {
    const orderId = transaction();
    res.status(201).json({ id: orderId });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Failed to create order" });
  }
};

export const getOrderById = async (req: AuthRequest, res: Response) => {
  const order: any = db.prepare(`
    SELECT o.*, u.name, u.email 
    FROM orders o 
    JOIN users u ON o.userId = u.id 
    WHERE o.id = ?
  `).get(req.params.id);

  if (order) {
    const items = db.prepare("SELECT * FROM order_items WHERE orderId = ?").all(req.params.id);
    res.json({ ...order, orderItems: items });
  } else {
    res.status(404).json({ message: "Order not found" });
  }
};

export const updateOrderToPaid = async (req: AuthRequest, res: Response) => {
  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(req.params.id);

  if (order) {
    db.prepare(`
      UPDATE orders 
      SET isPaid = 1, paidAt = ? 
      WHERE id = ?
    `).run(new Date().toISOString(), req.params.id);

    res.json({ message: "Order paid" });
  } else {
    res.status(404).json({ message: "Order not found" });
  }
};

export const getMyOrders = async (req: AuthRequest, res: Response) => {
  const orders = db.prepare("SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC").all(req.user.id);
  res.json(orders);
};

export const getOrders = async (req: AuthRequest, res: Response) => {
  const orders = db.prepare(`
    SELECT o.*, u.name 
    FROM orders o 
    JOIN users u ON o.userId = u.id 
    ORDER BY o.createdAt DESC
  `).all();
  res.json(orders);
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  const { status } = req.body;
  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(req.params.id);

  if (order) {
    db.prepare("UPDATE orders SET orderStatus = ? WHERE id = ?").run(status, req.params.id);
    res.json({ message: "Order status updated" });
  } else {
    res.status(404).json({ message: "Order not found" });
  }
};
