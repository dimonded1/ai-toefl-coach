const jwt = require("jsonwebtoken");
const db = require("../database/db");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
}

function publicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.created_at
  };
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Authorization token required" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = db.prepare("SELECT id, name, email, created_at FROM users WHERE id = ?").get(payload.sub);
    if (!user) return res.status(401).json({ error: "User not found" });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = {
  JWT_SECRET,
  publicUser,
  requireAuth,
  signToken
};
