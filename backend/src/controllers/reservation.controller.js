const Reservation = require("../models/reservation.model");
const Table = require("../models/table.model");

const generateBookingCode = () => {
  const rand = Math.floor(1000 + Math.random() * 9000);
  const tag = Date.now().toString(36).slice(-3).toUpperCase();
  return `ATH-RES-${tag}${rand}`;
};

// @desc   Create a table reservation (with double-booking prevention)
// @route  POST /api/reservations
exports.createReservation = async (req, res) => {
  try {
    const {
      guestName,
      guestEmail,
      guestPhone,
      tableId,
      date,
      timeSlot,
      partySize,
      zone = "Indoor",
      occasion = "None",
      specialRequests = "",
    } = req.body;

    if (!guestName || !guestEmail || !guestPhone || !date || !timeSlot || !partySize) {
      return res.status(400).json({
        message: "Guest details, date, time slot, and party size are required",
      });
    }

    const size = Number(partySize);
    if (size < 1 || size > 20) {
      return res.status(400).json({ message: "Party size must be between 1 and 20" });
    }

    // Find tables already reserved for this date & timeSlot
    const existing = await Reservation.find({
      date,
      timeSlot,
      status: { $in: ["Pending", "Confirmed", "Seated"] },
    }).select("table");
    const bookedIds = new Set(existing.map((r) => r.table.toString()));

    let assignedTable = null;

    if (tableId) {
      const requested = await Table.findById(tableId);
      if (!requested || !requested.isActive || requested.status === "Maintenance") {
        return res.status(400).json({ message: "Selected table is unavailable" });
      }
      if (requested.capacity < size) {
        return res.status(400).json({
          message: `Selected table accommodates up to ${requested.capacity} guests`,
        });
      }
      if (bookedIds.has(requested._id.toString())) {
        return res.status(409).json({
          message: "This table was just booked for that time slot. Please choose another table or slot.",
        });
      }
      assignedTable = requested;
    } else {
      // Auto-assign smallest fitting available table in requested zone (or any zone fallback)
      const candidates = await Table.find({
        isActive: true,
        status: { $ne: "Maintenance" },
        capacity: { $gte: size },
        ...(zone && zone !== "All" ? { zone } : {}),
      }).sort({ capacity: 1, tableNumber: 1 });

      assignedTable = candidates.find((t) => !bookedIds.has(t._id.toString()));

      if (!assignedTable) {
        return res.status(409).json({
          message: "No tables available for the selected date, time, and zone. Try another slot or zone.",
        });
      }
    }

    const reservation = await Reservation.create({
      bookingCode: generateBookingCode(),
      user: req.user?._id || null,
      guestName: guestName.trim(),
      guestEmail: guestEmail.toLowerCase().trim(),
      guestPhone: guestPhone.trim(),
      table: assignedTable._id,
      date,
      timeSlot,
      partySize: size,
      zone: assignedTable.zone,
      occasion,
      specialRequests: specialRequests.trim(),
      status: "Confirmed",
    });

    const populated = await reservation.populate("table", "tableNumber name capacity zone");
    return res.status(201).json(populated);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @desc   Get logged-in user's reservations
// @route  GET /api/reservations/my
exports.getMyReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({
      $or: [{ user: req.user._id }, { guestEmail: req.user.email }],
    })
      .populate("table", "tableNumber name capacity zone")
      .sort({ date: -1, timeSlot: -1 });

    return res.json(reservations);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @desc   Cancel user's own reservation
// @route  PATCH /api/reservations/:id/cancel
exports.cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ message: "Reservation not found" });

    const isOwner =
      reservation.user?.toString() === req.user._id.toString() ||
      reservation.guestEmail === req.user.email;

    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to cancel this reservation" });
    }

    if (["Completed", "Cancelled"].includes(reservation.status)) {
      return res.status(400).json({ message: "Reservation is already finalized" });
    }

    reservation.status = "Cancelled";
    await reservation.save();

    const populated = await reservation.populate("table", "tableNumber name capacity zone");
    return res.json(populated);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @desc   Get all reservations (Admin)
// @route  GET /api/reservations
exports.getAllReservations = async (req, res) => {
  try {
    const { date, status, search } = req.query;
    const filter = {};
    if (date) filter.date = date;
    if (status && status !== "All") filter.status = status;
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [
        { bookingCode: regex },
        { guestName: regex },
        { guestPhone: regex },
        { guestEmail: regex },
      ];
    }

    const reservations = await Reservation.find(filter)
      .populate("table", "tableNumber name capacity zone status")
      .populate("user", "name email")
      .sort({ date: -1, timeSlot: 1 });

    return res.json(reservations);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @desc   Update reservation status (Admin) & sync table floor status
// @route  PATCH /api/reservations/:id/status
exports.updateReservationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ message: "Reservation not found" });

    reservation.status = status;
    await reservation.save();

    // Sync physical table status for live floor management
    if (reservation.table) {
      if (status === "Seated") {
        await Table.findByIdAndUpdate(reservation.table, { status: "Occupied" });
      } else if (["Completed", "Cancelled", "No-Show"].includes(status)) {
        await Table.findByIdAndUpdate(reservation.table, { status: "Available" });
      }
    }

    const populated = await reservation.populate("table", "tableNumber name capacity zone status");
    return res.json(populated);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
