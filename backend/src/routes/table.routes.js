const router = require("express").Router();
const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const {
  getTables,
  checkAvailability,
  createTable,
  updateTable,
  deleteTable,
} = require("../controllers/table.controller");

router.get("/availability", checkAvailability);
router.get("/", getTables);
router.post("/", protect, authorize("admin"), createTable);
router.put("/:id", protect, authorize("admin"), updateTable);
router.delete("/:id", protect, authorize("admin"), deleteTable);

module.exports = router;
