const { z } = require("zod");
const Product = require("../models/Product");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");

const productSchema = z.object({
  name: z.string().min(2),
  sku: z.string().min(2),
  category: z.string().optional(),
  brand: z.string().optional(),
  purchasePrice: z.number().min(0),
  sellingPrice: z.number().min(0),
  quantity: z.number().int().min(0),
  barcode: z.string().optional(),
  lowStockThreshold: z.number().int().min(0).optional(),
  supplier: z.string().optional(),
});

const listProducts = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Math.min(Number(req.query.limit || 10), 100);
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.category) filter.category = req.query.category;
  if (req.query.brand) filter.brand = req.query.brand;
  if (req.query.lowStock === "true") filter.$expr = { $lte: ["$quantity", "$lowStockThreshold"] };
  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: "i" } },
      { sku: { $regex: req.query.search, $options: "i" } },
      { barcode: { $regex: req.query.search, $options: "i" } },
    ];
  }

  const [items, total] = await Promise.all([
    Product.find(filter).populate("supplier", "companyName").sort({ createdAt: -1 }).skip(skip).limit(limit),
    Product.countDocuments(filter),
  ]);

  return res.status(200).json({
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate("supplier", "companyName");
  if (!product) {
    throw new ApiError(404, "Product not found");
  }
  return res.status(200).json(product);
});

const createProduct = asyncHandler(async (req, res) => {
  const data = productSchema.parse(req.body);
  const product = await Product.create({ ...data, createdBy: req.user._id });
  return res.status(201).json(product);
});

const updateProduct = asyncHandler(async (req, res) => {
  const data = productSchema.partial().parse(req.body);
  const product = await Product.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
  if (!product) {
    throw new ApiError(404, "Product not found");
  }
  return res.status(200).json(product);
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }
  return res.status(200).json({ message: "Product deleted" });
});

const findByBarcode = asyncHandler(async (req, res) => {
  const { barcode } = req.params;
  const product = await Product.findOne({ barcode });
  if (!product) {
    throw new ApiError(404, "Product not found for barcode");
  }
  return res.status(200).json(product);
});

module.exports = {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  findByBarcode,
};
