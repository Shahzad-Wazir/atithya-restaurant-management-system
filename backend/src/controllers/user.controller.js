const User = require("../models/user.model");

// @desc   Get all users (Admin)
// @route  GET /api/users
exports.getUsers = async (req, res) => {
  try {
    const { search, role } = req.query;
    const filter = {};

    if (role && role !== "All") filter.role = role;
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [{ name: regex }, { email: regex }, { phone: regex }];
    }

    const users = await User.find(filter).sort({ createdAt: -1 });
    return res.json(users);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @desc   Get single user by ID (Admin)
// @route  GET /api/users/:id
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @desc   Update user role or active status (Admin)
// @route  PUT /api/users/:id
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (req.body.role && ["user", "kitchen", "admin"].includes(req.body.role)) {
      user.role = req.body.role;
    }
    if (req.body.isActive !== undefined) {
      user.isActive = Boolean(req.body.isActive);
    }
    if (req.body.name !== undefined) user.name = req.body.name.trim();
    if (req.body.phone !== undefined) user.phone = req.body.phone.trim();

    const updated = await user.save();
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @desc   Delete user (Admin)
// @route  DELETE /api/users/:id
exports.deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot delete your own admin account" });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.deleteOne();
    return res.json({ message: "User deleted" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
