// ─────────────────────────────────────────────────────────────────────────────
//  Input + AI-output validation for the /analyze endpoint.
//  Dependency-free schema checks. Throws AppError("VALIDATION_ERROR") with a
//  `details.fields` map so the client can pinpoint what was wrong.
// ─────────────────────────────────────────────────────────────────────────────
const { AppError } = require("../lib/errors");
const { SKILLS } = require("../prompts");

const ACTIONS = ["study_plan", "score_gap", "feedback", "recommendations"];
const SKILL_SET = new Set(SKILLS);
const FEEDBACK_SCORES = new Set(["Weak", "Developing", "Proficient", "Strong"]);

const isObject = v => v !== null && typeof v === "object" && !Array.isArray(v);
const isFiniteNum = v => typeof v === "number" && Number.isFinite(v);

// ─── Request validation ──────────────────────────────────────────────────────

/**
 * Validate and normalize the POST /analyze request body.
 * @returns {{ action: string, userProfile: object, studyReference: object|null, extraContext: object|null }}
 */
function validateAnalyzeRequest(body) {
  const fields = {};
  if (!isObject(body)) {
    throw new AppError("VALIDATION_ERROR", "Request body must be a JSON object.");
  }

  const { action, userProfile, studyReference, extraContext } = body;

  if (!ACTIONS.includes(action)) {
    fields.action = `Must be one of: ${ACTIONS.join(", ")}.`;
  }

  if (!isObject(userProfile)) {
    fields.userProfile = "Required object.";
  } else {
    if (!isFiniteNum(userProfile.targetScore)) {
      fields.targetScore = "Required number.";
    } else if (userProfile.targetScore < 0 || userProfile.targetScore > 120) {
      fields.targetScore = "Must be between 0 and 120.";
    }
    if (userProfile.currentPrediction != null && !isFiniteNum(userProfile.currentPrediction)) {
      fields.currentPrediction = "Must be a number when provided.";
    }
  }

  if (studyReference != null && !isObject(studyReference)) {
    fields.studyReference = "Must be an object when provided.";
  }

  if (action === "feedback") {
    if (!isObject(extraContext)) {
      fields.extraContext = "Required object for feedback action.";
    } else {
      const answer = extraContext.userAnswer;
      if (typeof answer !== "string" || answer.trim().length < 1) {
        fields["extraContext.userAnswer"] = "Required non-empty string.";
      } else if (answer.length > 5000) {
        fields["extraContext.userAnswer"] = "Must be 5000 characters or fewer.";
      }
    }
  }

  if (Object.keys(fields).length > 0) {
    throw new AppError("VALIDATION_ERROR", "One or more fields are invalid.", { fields });
  }

  return {
    action,
    userProfile,
    studyReference: studyReference ?? null,
    extraContext: extraContext ?? null
  };
}

// ─── AI response validation ──────────────────────────────────────────────────

/** Parse JSON the model may have wrapped in prose/markdown. */
function parseAiJson(raw) {
  if (typeof raw !== "string") return null;
  try { return JSON.parse(raw); } catch {}
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try { return JSON.parse(match[0]); } catch { return null; }
}

const cleanSkill = s => String(s || "").toLowerCase();

/**
 * Validate + normalize the model's structured output for an action.
 * Throws AppError("INVALID_AI_RESPONSE") when the shape can't be trusted.
 * @returns {object} normalized, client-safe structured data
 */
function validateAiResponse(action, raw) {
  const parsed = parseAiJson(raw);
  if (!isObject(parsed)) {
    throw new AppError("INVALID_AI_RESPONSE");
  }

  switch (action) {
    case "study_plan": {
      const tasks = Array.isArray(parsed.tasks) ? parsed.tasks : [];
      const cleanTasks = tasks
        .filter(t => isObject(t) && SKILL_SET.has(cleanSkill(t.skill)))
        .map(t => ({
          skill: cleanSkill(t.skill),
          title: String(t.title || "").trim(),
          reason: String(t.reason || "").trim(),
          minutes: isFiniteNum(t.minutes) ? t.minutes : 10,
          type: String(t.type || "drill").trim()
        }));
      if (cleanTasks.length === 0) throw new AppError("INVALID_AI_RESPONSE");
      return {
        summary: String(parsed.summary || "").trim(),
        tasks: cleanTasks,
        motivation: String(parsed.motivation || "").trim()
      };
    }

    case "score_gap": {
      const breakdown = (Array.isArray(parsed.breakdown) ? parsed.breakdown : [])
        .filter(b => isObject(b) && SKILL_SET.has(cleanSkill(b.skill)))
        .map(b => ({
          skill: cleanSkill(b.skill),
          current: isFiniteNum(b.current) ? b.current : 0,
          target: isFiniteNum(b.target) ? b.target : 0,
          gap: isFiniteNum(b.gap) ? b.gap : 0,
          action: String(b.action || "").trim()
        }));
      const topActions = (Array.isArray(parsed.topActions) ? parsed.topActions : [])
        .map(a => String(a || "").trim()).filter(Boolean);
      if (!parsed.overall && topActions.length === 0) throw new AppError("INVALID_AI_RESPONSE");
      return {
        overall: String(parsed.overall || "").trim(),
        weakestSkill: SKILL_SET.has(cleanSkill(parsed.weakestSkill)) ? cleanSkill(parsed.weakestSkill) : null,
        breakdown,
        topActions
      };
    }

    case "feedback": {
      if (!parsed.good && !parsed.improve) throw new AppError("INVALID_AI_RESPONSE");
      return {
        good: String(parsed.good || "").trim(),
        improve: String(parsed.improve || "").trim(),
        score: FEEDBACK_SCORES.has(parsed.score) ? parsed.score : "Developing",
        idealAnswer: String(parsed.idealAnswer || "").trim()
      };
    }

    case "recommendations": {
      const recs = (Array.isArray(parsed.recommendations) ? parsed.recommendations : [])
        .filter(r => isObject(r) && SKILL_SET.has(cleanSkill(r.skill)))
        .map(r => ({
          skill: cleanSkill(r.skill),
          title: String(r.title || "").trim(),
          reason: String(r.reason || "").trim(),
          priority: ["high", "medium", "low"].includes(r.priority) ? r.priority : "medium",
          minutes: isFiniteNum(r.minutes) ? r.minutes : 10
        }));
      if (recs.length === 0) throw new AppError("INVALID_AI_RESPONSE");
      return {
        headline: String(parsed.headline || "").trim(),
        recommendations: recs
      };
    }

    default:
      throw new AppError("UNKNOWN_ACTION");
  }
}

module.exports = { ACTIONS, validateAnalyzeRequest, validateAiResponse, parseAiJson };
