const router = require("express").Router();
const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const { createRateLimiter } = require("../middleware/security.middleware");
const {
  submitInquiry,
  getAllInquiries,
  updateInquiry,
  deleteInquiry,
} = require("../controllers/contact.controller");

const contactLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 20 });

router.post("/", contactLimiter, submitInquiry);
router.get("/", protect, authorize("admin"), getAllInquiries);
router.patch("/:id", protect, authorize("admin"), updateInquiry);
router.delete("/:id", protect, authorize("admin"), deleteInquiry);

module.exports = router;
