const express = require("express");
const authRoutes = require("./authRoutes");
const productRoutes = require("./productRoutes");
const supplierRoutes = require("./supplierRoutes");
const purchaseRoutes = require("./purchaseRoutes");
const saleRoutes = require("./saleRoutes");
const dashboardRoutes = require("./dashboardRoutes");
const reportRoutes = require("./reportRoutes");
const notificationRoutes = require("./notificationRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/suppliers", supplierRoutes);
router.use("/purchases", purchaseRoutes);
router.use("/sales", saleRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/reports", reportRoutes);
router.use("/notifications", notificationRoutes);

module.exports = router;
