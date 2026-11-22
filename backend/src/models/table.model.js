const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema(
  {
    tableNumber: {
      type: String,
      required: [true, "Table number is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      default: "",
      trim: true,
    },
    capacity: {
      type: Number,
      required: [true, "Table capacity is required"],
      min: 1,
      max: 24,
    },
    zone: {
      type: String,
      enum: ["Indoor", "Outdoor", "VIP Lounge", "Rooftop"],
      default: "Indoor",
    },
    status: {
      type: String,
      enum: ["Available", "Reserved", "Occupied", "Maintenance"],
      default: "Available",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Table", tableSchema);
