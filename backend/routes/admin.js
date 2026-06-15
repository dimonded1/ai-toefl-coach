const express = require("express");
const db = require("../database/db");

const router = express.Router();

router.get("/snapshot", requireAdminToken, (req, res) => {
  const users = db.prepare(`
    SELECT id, name, email, password_hash, plan, subscription_status, created_at
    FROM users
    ORDER BY id
  `).all();

  const profiles = db.prepare("SELECT * FROM profiles ORDER BY id").all();
  const aiPlans = db.prepare("SELECT * FROM ai_plans ORDER BY id").all();

  res.json({
    exportedAt: new Date().toISOString(),
    counts: {
      users: users.length,
      profiles: profiles.length,
      aiPlans: aiPlans.length
    },
    tables: {
      users,
      profiles,
      aiPlans
    }
  });
});

function requireAdminToken(req, res, next) {
  const configuredToken = process.env.ADMIN_SYNC_TOKEN || process.env.ADMIN_TOKEN;
  if (!configuredToken) {
    return res.status(404).json({ error: "Admin sync is not enabled" });
  }

  const headerToken = req.get("x-admin-token");
  const bearerToken = parseBearerToken(req.get("authorization"));
  const token = headerToken || bearerToken;

  if (token !== configuredToken) {
    return res.status(403).json({ error: "Forbidden" });
  }

  next();
}

function parseBearerToken(value = "") {
  const match = String(value).match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : "";
}

module.exports = router;
