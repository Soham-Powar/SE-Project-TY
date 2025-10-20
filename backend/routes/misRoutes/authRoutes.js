const express = require("express");
const {
  misRegisterPost,
  misLoginPost,
} = require("../../controllers/misControllers/authController");

const router = express.Router();

router.post("/register", misRegisterPost);
router.post("/login", misLoginPost);

module.exports = router;
