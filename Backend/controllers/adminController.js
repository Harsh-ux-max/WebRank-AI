const User = require("../models/User");
const Report = require("../models/Report");

// =====================================
// ADMIN DASHBOARD STATS
// =====================================

exports.getStats = async (req, res) => {
  try {

    const totalUsers = await User.countDocuments();

    const totalReports = await Report.countDocuments();

    const adminUsers = await User.countDocuments({
      role: "admin"
    });

    const normalUsers = await User.countDocuments({
      role: "user"
    });

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

    console.error("ADMIN STATS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load admin statistics."
    });

  }
};


// =====================================
// GET ALL USERS
// =====================================

exports.getUsers = async (req, res) => {
  try {

    const users = await User.find()
      .select(
        "-password -resetPasswordToken -resetPasswordExpires"
      )
      .sort({
        createdAt: -1
      });

    res.json({
      success: true,
      count: users.length,
      users
    });

  } catch (error) {

    console.error("ADMIN USERS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load users."
    });

  }
};