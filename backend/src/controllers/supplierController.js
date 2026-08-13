const { z } = require("zod");
const Supplier = require("../models/Supplier");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");

const supplierSchema = z.object({
  companyName: z.string().min(2),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  isActive: z.boolean().optional(),
});

const listSuppliers = asyncHandler(async (req, res) => {
  const suppliers = await Supplier.find().sort({ createdAt: -1 });
  res.status(200).json(suppliers);
});

const getSupplierById = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);
  if (!supplier) {
    throw new ApiError(404, "Supplier not found");
  }
  res.status(200).json(supplier);
});

const createSupplier = asyncHandler(async (req, res) => {
  const data = supplierSchema.parse(req.body);
  const supplier = await Supplier.create(data);
  res.status(201).json(supplier);
});

const updateSupplier = asyncHandler(async (req, res) => {
  const data = supplierSchema.partial().parse(req.body);
  const supplier = await Supplier.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
  if (!supplier) {
    throw new ApiError(404, "Supplier not found");
  }
  res.status(200).json(supplier);
});

const deleteSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findByIdAndDelete(req.params.id);
  if (!supplier) {
    throw new ApiError(404, "Supplier not found");
  }
  res.status(200).json({ message: "Supplier deleted" });
});

module.exports = {
  listSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
};
