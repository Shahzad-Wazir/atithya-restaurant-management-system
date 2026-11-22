const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
  {
    bookingCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    guestName: {
      type: String,
      required: [true, "Guest name is required"],
      trim: true,
    },
    guestEmail: {
      type: String,
      required: [true, "Guest email is required"],
      lowercase: true,
      trim: true,
    },
    guestPhone: {
      type: String,
      required: [true, "Guest phone is required"],
      trim: true,
    },
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
      required: [true, "Table assignment is required"],
    },
    date: {
      type: String,
      required: [true, "Reservation date is required"], // YYYY-MM-DD
    },
    timeSlot: {
      type: String,
      required: [true, "Time slot is required"], // e.g. "19:30"
    },
    partySize: {
      type: Number,
      required: [true, "Party size is required"],
      min: 1,
      max: 20,
    },
    zone: {
      type: String,
      enum: ["Indoor", "Outdoor", "VIP Lounge", "Rooftop"],
      default: "Indoor",
    },
    occasion: {
      type: String,
      enum: [
        "None",
        "Birthday",
        "Anniversary",
        "Business Dinner",
        "Family Gathering",
        "Date Night",
      ],
      default: "None",
    },
    specialRequests: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Seated", "Completed", "Cancelled", "No-Show"],
      default: "Confirmed",
    },
  },
  { timestamps: true }
);

reservationSchema.index({ date: 1, timeSlot: 1, table: 1 });

module.exports = mongoose.model("Reservation", reservationSchema);
