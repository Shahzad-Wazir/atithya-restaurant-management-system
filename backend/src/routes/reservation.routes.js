const router = require("express").Router();
const protect = require("../middleware/auth.middleware");
const { optionalProtect } = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const {
  createReservation,
  getMyReservations,
  cancelReservation,
  getAllReservations,
  updateReservationStatus,
} = require("../controllers/reservation.controller");

router.post("/", optionalProtect, createReservation);
router.get("/my", protect, getMyReservations);
router.patch("/:id/cancel", protect, cancelReservation);
router.get("/", protect, authorize("admin", "kitchen"), getAllReservations);
router.patch("/:id/status", protect, authorize("admin"), updateReservationStatus);

module.exports = router;
