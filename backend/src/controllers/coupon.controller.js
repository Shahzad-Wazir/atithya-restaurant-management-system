const Coupon = require("../models/coupon.model");

// @desc   Get active public coupons
// @route  GET /api/coupons/active
exports.getActiveCoupons = async (req, res) => {
  try {
    const now = new Date();
    const coupons = await Coupon.find({
      isActive: true,
      expiresAt: { $gt: now },
      $expr: { $lt: ["$usedCount", "$usageLimit"] },
    }).sort({ createdAt: -1 });
    return res.json(coupons);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @desc   Validate a coupon code against a subtotal
// @route  POST /api/coupons/validate
exports.validateCoupon = async (req, res) => {
  try {
    const { code, subtotal = 0 } = req.body;
    if (!code || !code.trim()) {
      return res.status(400).json({ message: "Please enter a coupon code" });
    }

    const coupon = await Coupon.findOne({
      code: code.trim().toUpperCase(),
      isActive: true,
    });

    if (!coupon) {
      return res.status(404).json({ message: "Coupon code not found or inactive" });
    }
    if (new Date(coupon.expiresAt) < new Date()) {
      return res.status(400).json({ message: "This coupon has expired" });
    }
    if (coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: "This coupon has reached its usage limit" });
    }
    if (Number(subtotal) < coupon.minOrderAmount) {
      return res.status(400).json({
        message: `Add ₹${coupon.minOrderAmount - Number(subtotal)} more to use ${coupon.code}`,
      });
    }

    let discount = 0;
    if (coupon.discountType === "percentage") {
      discount = Math.round((Number(subtotal) * coupon.discountValue) / 100);
      if (coupon.maxDiscount > 0 && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = Math.min(Number(subtotal), coupon.discountValue);
    }

    return res.json({
      valid: true,
      code: coupon.code,
      description: coupon.description,
      discount,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @desc   Get all coupons (Admin)
// @route  GET /api/coupons
exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return res.json(coupons);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @desc   Create coupon (Admin)
// @route  POST /api/coupons
exports.createCoupon = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderAmount = 0,
      maxDiscount = 0,
      usageLimit = 500,
      expiresAt,
      isActive = true,
    } = req.body;

    if (!code || !discountType || !discountValue || !expiresAt) {
      return res.status(400).json({
        message: "Code, discount type, value, and expiry date are required",
      });
    }

    const exists = await Coupon.findOne({ code: code.trim().toUpperCase() });
    if (exists) {
      return res.status(400).json({ message: "Coupon code already exists" });
    }

    const coupon = await Coupon.create({
      code: code.trim().toUpperCase(),
      description: description?.trim() || "",
      discountType,
      discountValue: Number(discountValue),
      minOrderAmount: Number(minOrderAmount),
      maxDiscount: Number(maxDiscount),
      usageLimit: Number(usageLimit),
      expiresAt: new Date(expiresAt),
      isActive: Boolean(isActive),
    });

    return res.status(201).json(coupon);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @desc   Update coupon (Admin)
// @route  PUT /api/coupons/:id
exports.updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    return res.json(coupon);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @desc   Delete coupon (Admin)
// @route  DELETE /api/coupons/:id
exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    await coupon.deleteOne();
    return res.json({ message: "Coupon deleted" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
