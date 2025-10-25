const appPool = require("../db/applicationDB/pool");
const misPool = require("../db/misDB/pool");

exports.migrateConfirmedStudents = async (req, res) => {
  try {
    const confirmed = await appPool.query(
      "SELECT * FROM applications WHERE admission_status = 'confirmed'"
    );
    if (confirmed.rows.length === 0)
      return res.status(404).json({ error: "No confirmed applications found" });

    const courses = await misPool.query(
      "SELECT course_id, course_name FROM courses"
    );
    const courseMap = {};
    courses.rows.forEach(
      (c) => (courseMap[c.course_name.toLowerCase()] = c.course_id)
    );

    for (let i = 0; i < confirmed.rows.length; i++) {
      const app = confirmed.rows[i];
      const courseId = courseMap[app.course.toLowerCase()] || null;
      const misId = `MIS${new Date().getFullYear()}-COEP-${String(
        i + 1
      ).padStart(3, "0")}`;

      await misPool.query(
        `INSERT INTO students (
          mis_id, user_id, email, firstname, middlename, lastname, dob, phone, address,
          is_scholarship, fee_status, receipt_path, merit_document, course_id,
          payment_order_id, payment_id, payment_signature, payment_amount, payment_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)`,
        [
          misId,
          app.user_id,
          app.email,
          app.firstname,
          app.middlename,
          app.lastname,
          app.dob,
          app.phone,
          app.address,
          app.is_scholarship,
          app.fee_status,
          app.receipt_path,
          app.merit_document,
          courseId,
          app.payment_order_id,
          app.payment_id,
          app.payment_signature,
          app.payment_amount,
          app.payment_at,
        ]
      );
    }

    res.json({
      message: `${confirmed.rows.length} students migrated successfully.`,
    });
  } catch (err) {
    console.error("Migration error:", err);
    res.status(500).json({ error: "Migration failed" });
  }
};
