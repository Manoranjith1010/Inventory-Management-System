const mongoose = require("mongoose");

const purchaseItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitCost: { type: Number, required: true, min: 0 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const purchaseSchema = new mongoose.Schema(
  {
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true },
    items: { type: [purchaseItemSchema], validate: [(v) => v.length > 0, "At least one item is required"] },
    totalAmount: { type: Number, required: true, min: 0 },
    invoiceNumber: { type: String, unique: true, required: true },
    status: { type: String, enum: ["pending", "received"], default: "received" },
    purchasedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Purchase", purchaseSchema);
