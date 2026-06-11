// ─────────────────────────────────────────────────────────────────────────────
//  Centralized configuration.
//  Loads .env once and exposes a frozen, validated config object.
//  No secret values are ever logged or returned to clients.
// ─────────────────────────────────────────────────────────────────────────────
require("dotenv").config();

function int(value, fallback) {
  const n = parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function list(value, fallback) {
  if (!value) return fallback;
  return value.split(",").map(s => s.trim()).filter(Boolean);
}

const config = Object.freeze({
  port: int(process.env.PORT, 3001),
  nodeEnv: process.env.NODE_ENV || "development",

  // AI provider (provider-neutral; currently backed by Groq's OpenAI-compatible API)
  ai: Object.freeze({
    apiKey: process.env.GROQ_API_KEY || "",
    apiUrl: process.env.GROQ_API_URL || "https://api.groq.com/openai/v1/chat/completions",
    model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
    timeoutMs: int(process.env.AI_TIMEOUT_MS, 20000),
    maxTokens: int(process.env.AI_MAX_TOKENS, 700)
  }),

  cors: Object.freeze({
    origins: list(process.env.CORS_ORIGINS, [
      "http://localhost:8080",
      "http://localhost:3000",
      "http://127.0.0.1:8080"
    ])
  }),

  rateLimit: Object.freeze({
    windowMs: int(process.env.RATE_LIMIT_WINDOW_MS, 60_000),
    max: int(process.env.RATE_LIMIT_MAX, 20)
  })
});

// True when the AI provider has credentials. Never exposes the key itself.
function isProviderConfigured() {
  return Boolean(config.ai.apiKey);
}

module.exports = { config, isProviderConfigured };
