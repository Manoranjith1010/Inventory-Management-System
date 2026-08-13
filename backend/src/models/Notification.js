const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: { type: String, enum: ["low_stock", "out_of_stock", "purchase", "supplier_delay"], required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    isRead: { type: Boolean, default: false },
    createdForRole: { type: String, enum: ["admin", "manager", "staff"], default: "manager" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
