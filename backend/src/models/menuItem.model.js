const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Menu item name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Starter",
        "Main Course",
        "Breads & Rice",
        "Dessert",
        "Beverage",
        "Chef's Special",
      ],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0,
    },
    availability: {
      type: Boolean,
      default: true,
    },
    dietary: {
      type: String,
      enum: ["Veg", "Non-Veg", "Vegan", "Egg"],
      default: "Veg",
    },
    spiceLevel: {
      type: String,
      enum: ["None", "Mild", "Medium", "Spicy", "Extra Spicy"],
      default: "Medium",
    },
    prepTime: {
      type: Number,
      default: 15,
      min: 1,
    },
    calories: {
      type: Number,
      default: 0,
      min: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isBestseller: {
      type: Boolean,
      default: false,
    },
    image: {
      url: { type: String, default: "" },
      public_id: { type: String, default: "" },
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

menuItemSchema.index({ name: "text", description: "text", category: 1 });

module.exports = mongoose.model("MenuItem", menuItemSchema);
