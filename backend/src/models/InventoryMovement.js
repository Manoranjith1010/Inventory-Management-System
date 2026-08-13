const mongoose = require("mongoose");

const inventoryMovementSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    type: { type: String, enum: ["in", "out", "adjustment"], required: true },
    quantity: { type: Number, required: true },
    previousQuantity: { type: Number, required: true },
    newQuantity: { type: Number, required: true },
    referenceType: { type: String, enum: ["purchase", "sale", "manual"], required: true },
    referenceId: { type: mongoose.Schema.Types.ObjectId, required: true },
    note: { type: String, trim: true },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("InventoryMovement", inventoryMovementSchema);
