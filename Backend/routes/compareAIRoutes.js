const express = require("express");

const router = express.Router();

const {
  getComparisonSummary,
} = require("../controllers/compareAIController");

const { verifyToken } = require("../middleware/authMiddleware");

router.post(
  "/summary",
  verifyToken,
  getComparisonSummary
);

module.exports = router;