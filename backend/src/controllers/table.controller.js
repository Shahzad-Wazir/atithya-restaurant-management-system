const Table = require("../models/table.model");
const Reservation = require("../models/reservation.model");

// @desc   Get all tables
// @route  GET /api/tables
exports.getTables = async (req, res) => {
  try {
    const { zone, activeOnly } = req.query;
    const filter = {};
    if (zone && zone !== "All") filter.zone = zone;
    if (activeOnly === "true") filter.isActive = true;

    const tables = await Table.find(filter).sort({ tableNumber: 1 });
    return res.json(tables);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @desc   Check available tables for a date, timeSlot, partySize, and optional zone
// @route  GET /api/tables/availability
exports.checkAvailability = async (req, res) => {
  try {
    const { date, timeSlot, partySize = 2, zone } = req.query;

    if (!date || !timeSlot) {
      return res.status(400).json({ message: "Date and timeSlot are required" });
    }

    const tableFilter = {
      isActive: true,
      status: { $ne: "Maintenance" },
      capacity: { $gte: Number(partySize) || 1 },
    };
    if (zone && zone !== "All") tableFilter.zone = zone;

    const candidateTables = await Table.find(tableFilter).sort({ capacity: 1, tableNumber: 1 });

    // Find tables already booked at the same date & timeSlot
    const conflictingReservations = await Reservation.find({
      date,
      timeSlot,
      status: { $in: ["Pending", "Confirmed", "Seated"] },
    }).select("table");

    const bookedTableIds = new Set(conflictingReservations.map((r) => r.table.toString()));

    const availableTables = candidateTables.filter(
      (t) => !bookedTableIds.has(t._id.toString())
    );

    return res.json({
      date,
      timeSlot,
      partySize: Number(partySize) || 1,
      availableCount: availableTables.length,
      tables: availableTables,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @desc   Create a table (Admin)
// @route  POST /api/tables
exports.createTable = async (req, res) => {
  try {
    const { tableNumber, name, capacity, zone, status } = req.body;
    if (!tableNumber || !capacity) {
      return res.status(400).json({ message: "Table number and capacity are required" });
    }

    const exists = await Table.findOne({ tableNumber: tableNumber.trim().toUpperCase() });
    if (exists) {
      return res.status(400).json({ message: `Table ${tableNumber} already exists` });
    }

    const table = await Table.create({
      tableNumber: tableNumber.trim().toUpperCase(),
      name: name?.trim() || `Table ${tableNumber.trim().toUpperCase()}`,
      capacity: Number(capacity),
      zone: zone || "Indoor",
      status: status || "Available",
    });

    return res.status(201).json(table);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @desc   Update table (Admin)
// @route  PUT /api/tables/:id
exports.updateTable = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) return res.status(404).json({ message: "Table not found" });

    const { tableNumber, name, capacity, zone, status, isActive } = req.body;
    if (tableNumber !== undefined) table.tableNumber = tableNumber.trim().toUpperCase();
    if (name !== undefined) table.name = name.trim();
    if (capacity !== undefined) table.capacity = Number(capacity);
    if (zone !== undefined) table.zone = zone;
    if (status !== undefined) table.status = status;
    if (isActive !== undefined) table.isActive = Boolean(isActive);

    const updated = await table.save();
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @desc   Delete table (Admin)
// @route  DELETE /api/tables/:id
exports.deleteTable = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) return res.status(404).json({ message: "Table not found" });

    await table.deleteOne();
    return res.json({ message: "Table removed" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
