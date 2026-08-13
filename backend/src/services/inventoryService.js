const mongoose = require("mongoose");
const Product = require("../models/Product");
const InventoryMovement = require("../models/InventoryMovement");
const Notification = require("../models/Notification");
const ApiError = require("../utils/apiError");

const createLowStockNotification = async (product, session) => {
  if (product.quantity === 0) {
    await Notification.create(
      [
        {
          title: "Out of stock",
          message: `${product.name} (${product.sku}) is out of stock`,
          type: "out_of_stock",
          product: product._id,
          createdForRole: "manager",
        },
      ],
      { session }
    );
    return;
  }

  if (product.quantity <= product.lowStockThreshold) {
    await Notification.create(
      [
        {
          title: "Low stock alert",
          message: `${product.name} (${product.sku}) is below threshold`,
          type: "low_stock",
          product: product._id,
          createdForRole: "manager",
        },
      ],
      { session }
    );
  }
};

const applyPurchaseItems = async ({ items, userId, referenceId, session }) => {
  for (const item of items) {
    const product = await Product.findById(item.product).session(session);
    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    const previousQuantity = product.quantity;
    const newQuantity = previousQuantity + item.quantity;

    product.quantity = newQuantity;
    await product.save({ session });

    await InventoryMovement.create(
      [
        {
          product: product._id,
          type: "in",
          quantity: item.quantity,
          previousQuantity,
          newQuantity,
          referenceType: "purchase",
          referenceId,
          changedBy: userId,
          note: "Stock received through purchase",
        },
      ],
      { session }
    );
  }
};

const applySaleItems = async ({ items, userId, referenceId, session }) => {
  for (const item of items) {
    const product = await Product.findById(item.product).session(session);
    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    if (product.quantity < item.quantity) {
      throw new ApiError(400, `Insufficient stock for product ${product.name}`);
    }

    const previousQuantity = product.quantity;
    const newQuantity = previousQuantity - item.quantity;

    const updated = await Product.updateOne(
      { _id: product._id, quantity: { $gte: item.quantity } },
      { $inc: { quantity: -item.quantity } },
      { session }
    );

    if (updated.modifiedCount !== 1) {
      throw new ApiError(409, `Concurrent stock update detected for ${product.name}`);
    }

    await InventoryMovement.create(
      [
        {
          product: product._id,
          type: "out",
          quantity: item.quantity,
          previousQuantity,
          newQuantity,
          referenceType: "sale",
          referenceId,
          changedBy: userId,
          note: "Stock deducted through sale",
        },
      ],
      { session }
    );

    const currentProduct = await Product.findById(product._id).session(session);
    await createLowStockNotification(currentProduct, session);
  }
};

const withTransaction = async (callback) => {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await callback(session);
    });
    return result;
  } finally {
    await session.endSession();
  }
};

module.exports = {
  withTransaction,
  applyPurchaseItems,
  applySaleItems,
};
