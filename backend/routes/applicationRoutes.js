const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { submitApplication } = require("../controllers/applicationController");
const router = express.Router();

// Base uploads folder
const baseDir = "uploads/applications";

// Ensure base directory exists
if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir, { recursive: true });
}

// Multer storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Use user_id instead of application_id
    const userId = req.body.user_id;

    if (!userId) {
      return cb(new Error("Missing user_id in form data"));
    }

    const userFolder = path.join(baseDir, userId.toString());

    // Create folder if not exists
    if (!fs.existsSync(userFolder)) {
      fs.mkdirSync(userFolder, { recursive: true });
    }

    cb(null, userFolder);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const cleanName =
      file.fieldname === "receipt"
        ? "receipt" + ext
        : file.fieldname === "merit_document"
        ? "merit_document" + ext
        : Date.now() + "-" + file.originalname;

    cb(null, cleanName);
  },
});

// Only allow PDFs
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
  }
};

const upload = multer({ storage, fileFilter });

// Endpoint for application submission
router.post(
  "/apply",
  upload.fields([
    { name: "receipt", maxCount: 1 },
    { name: "merit_document", maxCount: 1 },
  ]),
  submitApplication
);

module.exports = router;
