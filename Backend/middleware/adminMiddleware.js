const User = require("../models/User");

exports.verifyAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const user = await User.findById(req.user.id).select("email");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Temporary admin check
    if (user.email !== process.env.ADMIN_EMAIL) {
      return res.status(403).json({
        success: false,
        message: "Admin access required"
      });
    }

    next();

  } catch (error) {
    console.error("ADMIN AUTH ERROR:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to verify admin access"
    });
  }
};