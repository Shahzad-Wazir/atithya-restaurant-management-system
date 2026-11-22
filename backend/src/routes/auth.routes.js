const router = require("express").Router();
const protect = require("../middleware/auth.middleware");
const { createRateLimiter } = require("../middleware/security.middleware");
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  toggleFavorite,
} = require("../controllers/auth.controller");

const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 40,
  message: "Too many authentication attempts. Please try again shortly.",
});

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);
router.post("/favorites/:menuItemId", protect, toggleFavorite);

module.exports = router;
