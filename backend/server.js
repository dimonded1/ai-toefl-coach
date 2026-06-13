require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRouter = require("./routes/auth");
const aiRouter = require("./routes/ai");
const legacyGeminiRouter = require("./routes/gemini");
const profileRouter = require("./routes/profile");
require("./database/db");

const app = express();
const PORT = process.env.PORT || 3001;
const DEFAULT_FRONTEND_ORIGINS = ["https://ai-toefl-coach.onrender.com"];
const allowedOrigins = parseAllowedOrigins(process.env.FRONTEND_ORIGINS || process.env.CORS_ORIGINS)
  || DEFAULT_FRONTEND_ORIGINS;
const allowedLocalOrigins = [/^http:\/\/localhost:\d+$/, /^http:\/\/127\.0\.0\.1:\d+$/];

// Middleware
app.disable("x-powered-by");
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Frame-Options", "DENY");
  next();
});
app.use(cors({
  origin(origin, callback) {
    const isLocalDev = origin === "null" || allowedLocalOrigins.some(pattern => pattern.test(origin));
    const isAllowedServerOrigin = allowedOrigins.includes(origin);
    callback(null, !origin || isLocalDev || isAllowedServerOrigin);
  },
  methods: ["GET", "POST", "PUT"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json({ limit: "1mb" }));

// Routes
app.use("/api/auth", authRouter);
app.use("/api/ai", aiRouter);
app.use("/api/gemini", legacyGeminiRouter);
app.use("/api/profile", profileRouter);

// Health check
app.get("/health", (req, res) => {
  res.json({
    ok: true,
    status: "ok",
    service: "AI TOEFL Coach Backend",
    database: "sqlite"
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("[ERROR]", err.message);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`✅ AI TOEFL Coach backend running on port ${PORT}`);
  console.log(`   Groq API: ${process.env.GROQ_API_KEY ? "configured" : "not configured — add GROQ_API_KEY to .env"}`);
});

function parseAllowedOrigins(value) {
  if (!value) return null;
  const origins = String(value)
    .split(",")
    .map(origin => origin.trim())
    .filter(Boolean);
  return origins.length ? origins : null;
}
