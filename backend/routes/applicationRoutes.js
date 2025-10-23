const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const pool = require("../db/applicationDB/pool");
const verifyToken = require("../middleware/verifyToken");
const { submitApplication } = require("../controllers/applicationController");

const router = express.Router();

// 📁 Base uploads folder
const baseDir = "uploads/applications";
if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir, { recursive: true });
}

// ⚙️ Multer storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = req.body.user_id;
    if (!userId) return cb(new Error("Missing user_id in form data"));

    const userFolder = path.join(baseDir, userId.toString());
    if (!fs.existsSync(userFolder))
      fs.mkdirSync(userFolder, { recursive: true });

    cb(null, userFolder);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    let fileName;

    if (file.fieldname === "receipt") fileName = "receipt" + ext;
    else if (file.fieldname === "merit_document")
      fileName = "merit_document" + ext;
    else fileName = Date.now() + "-" + file.originalname;

    cb(null, fileName);
  },
});

// ✅ Only allow PDFs
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") cb(null, true);
  else cb(new Error("Only PDF files are allowed"), false);
};

const upload = multer({ storage, fileFilter });

/* ==========================================================
   ROUTES
========================================================== */

// 🟢 Check if user already submitted application
router.get("/check/:user_id", verifyToken, async (req, res) => {
  try {
    const { user_id } = req.params;
    const result = await pool.query(
      "SELECT id FROM applications WHERE user_id = $1",
      [user_id]
    );

    if (result.rows.length > 0) {
      return res.json({ hasApplied: true });
    } else {
      return res.json({ hasApplied: false });
    }
  } catch (err) {
    console.error("Error checking application:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 🟣 Application submission endpoint
router.post(
  "/apply",
  upload.fields([
    { name: "receipt", maxCount: 1 },
    { name: "merit_document", maxCount: 1 },
  ]),
  submitApplication
);

module.exports = router;
