const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const { compareWebsites } =
require("../controllers/compareController");

router.post("/", auth, compareWebsites);

module.exports = router;