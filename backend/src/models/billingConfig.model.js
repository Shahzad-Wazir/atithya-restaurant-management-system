const mongoose = require("mongoose");

const customChargeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ["flat", "percentage"], default: "flat" },
    value: { type: Number, required: true, min: 0 },
    applyTo: {
      type: String,
      enum: ["All", "Delivery", "Dine-In", "Takeaway"],
      default: "All",
    },
    isActive: { type: Boolean, default: true },
  },
  { _id: true }
);

const billingConfigSchema = new mongoose.Schema(
  {
    singletonKey: {
      type: String,
      default: "ATITHYA_BILLING_CONFIG",
      unique: true,
    },
    legalName: {
      type: String,
      default: "Atithya Hospitality Pvt. Ltd.",
      trim: true,
    },
    gstin: {
      type: String,
      default: "19AABCA9012K1Z5",
      trim: true,
      uppercase: true,
    },
    invoiceAddress: {
      type: String,
      default: "24 Park Mansion, Park Street, Kolkata, West Bengal 700016",
      trim: true,
    },
    // Admin-editable Homepage Hero Showcase (Image + Chef's Signature floating card)
    heroShowcase: {
      badge: { type: String, default: "Chef's Signature", trim: true },
      title: { type: String, default: "24-Hr Smoked Dal Makhani", trim: true },
      imageUrl: {
        type: String,
        default: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=900&q=85",
        trim: true,
      },
    },
    gstRate: {
      type: Number,
      default: 5,
      min: 0,
      max: 40,
    },
    deliveryFee: {
      type: Number,
      default: 40,
      min: 0,
    },
    freeDeliveryAbove: {
      type: Number,
      default: 599,
      min: 0,
    },
    packagingFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    convenienceFeeType: {
      type: String,
      enum: ["flat", "percentage"],
      default: "flat",
    },
    convenienceFeeValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    dineInServiceChargePercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 25,
    },
    customCharges: [customChargeSchema],
  },
  { timestamps: true }
);

billingConfigSchema.statics.getActiveConfig = async function () {
  let config = await this.findOne({ singletonKey: "ATITHYA_BILLING_CONFIG" });
  if (!config) {
    config = await this.create({ singletonKey: "ATITHYA_BILLING_CONFIG" });
  }
  return config;
};

module.exports = mongoose.model("BillingConfig", billingConfigSchema);
