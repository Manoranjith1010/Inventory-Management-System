const express = require("express");
const { createPurchase, listPurchases, getPurchaseById } = require("../controllers/purchaseController");
const { protect, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", listPurchases);
router.get("/:id", getPurchaseById);
router.post("/", authorize("admin", "manager", "staff"), createPurchase);

module.exports = router;
