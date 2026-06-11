// ─────────────────────────────────────────────────────────────────────────────
//  Rate limiting for AI endpoints. Protects the shared provider key and stays
//  within Groq's free-tier budget (≈30 RPM). Emits our stable RATE_LIMITED code.
// ─────────────────────────────────────────────────────────────────────────────
const rateLimit = require("express-rate-limit");
const { config } = require("../config/env");
const { ERROR_CODES } = require("../lib/errors");

const aiRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,   // RateLimit-* headers
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(ERROR_CODES.RATE_LIMITED.status).json({
      error: ERROR_CODES.RATE_LIMITED.message,
      code: "RATE_LIMITED"
    });
  }
});

module.exports = { aiRateLimiter };
