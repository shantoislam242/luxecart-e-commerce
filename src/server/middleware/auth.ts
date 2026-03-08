import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db } from "../db/index.ts";

export interface AuthRequest extends Request {
  user?: any;
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer")) {
    try {
      const token = authHeader.split(" ")[1];
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "secret");

      const user = db.prepare("SELECT id, name, email, role FROM users WHERE id = ?").get(decoded.id);

      if (!user) {
        return res.status(401).json({ message: "Not authorized, user not found" });
      }

      req.user = user;
      return next(); // ← return here so we never fall through
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};


export const admin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(401).json({ message: "Not authorized as an admin" });
  }
};
