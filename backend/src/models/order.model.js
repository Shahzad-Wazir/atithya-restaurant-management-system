const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuItem",
      required: true,
    },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, default: "" },
    dietary: { type: String, default: "Veg" },
    quantity: { type: Number, required: true, min: 1 },
    notes: { type: String, default: "", trim: true },
  },
  { _id: false }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    note: { type: String, default: "" },
  },
  { _id: false }
);

const appliedChargeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: {
      type: [orderItemSchema],
      validate: [(arr) => arr.length > 0, "Order must contain at least one item"],
    },
    orderType: {
      type: String,
      enum: ["Dine-In", "Takeaway", "Delivery"],
      default: "Delivery",
    },
    tableNumber: {
      type: String,
      default: "",
      trim: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerPhone: {
      type: String,
      default: "",
      trim: true,
    },
    deliveryAddress: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      pincode: { type: String, default: "" },
    },
    specialInstructions: {
      type: String,
      default: "",
      trim: true,
    },
    subtotal: { type: Number, required: true, min: 0 },
    gstRate: { type: Number, default: 5, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    deliveryFee: { type: Number, default: 0, min: 0 },
    packagingFee: { type: Number, default: 0, min: 0 },
    convenienceFee: { type: Number, default: 0, min: 0 },
    serviceCharge: { type: Number, default: 0, min: 0 },
    customCharges: [appliedChargeSchema],
    discount: { type: Number, default: 0, min: 0 },
    couponCode: { type: String, default: "", uppercase: true },
    totalAmount: { type: Number, required: true, min: 0 },
    invoiceMeta: {
      legalName: { type: String, default: "Atithya Hospitality Pvt. Ltd." },
      gstin: { type: String, default: "19AABCA9012K1Z5" },
      address: { type: String, default: "24 Park Mansion, Park Street, Kolkata" },
    },
    paymentMethod: {
      type: String,
      enum: ["UPI", "Card", "Cash on Delivery", "Pay at Table"],
      default: "UPI",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Refunded", "Failed"],
      default: "Pending",
    },
    transactionId: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "Preparing",
        "Ready",
        "Out for Delivery",
        "Served",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
    },
    estimatedPrepMinutes: {
      type: Number,
      default: 25,
    },
    statusHistory: [statusHistorySchema],
  },
  { timestamps: true }
);

orderSchema.index({ createdAt: -1, status: 1 });

module.exports = mongoose.model("Order", orderSchema);
