const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../database/db");
const { publicUser, requireAuth, signToken } = require("../middleware/auth");
const { saveProfileForUser } = require("./profile");

const router = express.Router();

router.post("/register", (req, res) => {
  const { name, email, password } = normalizeAuthBody(req.body);
  const error = validateRegistration({ name, email, password });
  if (error) return res.status(400).json({ error });

  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) return res.status(409).json({ error: "Email already registered" });

  const now = new Date().toISOString();
  const passwordHash = bcrypt.hashSync(password, 10);

  const transaction = db.transaction(() => {
    const result = db.prepare(`
      INSERT INTO users (name, email, password_hash, created_at)
      VALUES (?, ?, ?, ?)
    `).run(name, email, passwordHash, now);

    const user = db.prepare("SELECT id, name, email, created_at FROM users WHERE id = ?").get(result.lastInsertRowid);
    saveProfileForUser(user.id, { name: user.name });
    return user;
  });

  const user = transaction();
  res.status(201).json({ user: publicUser(user), token: signToken(user) });
});

router.post("/login", (req, res) => {
  const { email, password } = normalizeAuthBody(req.body);
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  res.json({ user: publicUser(user), token: signToken(user) });
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

function normalizeAuthBody(body = {}) {
  return {
    name: String(body.name || "").trim(),
    email: String(body.email || "").trim().toLowerCase(),
    password: String(body.password || "")
  };
}

function validateRegistration({ name, email, password }) {
  if (name.length < 2 || name.length > 80) return "Name must be 2-80 characters";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Valid email required";
  if (password.length < 6) return "Password must be at least 6 characters";
  return null;
}

module.exports = router;
