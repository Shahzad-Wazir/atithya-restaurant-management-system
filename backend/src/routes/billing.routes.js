const router = require("express").Router();
const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const {
  getBillingConfig,
  updateBillingConfig,
  getSalesReport,
} = require("../controllers/billing.controller");

router.get("/config", getBillingConfig);
router.put("/config", protect, authorize("admin"), updateBillingConfig);
router.get("/sales-report", protect, authorize("admin"), getSalesReport);

module.exports = router;
