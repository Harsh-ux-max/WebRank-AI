const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const { getSuggestions } =
require("../controllers/aiController");

router.post("/", auth, getSuggestions);

module.exports = router;
