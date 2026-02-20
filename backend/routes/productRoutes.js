const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleFavorite,
} = require("../controllers/productController");
const {
  validateProductsQuery,
  validateProductPayload,
  validateProductUpdatePayload,
  validateObjectIdParam,
} = require("../middleware/validationMiddleware");

router.get("/", validateProductsQuery, getProducts);
router.get("/:id", validateObjectIdParam, getProductById);
router.post("/", validateProductPayload, createProduct);
router.put("/:id", validateObjectIdParam, validateProductUpdatePayload, updateProduct);
router.delete("/:id", validateObjectIdParam, deleteProduct);
router.post("/favorite/:id", auth, validateObjectIdParam, toggleFavorite);

module.exports = router;
