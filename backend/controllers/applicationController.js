const pool = require("../db/pool");

export const submitApplication = async (req, res) => {
  const {
    user_id,
    application_id,
    full_name,
    dob,
    address,
    is_scholarship,
    fee_status,
  } = req.body;

  try {
    // Validate required fields
    if (!user_id || !application_id || !full_name || !dob || !address) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Get uploaded file paths (Multer stores them in req.files)
    const receiptPath = req.files?.receipt ? req.files.receipt[0].path : null;
    const applicationCopyPath = req.files?.application_copy
      ? req.files.application_copy[0].path
      : null;

    // Insert into database
    await pool.query(
      `INSERT INTO applications 
        (user_id, application_id, full_name, dob, address, is_scholarship, fee_status, receipt_path, application_copy_path)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        user_id,
        application_id,
        full_name,
        dob,
        address,
        is_scholarship === "true" || is_scholarship === true, // handle boolean from form
        fee_status,
        receiptPath,
        applicationCopyPath,
      ]
    );

    res.status(201).json({
      message: "Application submitted successfully",
      receipt_path: receiptPath,
      application_copy_path: applicationCopyPath,
    });
  } catch (err) {
    console.error("Error inserting application:", err.message);
    res.status(500).json({ error: "Database error" });
  }
};
