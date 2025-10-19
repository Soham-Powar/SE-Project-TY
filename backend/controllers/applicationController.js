const pool = require("../db/applicationDB/pool");

const submitApplication = async (req, res) => {
  const {
    user_id,
    firstname,
    middlename,
    lastname,
    dob,
    phone,
    address,
    is_scholarship,
    fee_status,
    course,
  } = req.body;

  try {
    // Get user email from users table
    const userResult = await pool.query(
      "SELECT email FROM users WHERE id = $1",
      [user_id]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const email = userResult.rows[0].email;

    // Uploaded file paths from multer
    const receiptPath = req.files?.receipt ? req.files.receipt[0].path : null;
    const meritDocumentPath = req.files?.merit_document
      ? req.files.merit_document[0].path
      : null;

    // Insert into applications table
    await pool.query(
      `INSERT INTO applications 
        (user_id, email, firstname, middlename, lastname, dob, phone, address,
         is_scholarship, fee_status, receipt_path, merit_document, course)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [
        user_id,
        email,
        firstname,
        middlename,
        lastname,
        dob,
        phone,
        address,
        is_scholarship === "true" || is_scholarship === true,
        fee_status,
        receiptPath,
        meritDocumentPath,
        course,
      ]
    );

    res.status(201).json({
      message: "Application submitted successfully",
      receipt_path: receiptPath,
      merit_document: meritDocumentPath,
    });
  } catch (err) {
    console.error("Error inserting application:", err.message);
    res.status(500).json({ error: "Database error" });
  }
};

module.exports = {
  submitApplication,
};
