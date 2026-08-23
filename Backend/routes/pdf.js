const express = require("express");

const router = express.Router();
const auth = require("../middleware/auth");

const { downloadPDF } =
require("../controllers/pdfController");

router.post("/", auth, downloadPDF);

module.exports = router;
