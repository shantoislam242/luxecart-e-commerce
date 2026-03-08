import express from "express";
import { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  deleteUser,
  getUsers,
  updateUserRole,
  getDashboardStats
} from "../controllers/authController.ts";
import { protect, admin } from "../middleware/auth.ts";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getUserProfile);
router.delete("/:id", protect, deleteUser);

// Admin routes
router.get("/users", protect, admin, getUsers);
router.put("/users/:id/role", protect, admin, updateUserRole);
router.get("/stats", protect, admin, getDashboardStats);

export default router;
