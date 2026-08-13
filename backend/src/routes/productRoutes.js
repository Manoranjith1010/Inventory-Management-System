const express = require("express");
const {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  findByBarcode,
} = require("../controllers/productController");
const { protect, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", listProducts);
router.get("/barcode/:barcode", findByBarcode);
router.get("/:id", getProductById);
router.post("/", authorize("admin", "manager"), createProduct);
router.put("/:id", authorize("admin", "manager"), updateProduct);
router.delete("/:id", authorize("admin"), deleteProduct);

module.exports = router;
