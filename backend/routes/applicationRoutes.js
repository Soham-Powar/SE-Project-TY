import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { submitApplication } from "../controllers/applicationController.js";

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
    // Expect application_id from frontend (req.body)
    const appId = req.body.application_id;

    if (!appId) {
      return cb(new Error("Missing application_id in form data"));
    }

    const appFolder = path.join(baseDir, appId);

    // Create the folder if it doesn’t exist
    if (!fs.existsSync(appFolder)) {
      fs.mkdirSync(appFolder, { recursive: true });
    }

    cb(null, appFolder);
  },

  filename: (req, file, cb) => {
    // Save with meaningful names based on fieldname
    const ext = path.extname(file.originalname);
    const cleanName =
      file.fieldname === "receipt"
        ? "receipt" + ext
        : file.fieldname === "application_copy"
        ? "application" + ext
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

// Accept multiple uploads (e.g. receipt + application copy)
router.post(
  "/apply",
  upload.fields([
    { name: "receipt", maxCount: 1 },
    { name: "application_copy", maxCount: 1 },
  ]),
  submitApplication
);

export default router;
