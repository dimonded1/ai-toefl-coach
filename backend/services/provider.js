// ─────────────────────────────────────────────────────────────────────────────
//  AI provider layer (provider-neutral).
//
//  Speaks the OpenAI-compatible chat-completions protocol, currently pointed at
//  Groq. To swap providers, change config.ai.* — callers depend only on
//  `chatComplete(messages, opts)` and never on "Groq" specifics.
//
//  Responsibilities: transport, auth, timeout, and translating transport
//  failures into AppError with stable codes. It never builds prompts and never
//  leaks the API key or raw upstream bodies to callers.
// ─────────────────────────────────────────────────────────────────────────────
const { config, isProviderConfigured } = require("../config/env");
const { AppError } = require("../lib/errors");

/**
 * @param {Array<{role: string, content: string}>} messages
 * @param {{ temperature?: number, maxTokens?: number, topP?: number }} [opts]
 * @returns {Promise<string>} The assistant message content.
 */
async function chatComplete(messages, opts = {}) {
  if (!isProviderConfigured()) {
    throw new AppError("PROVIDER_NOT_CONFIGURED");
  }

  const { timeoutMs, model, maxTokens, apiUrl, apiKey } = config.ai;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response;
  try {
    response = await fetch(apiUrl, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: opts.temperature ?? 0.7,
        max_tokens: opts.maxTokens ?? maxTokens,
        top_p: opts.topP ?? 0.9,
        stream: false
      })
    });
  } catch (err) {
    if (err.name === "AbortError") {
      throw new AppError("UPSTREAM_TIMEOUT");
    }
    // Network/DNS/connection failures — log server-side, stay generic to client.
    console.error("[provider] transport error:", err.message);
    throw new AppError("UPSTREAM_ERROR", "Failed to reach AI provider.");
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    // Log the real upstream body server-side only; never forward it to clients.
    const raw = await response.text().catch(() => "");
    console.error(`[provider] upstream ${response.status}:`, raw.slice(0, 500));
    if (response.status === 429) throw new AppError("RATE_LIMITED", "AI provider rate limit reached.");
    throw new AppError("UPSTREAM_ERROR");
  }

  const data = await response.json().catch(() => null);
  const text = data?.choices?.[0]?.message?.content;
  if (typeof text !== "string" || !text.trim()) {
    throw new AppError("INVALID_AI_RESPONSE", "AI returned an empty response.");
  }
  return text;
}

module.exports = { chatComplete };
