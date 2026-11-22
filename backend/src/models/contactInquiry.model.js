const mongoose = require("mongoose");

const contactInquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    subject: {
      type: String,
      default: "General Inquiry",
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["New", "In Progress", "Resolved"],
      default: "New",
    },
    adminNote: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ContactInquiry", contactInquirySchema);
