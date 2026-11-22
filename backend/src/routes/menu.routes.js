const express = require("express");
const router = express.Router();
const {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} = require("../controllers/menu.controller");
const protect = require("../middleware/auth.middleware");
const admin = require("../middleware/admin.middleware");
const upload = require("../middleware/upload.middleware");

router.get("/", getMenuItems);
router.get("/:id", getMenuItemById);

router.post("/", protect, admin, upload.single("image"), createMenuItem);
router.put("/:id", protect, admin, upload.single("image"), updateMenuItem);
router.delete("/:id", protect, admin, deleteMenuItem);

module.exports = router;
