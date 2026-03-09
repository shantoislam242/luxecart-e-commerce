import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db/index.ts";
import { AuthRequest } from "../middleware/auth.ts";

const generateToken = (id: number) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "secret", {
    expiresIn: "30d",
  });
};

export const registerUser = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const userExists = db.prepare("SELECT * FROM users WHERE email = ?").get(email);

  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const result = db.prepare(`
    INSERT INTO users (name, email, password)
    VALUES (?, ?, ?)
  `).run(name, email, hashedPassword);

  if (result.lastInsertRowid) {
    res.status(201).json({
      id: result.lastInsertRowid,
      name,
      email,
      role: "user",
      token: generateToken(Number(result.lastInsertRowid)),
    });
  } else {
    res.status(400).json({ message: "Invalid user data" });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  console.log(`Login attempt for: ${email}`, { passwordProvided: !!password });

  const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);

  if (!user) {
    console.log(`User not found: ${email}`);
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  console.log(`Password match for ${email}: ${isMatch}`);

  if (isMatch) {
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user.id),
    });
  } else {
    res.status(401).json({ message: "Invalid email or password" });
  }
};

export const getUserProfile = async (req: AuthRequest, res: Response) => {
  const user: any = db.prepare("SELECT id, name, email, role, address FROM users WHERE id = ?").get(req.user.id);

  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: "User not found" });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  const userId = req.params.id || req.user.id;

  // Prevent deleting other users unless admin
  if (req.user.role !== "admin" && req.user.id !== Number(userId)) {
    return res.status(401).json({ message: "Not authorized to delete this account" });
  }

  const result = db.prepare("DELETE FROM users WHERE id = ?").run(userId);

  if (result.changes > 0) {
    res.json({ message: "User deleted successfully" });
  } else {
    res.status(404).json({ message: "User not found" });
  }
};

export const getUsers = async (req: AuthRequest, res: Response) => {
  const users = db.prepare("SELECT id, name, email, role, createdAt FROM users").all();
  res.json(users);
};

export const updateUserRole = async (req: AuthRequest, res: Response) => {
  const { role } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id);

  if (user) {
    db.prepare("UPDATE users SET role = ? WHERE id = ?").run(role, req.params.id);
    res.json({ message: "User role updated" });
  } else {
    res.status(404).json({ message: "User not found" });
  }
};

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  const totalRevenue = db.prepare("SELECT SUM(totalPrice) as total FROM orders WHERE isPaid = 1").get() as any;
  const totalOrders = db.prepare("SELECT COUNT(*) as count FROM orders").get() as any;
  const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users").get() as any;
  const totalProducts = db.prepare("SELECT COUNT(*) as count FROM products").get() as any;

  // Sales by month (last 6 months)
  const salesData = db.prepare(`
    SELECT strftime('%Y-%m', createdAt) as month, SUM(totalPrice) as total 
    FROM orders 
    WHERE isPaid = 1 
    GROUP BY month 
    ORDER BY month DESC 
    LIMIT 6
  `).all();

  res.json({
    revenue: totalRevenue.total || 0,
    orders: totalOrders.count,
    users: totalUsers.count,
    products: totalProducts.count,
    salesData: salesData.reverse()
  });
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Both current and new password are required" });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: "New password must be at least 6 characters" });
  }

  const user: any = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) return res.status(401).json({ message: "Current password is incorrect" });

  const hashed = await bcrypt.hash(newPassword, 10);
  db.prepare("UPDATE users SET password = ? WHERE id = ?").run(hashed, req.user.id);

  res.json({ message: "Password changed successfully" });
};

