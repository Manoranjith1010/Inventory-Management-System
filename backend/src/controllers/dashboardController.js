const Product = require("../models/Product");
const Sale = require("../models/Sale");
const Purchase = require("../models/Purchase");
const asyncHandler = require("../utils/asyncHandler");

const getDashboard = asyncHandler(async (req, res) => {
  const today = new Date();
  const dayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const [
    totalProducts,
    categoryStats,
    lowStockItems,
    todaySales,
    monthlySales,
    inventoryAggregation,
    recentSales,
    recentPurchases,
  ] = await Promise.all([
    Product.countDocuments(),
    Product.distinct("category"),
    Product.find({ $expr: { $lte: ["$quantity", "$lowStockThreshold"] } }).select("name sku quantity lowStockThreshold"),
    Sale.aggregate([
      { $match: { createdAt: { $gte: dayStart } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]),
    Sale.aggregate([
      { $match: { createdAt: { $gte: monthStart } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]),
    Product.aggregate([
      {
        $group: {
          _id: null,
          value: { $sum: { $multiply: ["$quantity", "$purchasePrice"] } },
        },
      },
    ]),
    Sale.find().sort({ createdAt: -1 }).limit(5).populate("soldBy", "name"),
    Purchase.find().sort({ createdAt: -1 }).limit(5).populate("supplier", "companyName"),
  ]);

  res.status(200).json({
    totalProducts,
    totalCategories: categoryStats.filter(Boolean).length,
    lowStockItems,
    todaysSales: todaySales[0]?.total || 0,
    monthlyRevenue: monthlySales[0]?.total || 0,
    inventoryValue: inventoryAggregation[0]?.value || 0,
    recentSales,
    recentPurchases,
  });
});

module.exports = { getDashboard };
