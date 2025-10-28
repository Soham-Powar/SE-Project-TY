const appPool = require("../db/applicationDB/pool");
const misPool = require("../db/misDB/pool");
const bcrypt = require("bcryptjs");

exports.migrateConfirmedStudents = async (req, res) => {
  try {
    // 1️⃣ Fetch confirmed applications
    const confirmed = await appPool.query(
      "SELECT * FROM applications WHERE admission_status = 'confirmed'"
    );

    if (confirmed.rows.length === 0)
      return res.status(404).json({ error: "No confirmed applications found" });

    // 2️⃣ Fetch all course mappings from MIS DB
    const courses = await misPool.query(
      "SELECT course_id, course_name FROM courses"
    );

    // Normalize course names for easy mapping
    const courseMap = {};
    courses.rows.forEach((c) => {
      const normalized = c.course_name.toLowerCase().replace(/[^a-z0-9]/g, "");
      courseMap[normalized] = c.course_id;
    });

    let migratedCount = 0;

    // 3️⃣ Loop through each confirmed student
    for (const app of confirmed.rows) {
      // Normalize and find matching course_id
      const normalizedCourse = app.course
        ?.toLowerCase()
        .replace(/[^a-z0-9]/g, "");
      const courseId = courseMap[normalizedCourse] || null;

      if (!courseId) {
        console.warn(`⚠️ No matching course found for: "${app.course}"`);
        continue;
      }

      // Generate MIS ID (unique)
      const misId = `MIS${new Date().getFullYear()}-COEP-${String(
        migratedCount + 1
      ).padStart(3, "0")}`;

      // 4️⃣ Skip if already migrated
      const existing = await misPool.query(
        "SELECT 1 FROM users WHERE email=$1",
        [app.email]
      );
      if (existing.rows.length > 0) {
        console.log(`⏩ Skipping already migrated user: ${app.email}`);
        continue;
      }

      // 5️⃣ Fetch existing password hash from admission DB
      const userResult = await appPool.query(
        "SELECT password_hash FROM users WHERE id=$1",
        [app.user_id]
      );
      const existingHash = userResult.rows[0]?.password_hash;

      if (!existingHash) {
        console.warn(`⚠️ Missing password hash for user_id ${app.user_id}`);
        continue;
      }

      // 6️⃣ Insert into MIS users table
      const userInsert = await misPool.query(
        `INSERT INTO users (email, password_hash, role, mis_id)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [app.email, existingHash, "student", misId]
      );

      const newUserId = userInsert.rows[0].id;

      // 7️⃣ Insert student record
      await misPool.query(
        `INSERT INTO students (
          mis_id, user_id, email, firstname, middlename, lastname, dob, phone, address,
          is_scholarship, fee_status, receipt_path, merit_document, course_id,
          payment_order_id, payment_id, payment_signature, payment_amount, payment_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)`,
        [
          misId,
          newUserId,
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

      migratedCount++;
    }

    res.json({
      message: `${migratedCount} students migrated successfully to MIS (with accounts).`,
    });
  } catch (err) {
    console.error("❌ Migration error:", err);
    res.status(500).json({ error: "Migration failed" });
  }
};
