// ─────────────────────────────────────────────────────────────────────────────
//  AI service: orchestration layer between the route and the provider.
//  - picks the right prompt for the action
//  - calls the provider (transport/timeout handled there)
//  - validates the model's JSON output on the backend
//  Returns both raw `result` (backward-compatible) and structured `data`.
// ─────────────────────────────────────────────────────────────────────────────
const { chatComplete } = require("./provider");
const {
  buildStudyPlanPrompt,
  buildScoreGapPrompt,
  buildFeedbackPrompt,
  buildRecommendationsPrompt
} = require("../prompts");
const { validateAiResponse } = require("../validators/analyze");
const { AppError } = require("../lib/errors");

function buildPrompt({ action, userProfile, studyReference, extraContext }) {
  switch (action) {
    case "study_plan":      return buildStudyPlanPrompt(userProfile, studyReference);
    case "score_gap":       return buildScoreGapPrompt(userProfile, studyReference);
    case "feedback":        return buildFeedbackPrompt(userProfile, extraContext, studyReference);
    case "recommendations": return buildRecommendationsPrompt(userProfile, studyReference);
    default:                throw new AppError("UNKNOWN_ACTION");
  }
}

/**
 * Run an analysis end-to-end.
 * @returns {Promise<{ result: string, data: object }>}
 *   `result` — raw model text (kept for existing clients that parse it themselves)
 *   `data`   — validated, normalized structured object (preferred for new clients)
 */
async function runAnalysis(request) {
  const prompt = buildPrompt(request);
  const result = await chatComplete([{ role: "user", content: prompt }]);
  const data = validateAiResponse(request.action, result);
  return { result, data };
}

module.exports = { runAnalysis };
