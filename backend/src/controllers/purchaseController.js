const { z } = require("zod");
const Purchase = require("../models/Purchase");
const Supplier = require("../models/Supplier");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");
const { withTransaction, applyPurchaseItems } = require("../services/inventoryService");

const purchaseSchema = z.object({
  supplier: z.string(),
  items: z.array(
    z.object({
      product: z.string(),
      quantity: z.number().int().min(1),
      unitCost: z.number().min(0),
    })
  ).min(1),
});

const generateInvoiceNumber = () => `PUR-${Date.now()}-${Math.floor(Math.random() * 9999)}`;

const createPurchase = asyncHandler(async (req, res) => {
  const data = purchaseSchema.parse(req.body);
  const supplier = await Supplier.findById(data.supplier);
  if (!supplier) {
    throw new ApiError(404, "Supplier not found");
  }

  const items = data.items.map((item) => ({
    ...item,
    lineTotal: item.quantity * item.unitCost,
  }));
  const totalAmount = items.reduce((sum, item) => sum + item.lineTotal, 0);

  const purchase = await withTransaction(async (session) => {
    const created = await Purchase.create(
      [
        {
          supplier: data.supplier,
          items,
          totalAmount,
          invoiceNumber: generateInvoiceNumber(),
          purchasedBy: req.user._id,
          status: "received",
        },
      ],
      { session }
    );

    await applyPurchaseItems({
      items,
      userId: req.user._id,
      referenceId: created[0]._id,
      session,
    });

    return created[0];
  });

  res.status(201).json(purchase);
});

const listPurchases = asyncHandler(async (req, res) => {
  const purchases = await Purchase.find()
    .populate("supplier", "companyName")
    .populate("items.product", "name sku")
    .populate("purchasedBy", "name email")
    .sort({ createdAt: -1 });
  res.status(200).json(purchases);
});

const getPurchaseById = asyncHandler(async (req, res) => {
  const purchase = await Purchase.findById(req.params.id)
    .populate("supplier", "companyName")
    .populate("items.product", "name sku")
    .populate("purchasedBy", "name email");

  if (!purchase) {
    throw new ApiError(404, "Purchase not found");
  }

  res.status(200).json(purchase);
});

module.exports = { createPurchase, listPurchases, getPurchaseById };
