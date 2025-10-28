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

// ✅ Get subjects available for student’s course (for selection)
router.get("/subjects", verifyMISStudent, async (req, res) => {
  try {
    const { mis_id } = req.user;

    const student = await pool.query(
      "SELECT course_id FROM students WHERE mis_id=$1",
      [mis_id]
    );
    if (student.rows.length === 0)
      return res.status(404).json({ error: "Student not found" });

    const courseId = student.rows[0].course_id;

    // Get all subjects for that course
    const subjects = await pool.query(
      "SELECT subject_id, subject_name FROM subjects WHERE course_id=$1",
      [courseId]
    );

    // Check which ones already enrolled
    const enrolled = await pool.query(
      "SELECT subject_id FROM enrollments WHERE mis_id=$1 AND semester=1",
      [mis_id]
    );

    const enrolledIds = enrolled.rows.map((r) => r.subject_id);

    res.json({
      subjects: subjects.rows,
      enrolled: enrolledIds,
    });
  } catch (err) {
    console.error("Error fetching subjects:", err);
    res.status(500).json({ error: "Failed to fetch subjects" });
  }
});

// ✅ Save selected subjects for this semester
router.post("/subjects", verifyMISStudent, async (req, res) => {
  try {
    const { mis_id } = req.user;
    const { selectedSubjects } = req.body;

    if (!Array.isArray(selectedSubjects) || selectedSubjects.length === 0)
      return res.status(400).json({ error: "No subjects selected" });

    if (selectedSubjects.length > 5)
      return res.status(400).json({ error: "You can select only 5 subjects" });

    // Remove old enrollments for semester 1
    await pool.query("DELETE FROM enrollments WHERE mis_id=$1 AND semester=1", [
      mis_id,
    ]);

    // Insert new enrollments
    for (const subjectId of selectedSubjects) {
      await pool.query(
        "INSERT INTO enrollments (mis_id, subject_id, semester) VALUES ($1, $2, 1)",
        [mis_id, subjectId]
      );
    }

    res.json({ message: "Subjects saved for this semester!" });
  } catch (err) {
    console.error("Error saving subjects:", err);
    res.status(500).json({ error: "Failed to save subjects" });
  }
});

router.get("/enrollments", verifyMISStudent, async (req, res) => {
  try {
    const { mis_id } = req.user;

    const result = await pool.query(
      `SELECT 
			e.semester,
			s.subject_id,
			s.subject_name,
			t.full_name AS instructor_name
		 FROM enrollments e
		 JOIN subjects s ON e.subject_id = s.subject_id
		 LEFT JOIN teachers t ON s.teacher_id = t.teacher_id
		 WHERE e.mis_id = $1 AND e.semester = 1`,
      [mis_id]
    );

    res.json({ enrolledSubjects: result.rows });
  } catch (err) {
    console.error("Error fetching enrollments:", err);
    res.status(500).json({ error: "Failed to fetch enrollments" });
  }
});

module.exports = router;
