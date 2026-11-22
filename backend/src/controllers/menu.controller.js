const MenuItem = require("../models/menuItem.model");
const Review = require("../models/review.model");
const cloudinary = require("../config/cloudinary");

// @desc   Get all menu items with rich filtering & sorting
// @route  GET /api/menu
exports.getMenuItems = async (req, res) => {
  try {
    const {
      category,
      search,
      dietary,
      spiceLevel,
      featured,
      bestseller,
      availableOnly,
      minPrice,
      maxPrice,
      sort,
    } = req.query;

    const filter = {};

    if (category && category !== "All") filter.category = category;
    if (dietary && dietary !== "All") filter.dietary = dietary;
    if (spiceLevel && spiceLevel !== "All") filter.spiceLevel = spiceLevel;
    if (featured === "true") filter.isFeatured = true;
    if (bestseller === "true") filter.isBestseller = true;
    if (availableOnly === "true") filter.availability = true;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [{ name: regex }, { description: regex }, { category: regex }];
    }

    let sortObj = { isFeatured: -1, createdAt: -1 };
    if (sort === "price_asc") sortObj = { price: 1 };
    else if (sort === "price_desc") sortObj = { price: -1 };
    else if (sort === "rating") sortObj = { rating: -1, ratingCount: -1 };
    else if (sort === "newest") sortObj = { createdAt: -1 };

    const items = await MenuItem.find(filter).sort(sortObj);
    return res.json(items);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @desc   Get single menu item with reviews
// @route  GET /api/menu/:id
exports.getMenuItemById = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Menu item not found" });

    const reviews = await Review.find({ menuItem: item._id })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 });

    return res.json({ ...item.toObject(), reviews });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @desc   Create menu item (Admin)
// @route  POST /api/menu
exports.createMenuItem = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      price,
      availability,
      dietary,
      spiceLevel,
      prepTime,
      calories,
      isFeatured,
      isBestseller,
      imageUrl,
    } = req.body;

    if (!name || !description || !category || price === undefined) {
      return res.status(400).json({
        message: "Name, description, category, and price are required",
      });
    }

    const image = req.file?.path
      ? { url: req.file.path, public_id: req.file.filename || "" }
      : imageUrl
      ? { url: imageUrl.trim(), public_id: "" }
      : { url: "", public_id: "" };

    const item = await MenuItem.create({
      name: name.trim(),
      description: description.trim(),
      category,
      price: Number(price),
      availability: availability !== undefined ? availability === "true" || availability === true : true,
      dietary: dietary || "Veg",
      spiceLevel: spiceLevel || "Medium",
      prepTime: prepTime ? Number(prepTime) : 15,
      calories: calories ? Number(calories) : 0,
      isFeatured: isFeatured === "true" || isFeatured === true,
      isBestseller: isBestseller === "true" || isBestseller === true,
      image,
    });

    return res.status(201).json(item);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @desc   Update menu item (Admin)
// @route  PUT /api/menu/:id
exports.updateMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Menu item not found" });

    const fields = [
      "name",
      "description",
      "category",
      "dietary",
      "spiceLevel",
    ];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) item[f] = req.body[f];
    });

    if (req.body.price !== undefined) item.price = Number(req.body.price);
    if (req.body.prepTime !== undefined) item.prepTime = Number(req.body.prepTime);
    if (req.body.calories !== undefined) item.calories = Number(req.body.calories);
    if (req.body.availability !== undefined) {
      item.availability = req.body.availability === "true" || req.body.availability === true;
    }
    if (req.body.isFeatured !== undefined) {
      item.isFeatured = req.body.isFeatured === "true" || req.body.isFeatured === true;
    }
    if (req.body.isBestseller !== undefined) {
      item.isBestseller = req.body.isBestseller === "true" || req.body.isBestseller === true;
    }

    if (req.file?.path) {
      if (item.image?.public_id) {
        await cloudinary.uploader.destroy(item.image.public_id).catch(() => {});
      }
      item.image = { url: req.file.path, public_id: req.file.filename || "" };
    } else if (req.body.imageUrl && req.body.imageUrl.trim()) {
      item.image = { url: req.body.imageUrl.trim(), public_id: "" };
    }

    const updated = await item.save();
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @desc   Delete menu item (Admin)
// @route  DELETE /api/menu/:id
exports.deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Menu item not found" });

    if (item.image?.public_id) {
      await cloudinary.uploader.destroy(item.image.public_id).catch(() => {});
    }

    await Review.deleteMany({ menuItem: item._id });
    await item.deleteOne();
    return res.json({ message: "Menu item deleted" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
