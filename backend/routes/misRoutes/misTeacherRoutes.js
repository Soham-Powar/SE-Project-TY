const express = require("express");
const router = express.Router();
const verifyMISTeacher = require("../../middleware/verifyMISTeacher");

router.get("/courses", verifyMISTeacher, (req, res) => {
  res.json({ message: "Teacher Dashboard Access Granted", user: req.user });
});

module.exports = router;
