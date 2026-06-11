// ─────────────────────────────────────────────────────────────────────────────
//  Stable, human-readable error codes shared by every route.
//  Clients can branch on `code`; `message` is safe to show to end users and
//  never contains upstream/provider internals or secrets.
// ─────────────────────────────────────────────────────────────────────────────

const ERROR_CODES = Object.freeze({
  VALIDATION_ERROR:        { status: 400, message: "Request data is invalid." },
  UNKNOWN_ACTION:          { status: 400, message: "Unknown analysis action." },
  PROVIDER_NOT_CONFIGURED: { status: 503, message: "AI provider is not configured." },
  RATE_LIMITED:            { status: 429, message: "Too many requests. Please slow down." },
  UPSTREAM_TIMEOUT:        { status: 504, message: "AI provider timed out." },
  UPSTREAM_ERROR:          { status: 502, message: "AI provider returned an error." },
  INVALID_AI_RESPONSE:     { status: 502, message: "AI returned a malformed response." },
  NOT_FOUND:               { status: 404, message: "Route not found." },
  INTERNAL:                { status: 500, message: "Internal server error." }
});

class AppError extends Error {
  /**
   * @param {keyof typeof ERROR_CODES} code
   * @param {string} [message]  Optional override; still client-safe.
   * @param {object} [details]  Optional structured details (e.g. validation fields).
   */
  constructor(code, message, details) {
    const known = ERROR_CODES[code] || ERROR_CODES.INTERNAL;
    super(message || known.message);
    this.name = "AppError";
    this.code = ERROR_CODES[code] ? code : "INTERNAL";
    this.status = known.status;
    this.details = details;
  }

  /** Shape sent to clients. Backward-compatible: `error` stays a plain string. */
  toResponse() {
    const body = { error: this.message, code: this.code };
    if (this.details) body.details = this.details;
    return body;
  }
}

module.exports = { AppError, ERROR_CODES };
