const express = require("express");
const {
  getSalesReport,
  getPurchaseReport,
  getInventoryReport,
  getProfitReport,
} = require("../controllers/reportController");
const { protect, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect, authorize("admin", "manager"));

router.get("/sales", getSalesReport);
router.get("/purchases", getPurchaseReport);
router.get("/inventory", getInventoryReport);
router.get("/profit", getProfitReport);

module.exports = router;
