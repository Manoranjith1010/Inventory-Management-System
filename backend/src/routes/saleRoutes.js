const express = require("express");
const { createSale, listSales, getSaleById } = require("../controllers/saleController");
const { protect, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", listSales);
router.get("/:id", getSaleById);
router.post("/", authorize("admin", "manager", "staff"), createSale);

module.exports = router;
