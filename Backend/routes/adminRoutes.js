const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Report = require("../models/Report");

const { verifyToken } = require("../middleware/authMiddleware");
const { verifyAdmin } = require("../middleware/adminMiddleware");


// ===============================
// ADMIN STATS
// ===============================

router.get("/stats", verifyToken, verifyAdmin, async (req, res) => {
  try {

    const totalUsers = await User.countDocuments();
    const totalReports = await Report.countDocuments();
    const adminUsers = await User.countDocuments({ role: "admin" });
    const normalUsers = await User.countDocuments({ role: "user" });

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalReports,
        adminUsers,
        normalUsers
      }
    });

  } catch (error) {

    console.error("ADMIN STATS ERROR:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to load admin statistics"
    });

  }
});


// ===============================
// ALL USERS
// ===============================

router.get("/users", verifyToken, verifyAdmin, async (req, res) => {
  try {

    const users = await User.find()
      .select("-password -resetPasswordToken -resetPasswordExpires")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      users
    });

  } catch (error) {

    console.error("ADMIN USERS ERROR:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to load users"
    });

  }
});


module.exports = router;