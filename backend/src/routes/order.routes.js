const router = require("express").Router();
const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelMyOrder,
  getAllOrders,
  getKitchenQueue,
  updateOrderStatus,
} = require("../controllers/order.controller");

router.post("/", protect, createOrder);
router.get("/my", protect, getMyOrders);
router.get("/kitchen", protect, authorize("kitchen", "admin"), getKitchenQueue);
router.get("/", protect, authorize("admin", "kitchen"), getAllOrders);
router.get("/:id", protect, getOrderById);
router.patch("/:id/cancel", protect, cancelMyOrder);
router.patch("/:id/status", protect, authorize("kitchen", "admin"), updateOrderStatus);

module.exports = router;
