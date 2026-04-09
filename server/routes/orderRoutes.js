const express = require("express");
const router = express.Router();
const { authorize } = require("../middleware/roleMiddleware");
const {
  createOrder,
  payOrder,
  deleteOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  changeOrderStatus,
  verifyPayment,
} = require("../controllers/orderController");

const { verifyToken } = require("../middleware/authMiddleware");

// Student Routes
router.post("/create", verifyToken, createOrder);
router.post("/pay/:orderId", verifyToken, payOrder);
router.delete("/delete/:orderId", verifyToken, deleteOrder);
router.get("/my", verifyToken, getMyOrders);
router.get("/:orderId", verifyToken, getOrderById);

// Staff/Admin Routes
router.get("/admin/all", verifyToken, authorize("staff", "admin"), getAllOrders);
router.patch("/status/:orderId", verifyToken, authorize("staff", "admin"), changeOrderStatus);
router.patch("/verify/:orderId", verifyToken, authorize("admin"), verifyPayment);

module.exports = router;


 