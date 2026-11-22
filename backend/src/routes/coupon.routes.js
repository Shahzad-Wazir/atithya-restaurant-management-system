const router = require("express").Router();
const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const {
  getActiveCoupons,
  validateCoupon,
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} = require("../controllers/coupon.controller");

router.get("/active", getActiveCoupons);
router.post("/validate", validateCoupon);
router.get("/", protect, authorize("admin"), getAllCoupons);
router.post("/", protect, authorize("admin"), createCoupon);
router.put("/:id", protect, authorize("admin"), updateCoupon);
router.delete("/:id", protect, authorize("admin"), deleteCoupon);

module.exports = router;
