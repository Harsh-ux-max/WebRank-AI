const bcrypt = require("bcrypt");
const User = require("../models/User");
const Report = require("../models/Report");

// Get Profile
exports.getProfile = async (req, res) => {
    try {

        const user = await User.findById(req.user.id)
            .select("-password");

        res.json({
            success: true,
            user
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }
};

// Update Profile
exports.updateProfile = async (req, res) => {

    try {

        const { name, company, website } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                name,
                company,
                website
            },
            { new: true }
        ).select("-password");

        res.json({
            success: true,
            user
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }
};

//Password

exports.changePassword = async (req, res) => {

    try {

        const {
            currentPassword,
            newPassword
        } = req.body;

        const user = await User.findById(req.user.id);

        const isMatch = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!isMatch) {

            return res.status(400).json({
                success: false,
                message: "Current password is incorrect"
            });

        }

        const hashedPassword = await bcrypt.hash(
            newPassword,
            10
        );

        user.password = hashedPassword;

        await user.save();

        res.json({
            success: true,
            message: "Password updated successfully"
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};

// Delete Account
exports.deleteAccount = async (req, res) => {
    try {

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Delete all reports belonging to this user
        await Report.deleteMany({
            user: req.user.id
        });

        // Delete user account
        await User.findByIdAndDelete(req.user.id);

        res.json({
            success: true,
            message: "Account and all associated reports deleted successfully"
        });

    } catch (err) {

        console.error("DELETE ACCOUNT ERROR:", err);

        res.status(500).json({
            success: false,
            message: "Unable to delete account"
        });

    }
};