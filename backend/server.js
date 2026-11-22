require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");
const {
  securityHeaders,
  sanitizeRequest,
  createRateLimiter,
} = require("./src/middleware/security.middleware");

const authRoutes = require("./src/routes/auth.routes");
const menuRoutes = require("./src/routes/menu.routes");
const userRoutes = require("./src/routes/user.routes");
const dashboardRoutes = require("./src/routes/dashboard.routes");
const orderRoutes = require("./src/routes/order.routes");
const tableRoutes = require("./src/routes/table.routes");
const reservationRoutes = require("./src/routes/reservation.routes");
const reviewRoutes = require("./src/routes/review.routes");
const couponRoutes = require("./src/routes/coupon.routes");
const contactRoutes = require("./src/routes/contact.routes");
const billingRoutes = require("./src/routes/billing.routes");

const app = express();
app.set("trust proxy", 1);

app.use(securityHeaders);

const normalizeOrigin = (url) => (url ? url.trim().replace(/\/+$/, "") : "");

const envOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map(normalizeOrigin)
  .filter(Boolean);

const allowedOrigins = [
  normalizeOrigin(process.env.CLIENT_URL),
  ...envOrigins,
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(normalizeOrigin(origin))) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(sanitizeRequest);

app.use("/api", createRateLimiter({ windowMs: 15 * 60 * 1000, max: 500 }));

app.get("/", (req, res) =>
  res.json({
    brand: "Atithya",
    tagline: "Fine Dining & Hospitality Management API",
    status: "healthy",
    version: "2.2.0",
  })
);

app.get("/api/health", (req, res) =>
  res.json({ status: "ok", uptime: process.uptime(), timestamp: new Date().toISOString() })
);

app.use("/api/auth", authRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/billing", billingRoutes);

app.use((req, res) => res.status(404).json({ message: "API route not found" }));

app.use((err, req, res, next) => {
  if (process.env.NODE_ENV !== "production") {
    console.error(err.stack);
  }
  if (err.message?.startsWith("CORS blocked")) {
    return res.status(403).json({ message: err.message });
  }
  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid resource identifier" });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "Field";
    return res.status(400).json({ message: `${field} already exists` });
  }
  return res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

if (!process.env.JWT_SECRET) {
  console.warn("WARNING: JWT_SECRET is not set in environment variables.");
}

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Atithya API Server running on port ${PORT}`));
});