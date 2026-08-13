const express = require("express");
const {
  listSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} = require("../controllers/supplierController");
const { protect, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", listSuppliers);
router.get("/:id", getSupplierById);
router.post("/", authorize("admin", "manager"), createSupplier);
router.put("/:id", authorize("admin", "manager"), updateSupplier);
router.delete("/:id", authorize("admin"), deleteSupplier);

module.exports = router;
