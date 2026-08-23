const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");

const {
    getProfile,
    updateProfile,
    changePassword,
    deleteAccount
} = require("../controllers/profileController");

router.get("/", auth, getProfile);
router.put("/", auth, updateProfile);
router.put("/change-password", auth, changePassword);
router.delete("/", auth, deleteAccount);

module.exports = router;