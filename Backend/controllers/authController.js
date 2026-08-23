const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function publicUser(user) {
  const isConfiguredAdmin =
    user.email === process.env.ADMIN_EMAIL;

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role === "admin" || isConfiguredAdmin ? "admin" : "user",
    company: user.company,
    website: user.website,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

// Signup
exports.signup = async (req, res) => {
  try {

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required"
      });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      success: true,
      message: "Signup Successful",
      user: publicUser(user),
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Login
exports.login = async (req, res) => {

  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({
        message: "Invalid Password"
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role:
          user.role === "admin" || user.email === process.env.ADMIN_EMAIL
            ? "admin"
            : user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      success: true,
      token,
      user: publicUser(user),
    });

  }catch (error) {
  console.error("LOGIN ERROR:", error);

  res.status(500).json({
    success: false,
    message: error.message,
  });
}

};


// Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail
    });

    // Do not reveal whether an account exists
    if (!user) {
      const response = {
        success: true,
        message:
          "If an account exists with this email, a password reset link has been generated."
      };
      return res.json(response);
    }

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token before storing it
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;

    // Token valid for 15 minutes
    user.resetPasswordExpires =
      Date.now() + 15 * 60 * 1000;

    await user.save();

    // Temporary development reset URL
    const resetUrl =
      `${process.env.CLIENT_URL || "http://localhost:5500"}/reset-password.html?token=${resetToken}&email=${encodeURIComponent(normalizedEmail)}`;

    if (process.env.NODE_ENV !== "production") {
      console.log("Password reset URL generated.");
    }

    const response = {
      success: true,
      message:
        "If an account exists with this email, a password reset link has been generated."
    };

    if (process.env.NODE_ENV !== "production") {
      response.resetUrl = resetUrl;
    }

    res.json(response);

  } catch (error) {

    console.error(
      "FORGOT PASSWORD ERROR:",
      process.env.NODE_ENV === "production"
        ? "Password reset request failed"
        : error.message
    );
    res.status(500).json({
      success: false,
      message: "Unable to process password reset request."
    });
  }
};


// Reset Password
exports.resetPassword = async (req, res) => {
  try {

    const { token, email, password } = req.body;

    if (!token || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Token, email and new password are required."
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long."
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Hash token received from frontend
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      email: normalizedEmail,
      resetPasswordToken: hashedToken,
      resetPasswordExpires: {
        $gt: new Date()
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired password reset link."
      });
    }

    // Hash new password
    user.password = await bcrypt.hash(password, 10);

    // Invalidate reset token immediately
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    res.json({
      success: true,
      message: "Password reset successfully. You can now login."
    });

  } catch (error) {

    console.error("RESET PASSWORD ERROR:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to reset password."
    });
  }
};

// Verify a Google Identity Services credential, then issue the app JWT.
exports.googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(503).json({
        success: false,
        message: "Google login is not configured on this server."
      });
    }

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "Google credential is required."
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();

    if (!payload?.sub || !payload.email || payload.email_verified !== true) {
      return res.status(401).json({
        success: false,
        message: "Google account verification failed."
      });
    }

    const email = payload.email.trim().toLowerCase();
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: payload.name || email.split("@")[0],
        email,
        password: await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10)
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      token,
      user: publicUser(user)
    });
  } catch (error) {
    console.error("GOOGLE LOGIN ERROR:", error.message);
    return res.status(401).json({
      success: false,
      message: "Unable to sign in with Google. Please try again."
    });
  }
};