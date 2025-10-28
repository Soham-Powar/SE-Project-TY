const express = require("express");
const router = express.Router();
const verifyMISAdmin = require("../../middleware/verifyMISAdmin");

router.get("/dashboard", verifyMISAdmin, (req, res) => {
  res.json({ message: "Welcome Admin!", user: req.user });
});

module.exports = router;
