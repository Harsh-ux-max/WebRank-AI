const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");

const {
  getReports,
  deleteReport,
  getSingleReport
} = require("../controllers/reportController");



router.get("/history", verifyToken, getReports);


router.get(
  "/:id",
  verifyToken,
  getSingleReport
);


router.delete("/:id", verifyToken, deleteReport);



module.exports = router;