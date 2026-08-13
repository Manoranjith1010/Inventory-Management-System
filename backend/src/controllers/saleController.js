const { z } = require("zod");
const Sale = require("../models/Sale");
const Product = require("../models/Product");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");
const { withTransaction, applySaleItems } = require("../services/inventoryService");

const saleSchema = z.object({
  customerName: z.string().min(2),
  paymentStatus: z.enum(["pending", "paid", "failed"]).optional(),
  items: z.array(
    z.object({
      product: z.string(),
      quantity: z.number().int().min(1),
    })
  ).min(1),
});

const generateInvoiceNumber = () => `SAL-${Date.now()}-${Math.floor(Math.random() * 9999)}`;

const createSale = asyncHandler(async (req, res) => {
  const data = saleSchema.parse(req.body);

  const products = await Product.find({ _id: { $in: data.items.map((item) => item.product) } });
  const priceMap = new Map(products.map((p) => [String(p._id), p.sellingPrice]));

  if (products.length !== data.items.length) {
    throw new ApiError(400, "One or more products are invalid");
  }

  const items = data.items.map((item) => {
    const unitPrice = priceMap.get(item.product);

    if (typeof unitPrice !== "number") {
      throw new ApiError(400, "Invalid pricing for one or more products");
    }

    return {
      ...item,
      unitPrice,
      lineTotal: unitPrice * item.quantity,
    };
  });

  const totalAmount = items.reduce((sum, item) => sum + item.lineTotal, 0);

  const sale = await withTransaction(async (session) => {
    const created = await Sale.create(
      [
        {
          customerName: data.customerName,
          items,
          totalAmount,
          invoiceNumber: generateInvoiceNumber(),
          paymentStatus: data.paymentStatus || "pending",
          soldBy: req.user._id,
        },
      ],
      { session }
    );

    await applySaleItems({
      items,
      userId: req.user._id,
      referenceId: created[0]._id,
      session,
    });

    return created[0];
  });

  res.status(201).json(sale);
});

const listSales = asyncHandler(async (req, res) => {
  const sales = await Sale.find()
    .populate("items.product", "name sku")
    .populate("soldBy", "name email")
    .sort({ createdAt: -1 });
  res.status(200).json(sales);
});

const getSaleById = asyncHandler(async (req, res) => {
  const sale = await Sale.findById(req.params.id)
    .populate("items.product", "name sku")
    .populate("soldBy", "name email");

  if (!sale) {
    return res.status(404).json({ message: "Sale not found" });
  }

  res.status(200).json(sale);
});

module.exports = { createSale, listSales, getSaleById };
