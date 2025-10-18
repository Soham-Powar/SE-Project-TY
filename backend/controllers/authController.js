import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db/pool.js";
import generateApplicationId from "../utils/generateApplicationId.js";

export const register = async (req, res) => {
  const { email, password, confirmPassword } = req.body;

  try {
    if (!email || !password || !confirmPassword) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    const existing = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "User already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const appId = generateApplicationId();

    await pool.query(
      "INSERT INTO users (email, password_hash, application_id) VALUES ($1, $2, $3)",
      [email, hashed, appId]
    );

    res.status(201).json({
      message: "Registered successfully",
      application_id: appId,
    });
  } catch (err) {
    console.error("Registration error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const { rows } = await pool.query("SELECT * FROM users WHERE email=$1", [
      email,
    ]);
    if (!rows.length) return res.status(404).json({ error: "User not found" });

    const valid = await bcrypt.compare(password, rows[0].password_hash);
    if (!valid) return res.status(401).json({ error: "Invalid password" });

    const token = jwt.sign(
      { id: rows[0].id, application_id: rows[0].application_id },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );
    res.json({ token, application_id: rows[0].application_id });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
};
