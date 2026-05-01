const express = require("express");
const { signup, login, me, searchUsers } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", protect, me);
router.get("/users", protect, searchUsers);

module.exports = router;
