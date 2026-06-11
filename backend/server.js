// ─────────────────────────────────────────────────────────────────────────────
//  AI TOEFL Coach — backend entrypoint.
//  Wires config, CORS, rate limiting, AI routes, and a sanitized error handler.
// ─────────────────────────────────────────────────────────────────────────────
const express = require("express");
const cors = require("cors");

const { config, isProviderConfigured } = require("./config/env");
const { AppError, ERROR_CODES } = require("./lib/errors");
const { aiRateLimiter } = require("./middleware/rateLimit");
const aiRouter = require("./routes/ai");

const app = express();

app.use(cors({
  origin: config.cors.origins,
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json({ limit: "10kb" }));

// ── AI routes ────────────────────────────────────────────────────────────────
// Primary, provider-neutral mount.
app.use("/api/ai", aiRateLimiter, aiRouter);
// Deprecated alias kept for backward compatibility with existing clients.
app.use("/api/gemini", aiRateLimiter, aiRouter);

// ── Liveness ─────────────────────────────────────────────────────────────────
// Minimal surface: confirms the process is up. No config/secret details.
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "AI TOEFL Coach Backend" });
});

// ── Readiness ────────────────────────────────────────────────────────────────
// Reports whether the AI provider is configured, without revealing the key.
app.get("/ready", (req, res) => {
  const ready = isProviderConfigured();
  res.status(ready ? 200 : 503).json({ status: ready ? "ready" : "degraded", aiProvider: ready });
});

// ── 404 ──────────────────────────────────────────────────────────────────────
app.use((req, res, next) => next(new AppError("NOT_FOUND")));

// ── Centralized error handler ────────────────────────────────────────────────
// Maps AppError → { error, code, details? }. Everything else becomes a generic
// 500 so internal messages/stack traces never reach the client.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.status).json(err.toResponse());
  }
  if (err?.type === "entity.too.large") {
    return res.status(413).json({ error: "Request body too large.", code: "VALIDATION_ERROR" });
  }
  if (err?.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Malformed JSON body.", code: "VALIDATION_ERROR" });
  }
  console.error("[unhandled]", err?.message);
  res.status(ERROR_CODES.INTERNAL.status).json({ error: ERROR_CODES.INTERNAL.message, code: "INTERNAL" });
});

app.listen(config.port, () => {
  console.log(`✅ AI TOEFL Coach backend running on port ${config.port}`);
  console.log(`   AI provider: ${isProviderConfigured() ? "configured ✅" : "⚠️  NOT configured — set GROQ_API_KEY in backend/.env"}`);
});

module.exports = app;
