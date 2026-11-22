const router = require("express").Router();
const protect = require("../middleware/auth.middleware");
const {
  getItemReviews,
  upsertReview,
  deleteReview,
} = require("../controllers/review.controller");

router.get("/:menuItemId", getItemReviews);
router.post("/:menuItemId", protect, upsertReview);
router.delete("/:id", protect, deleteReview);

module.exports = router;
