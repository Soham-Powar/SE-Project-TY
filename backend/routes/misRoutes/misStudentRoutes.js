const express = require("express");
const router = express.Router();
const verifyMISStudent = require("../../middleware/verifyMISStudent");
const pool = require("../../db/misDB/pool");

// ✅ Get student profile + course and subjects
router.get("/profile", verifyMISStudent, async (req, res) => {
  try {
    const { email } = req.user;

    // Get student + course info
    const studentResult = await pool.query(
      `SELECT s.*, c.course_name
       FROM students s
       LEFT JOIN courses c ON s.course_id = c.course_id
       WHERE s.email = $1`,
      [email]
    );

    if (studentResult.rows.length === 0)
      return res.status(404).json({ error: "Student not found" });

    const student = studentResult.rows[0];

    // Get subjects linked to their course
    const subjectsResult = await pool.query(
      `SELECT subject_name
       FROM subjects
       WHERE course_id = $1`,
      [student.course_id]
    );

    res.json({
      student,
      subjects: subjectsResult.rows.map((s) => s.subject_name),
    });
  } catch (err) {
    console.error("Error fetching student profile:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
