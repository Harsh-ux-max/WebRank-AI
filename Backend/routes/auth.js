const express = require("express");
const router = express.Router();

const {
  signup,
  login,
  googleLogin,
  forgotPassword,
  resetPassword
} = require("../controllers/authController");

const { verifyToken } = require("../middleware/authMiddleware");

router.post("/signup", signup);
router.post("/login", login);
router.post("/google", googleLogin);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.get("/profile", verifyToken, (req, res) => {
  res.json({
    success: true,
    message: "Welcome",
    user: req.user
  });
});

module.exports = router;