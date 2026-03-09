import { Response } from "express";
import { Order, User } from "../models/index.ts";
import { AuthRequest } from "../middleware/auth.ts";

export const addOrderItems = async (req: AuthRequest, res: Response) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, totalPrice } = req.body;

    if (orderItems && orderItems.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }

    const order = await Order.create({
      user: req.user.id,
      orderItems: orderItems.map((item: any) => ({
        ...item,
        product: item.productId // map productId to product reference
      })),
      shippingAddress: JSON.stringify(shippingAddress), // Depending on frontend format
      paymentMethod,
      totalPrice,
    });

    res.status(201).json({ id: order._id });
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ message: "Failed to create order", error: error.message });
  }
};

export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email");

    if (order) {
      // Return _id mapped to id for frontend compatibility
      const orderObj = order.toJSON() as any;
      orderObj.id = orderObj._id;
      if (orderObj.user) orderObj.user.id = orderObj.user._id;

      res.json(orderObj);
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderToPaid = async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isPaid = true;
      order.paidAt = new Date();
      await order.save();

      res.json({ message: "Order paid" });
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyOrders = async (req: AuthRequest, res: Response) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });

    // Map _id to id
    const mapped = orders.map(o => {
      const obj = o.toJSON() as any;
      obj.id = obj._id;
      return obj;
    });

    res.json(mapped);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    const orders = await Order.find({})
      .populate("user", "name")
      .sort({ createdAt: -1 });

    const mapped = orders.map((o: any) => {
      const obj = o.toJSON() as any;
      obj.id = obj._id;
      obj.name = o.user?.name || "Unknown"; // flatten name for frontend compatibility
      return obj;
    });

    res.json(mapped);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (order) {
      order.orderStatus = status;
      await order.save();
      res.json({ message: "Order status updated" });
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
