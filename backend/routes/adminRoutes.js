// routes/adminRoutes.js
const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");
const {
  getAllApplications,
  updateApplicationStatus,
} = require("../controllers/adminControllers");

// Admin routes
router.get("/admin/applications", verifyToken, verifyAdmin, getAllApplications);
router.put(
  "/admin/applications/:id",
  verifyToken,
  verifyAdmin,
  updateApplicationStatus
);

module.exports = router;
