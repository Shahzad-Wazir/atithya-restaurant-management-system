const Review = require("../models/review.model");
const MenuItem = require("../models/menuItem.model");
const Order = require("../models/order.model");

const recalculateItemRating = async (menuItemId) => {
  const stats = await Review.aggregate([
    { $match: { menuItem: menuItemId } },
    {
      $group: {
        _id: "$menuItem",
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await MenuItem.findByIdAndUpdate(menuItemId, {
      rating: Number(stats[0].avgRating.toFixed(1)),
      ratingCount: stats[0].count,
    });
  } else {
    await MenuItem.findByIdAndUpdate(menuItemId, {
      rating: 0,
      ratingCount: 0,
    });
  }
};

// @desc   Get reviews for a menu item
// @route  GET /api/reviews/:menuItemId
exports.getItemReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ menuItem: req.params.menuItemId })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 });
    return res.json(reviews);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @desc   Create or update a review for a menu item
// @route  POST /api/reviews/:menuItemId
exports.upsertReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { menuItemId } = req.params;

    if (!rating || rating < 1 || rating > 5 || !comment?.trim()) {
      return res.status(400).json({ message: "Rating (1-5) and comment are required" });
    }

    const item = await MenuItem.findById(menuItemId);
    if (!item) return res.status(404).json({ message: "Menu item not found" });

    // Check if user has ordered this dish before
    const hasOrdered = await Order.exists({
      user: req.user._id,
      "items.menuItem": item._id,
      status: { $ne: "Cancelled" },
    });

    const review = await Review.findOneAndUpdate(
      { user: req.user._id, menuItem: item._id },
      {
        rating: Number(rating),
        comment: comment.trim(),
        isVerifiedOrder: Boolean(hasOrdered),
      },
      { new: true, upsert: true, runValidators: true }
    ).populate("user", "name avatar");

    await recalculateItemRating(item._id);
    return res.status(201).json(review);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @desc   Delete review (owner or admin)
// @route  DELETE /api/reviews/:id
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    if (review.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this review" });
    }

    const menuItemId = review.menuItem;
    await review.deleteOne();
    await recalculateItemRating(menuItemId);

    return res.json({ message: "Review deleted" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
