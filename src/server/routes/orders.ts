import express from "express";
import { 
  addOrderItems, 
  getOrderById, 
  updateOrderToPaid, 
  getMyOrders, 
  getOrders,
  updateOrderStatus
} from "../controllers/orderController.ts";
import { protect, admin } from "../middleware/auth.ts";

const router = express.Router();

router.post("/", protect, addOrderItems);
router.get("/myorders", protect, getMyOrders);
router.get("/:id", protect, getOrderById);
router.put("/:id/pay", protect, updateOrderToPaid);
router.get("/", protect, admin, getOrders);
router.put("/:id/status", protect, admin, updateOrderStatus);

export default router;
