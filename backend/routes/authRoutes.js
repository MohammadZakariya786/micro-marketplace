const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { register, login, getMe } = require("../controllers/authController");
const {
  validateRegister,
  validateLogin,
} = require("../middleware/validationMiddleware");

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.get("/me", auth, getMe);

module.exports = router;
