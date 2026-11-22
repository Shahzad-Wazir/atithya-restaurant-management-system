const Order = require("../models/order.model");
const MenuItem = require("../models/menuItem.model");
const Coupon = require("../models/coupon.model");
const BillingConfig = require("../models/billingConfig.model");

const generateOrderNumber = () => {
  const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const randPart = Math.floor(1000 + Math.random() * 9000);
  return `ATH-${datePart}-${randPart}`;
};

const generateTransactionId = (method) => {
  const prefix = method === "UPI" ? "UPI" : method === "Card" ? "CRD" : "CSH";
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
};

// @desc   Create a new food order using live Admin BillingConfig
// @route  POST /api/orders
exports.createOrder = async (req, res) => {
  try {
    const {
      items,
      orderType = "Delivery",
      tableNumber = "",
      customerName,
      customerPhone,
      deliveryAddress,
      specialInstructions = "",
      paymentMethod = "UPI",
      couponCode = "",
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty" });
    }

    if (orderType === "Delivery" && (!deliveryAddress?.street || !deliveryAddress?.city)) {
      return res.status(400).json({ message: "Delivery address (street & city) is required" });
    }

    if (orderType === "Dine-In" && !tableNumber) {
      return res.status(400).json({ message: "Table number is required for Dine-In orders" });
    }

    // Fetch authoritative menu item prices & live billing config from MongoDB
    const itemIds = items.map((i) => i.menuItem || i._id);
    const [dbItems, billing] = await Promise.all([
      MenuItem.find({ _id: { $in: itemIds } }),
      BillingConfig.getActiveConfig(),
    ]);
    const dbMap = new Map(dbItems.map((d) => [d._id.toString(), d]));

    const validatedItems = [];
    let subtotal = 0;
    let maxPrepTime = 15;

    for (const reqItem of items) {
      const id = String(reqItem.menuItem || reqItem._id);
      const dbItem = dbMap.get(id);
      if (!dbItem) {
        return res.status(400).json({ message: "One or more items in your cart no longer exist" });
      }
      if (!dbItem.availability) {
        return res.status(400).json({ message: `${dbItem.name} is currently unavailable` });
      }
      const qty = Math.max(1, Number(reqItem.quantity) || 1);
      subtotal += dbItem.price * qty;
      if (dbItem.prepTime > maxPrepTime) maxPrepTime = dbItem.prepTime;

      validatedItems.push({
        menuItem: dbItem._id,
        name: dbItem.name,
        price: dbItem.price,
        image: dbItem.image?.url || "",
        dietary: dbItem.dietary || "Veg",
        quantity: qty,
        notes: reqItem.notes || "",
      });
    }

    // Apply coupon if provided
    let discount = 0;
    let appliedCode = "";
    if (couponCode && couponCode.trim()) {
      const coupon = await Coupon.findOne({
        code: couponCode.trim().toUpperCase(),
        isActive: true,
      });
      if (!coupon) {
        return res.status(400).json({ message: "Invalid or inactive coupon code" });
      }
      if (new Date(coupon.expiresAt) < new Date()) {
        return res.status(400).json({ message: "This coupon has expired" });
      }
      if (coupon.usedCount >= coupon.usageLimit) {
        return res.status(400).json({ message: "Coupon usage limit reached" });
      }
      if (subtotal < coupon.minOrderAmount) {
        return res.status(400).json({
          message: `Minimum order of ₹${coupon.minOrderAmount} required for ${coupon.code}`,
        });
      }

      if (coupon.discountType === "percentage") {
        discount = Math.round((subtotal * coupon.discountValue) / 100);
        if (coupon.maxDiscount > 0 && discount > coupon.maxDiscount) {
          discount = coupon.maxDiscount;
        }
      } else {
        discount = Math.min(subtotal, coupon.discountValue);
      }
      appliedCode = coupon.code;
      coupon.usedCount += 1;
      await coupon.save();
    }

    // Server-side dynamic billing calculation from Admin BillingConfig
    const taxableAmount = Math.max(0, subtotal - discount);
    const gstRate = Number(billing.gstRate) || 0;
    const tax = Math.round((taxableAmount * gstRate) / 100);

    const deliveryFee =
      orderType === "Delivery"
        ? billing.freeDeliveryAbove > 0 && subtotal >= billing.freeDeliveryAbove
          ? 0
          : Number(billing.deliveryFee) || 0
        : 0;

    const packagingFee =
      orderType === "Delivery" || orderType === "Takeaway"
        ? Number(billing.packagingFee) || 0
        : 0;

    const convenienceFee =
      billing.convenienceFeeValue > 0
        ? billing.convenienceFeeType === "percentage"
          ? Math.round((taxableAmount * billing.convenienceFeeValue) / 100)
          : Number(billing.convenienceFeeValue)
        : 0;

    const serviceCharge =
      orderType === "Dine-In" && billing.dineInServiceChargePercent > 0
        ? Math.round((taxableAmount * billing.dineInServiceChargePercent) / 100)
        : 0;

    const customCharges = [];
    let customChargesTotal = 0;
    for (const c of billing.customCharges || []) {
      if (!c.isActive) continue;
      if (c.applyTo !== "All" && c.applyTo !== orderType) continue;
      const amt =
        c.type === "percentage"
          ? Math.round((taxableAmount * c.value) / 100)
          : Math.round(Number(c.value) || 0);
      if (amt > 0) {
        customCharges.push({ name: c.name, amount: amt });
        customChargesTotal += amt;
      }
    }

    const totalAmount =
      taxableAmount +
      tax +
      deliveryFee +
      packagingFee +
      convenienceFee +
      serviceCharge +
      customChargesTotal;

    const isInstantPaid = paymentMethod === "UPI" || paymentMethod === "Card";
    const initialStatus = isInstantPaid ? "Confirmed" : "Pending";

    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      user: req.user._id,
      items: validatedItems,
      orderType,
      tableNumber: orderType === "Dine-In" ? tableNumber.trim().toUpperCase() : "",
      customerName: (customerName || req.user.name).trim(),
      customerPhone: (customerPhone || req.user.phone || "").trim(),
      deliveryAddress: orderType === "Delivery" ? deliveryAddress : {},
      specialInstructions: specialInstructions.trim(),
      subtotal,
      gstRate,
      tax,
      deliveryFee,
      packagingFee,
      convenienceFee,
      serviceCharge,
      customCharges,
      discount,
      couponCode: appliedCode,
      totalAmount,
      invoiceMeta: {
        legalName: billing.legalName,
        gstin: billing.gstin,
        address: billing.invoiceAddress,
      },
      paymentMethod,
      paymentStatus: isInstantPaid ? "Paid" : "Pending",
      transactionId: generateTransactionId(paymentMethod),
      status: initialStatus,
      estimatedPrepMinutes: maxPrepTime + (orderType === "Delivery" ? 15 : 5),
      statusHistory: [
        {
          status: initialStatus,
          note: isInstantPaid
            ? `Order confirmed via ${paymentMethod}`
            : `Order placed (${paymentMethod})`,
        },
      ],
    });

    return res.status(201).json(order);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @desc   Get logged-in customer's orders
// @route  GET /api/orders/my
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.json(orders);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @desc   Get single order (owner, kitchen, or admin)
// @route  GET /api/orders/:id
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email phone");
    if (!order) return res.status(404).json({ message: "Order not found" });

    const isOwner = order.user?._id?.toString() === req.user._id.toString();
    if (!isOwner && !["admin", "kitchen"].includes(req.user.role)) {
      return res.status(403).json({ message: "Not authorized to view this order" });
    }

    return res.json(order);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @desc   Cancel order (customer only if Pending/Confirmed)
// @route  PATCH /api/orders/:id/cancel
exports.cancelMyOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to cancel this order" });
    }

    if (!["Pending", "Confirmed"].includes(order.status)) {
      return res.status(400).json({
        message: "Order cannot be cancelled once preparation has started",
      });
    }

    order.status = "Cancelled";
    if (order.paymentStatus === "Paid") order.paymentStatus = "Refunded";
    order.statusHistory.push({
      status: "Cancelled",
      note: req.body.reason || "Cancelled by customer",
    });

    await order.save();
    return res.json(order);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @desc   Get all orders (Admin & Kitchen)
// @route  GET /api/orders
exports.getAllOrders = async (req, res) => {
  try {
    const { status, orderType, search } = req.query;
    const filter = {};

    if (status && status !== "All") filter.status = status;
    if (orderType && orderType !== "All") filter.orderType = orderType;
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [
        { orderNumber: regex },
        { customerName: regex },
        { customerPhone: regex },
        { tableNumber: regex },
      ];
    }

    const orders = await Order.find(filter)
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });
    return res.json(orders);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @desc   Get active kitchen queue (KDS)
// @route  GET /api/orders/kitchen
exports.getKitchenQueue = async (req, res) => {
  try {
    const activeStatuses = ["Pending", "Confirmed", "Preparing", "Ready"];
    const orders = await Order.find({ status: { $in: activeStatuses } })
      .populate("user", "name phone")
      .sort({ createdAt: 1 });
    return res.json(orders);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @desc   Update order status / payment status (Admin & Kitchen)
// @route  PATCH /api/orders/:id/status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, paymentStatus, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (status && status !== order.status) {
      order.status = status;
      order.statusHistory.push({
        status,
        note: note || `Updated by ${req.user.role} (${req.user.name})`,
      });
      if (["Delivered", "Served"].includes(status) && order.paymentStatus === "Pending") {
        order.paymentStatus = "Paid";
      }
      if (status === "Cancelled" && order.paymentStatus === "Paid") {
        order.paymentStatus = "Refunded";
      }
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    await order.save();
    return res.json(order);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
