const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");

const {
    analyzeWebsite,
    getReports,
    getReportById
} = require("../controllers/analyzeController");

router.post("/", auth, analyzeWebsite);

router.get("/", auth, getReports);

router.get("/:id", auth, getReportById);

module.exports = router;