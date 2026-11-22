const User = require("../models/user.model");
const generateToken = require("../utils/generateToken");

const formatUserResponse = (user, includeToken = false) => {
  const payload = {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    role: user.role,
    avatar: user.avatar || "",
    savedAddresses: user.savedAddresses || [],
    favorites: user.favorites || [],
    createdAt: user.createdAt,
  };
  if (includeToken) {
    payload.token = generateToken(user._id);
  }
  return payload;
};

// @desc   Register new user
// @route  POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone ? phone.trim() : "",
    });

    return res.status(201).json(formatUserResponse(user, true));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @desc   Login user
// @route  POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.isActive === false) {
      return res.status(403).json({ message: "This account has been deactivated" });
    }

    return res.json(formatUserResponse(user, true));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @desc   Get current logged-in user
// @route  GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("favorites");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json(formatUserResponse(user, false));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @desc   Update user profile (name, email, phone, savedAddresses)
// @route  PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, phone, savedAddresses } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name !== undefined) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (email && email.toLowerCase().trim() !== user.email) {
      const taken = await User.findOne({ email: email.toLowerCase().trim() });
      if (taken) return res.status(400).json({ message: "Email already in use" });
      user.email = email.toLowerCase().trim();
    }
    if (Array.isArray(savedAddresses)) {
      user.savedAddresses = savedAddresses;
    }

    await user.save();
    return res.json(formatUserResponse(user, false));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @desc   Change password
// @route  PUT /api/auth/change-password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({
        message: "Current password and a new password (min 6 chars) are required",
      });
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!user || !(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    return res.json({ message: "Password updated successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @desc   Toggle dish in user's favorites
// @route  POST /api/auth/favorites/:menuItemId
exports.toggleFavorite = async (req, res) => {
  try {
    const { menuItemId } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const exists = user.favorites.some((id) => id.toString() === menuItemId);
    if (exists) {
      user.favorites = user.favorites.filter((id) => id.toString() !== menuItemId);
    } else {
      user.favorites.push(menuItemId);
    }
    await user.save();

    return res.json({
      favorites: user.favorites,
      isFavorite: !exists,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
