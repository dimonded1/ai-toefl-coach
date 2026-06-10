const express = require("express");
const router = express.Router();

// Groq — free tier: 30 RPM, 14 400 req/day
// Free models: llama-3.1-8b-instant, llama-3.3-70b-versatile, mixtral-8x7b-32768
const GROQ_MODEL   = "llama-3.1-8b-instant";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_TIMEOUT_MS = 15000;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 20;
const VALID_ACTIONS = new Set(["study_plan", "score_gap", "feedback"]);
const requestBuckets = new Map();

router.use(rateLimitAIRequests);

/**
 * POST /api/gemini/analyze
 * Body: { userProfile, studyReference, action: "study_plan" | "score_gap" | "feedback" }
 */
router.post("/analyze", async (req, res) => {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return res.status(503).json({
      error: "Groq API key not configured. Add GROQ_API_KEY to backend/.env"
    });
  }

  const { userProfile, studyReference, action, extraContext } = req.body;

  const validationError = validateAnalyzeRequest({ userProfile, action, extraContext });
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const prompts = {
    study_plan: buildStudyPlanPrompt(userProfile, studyReference),
    score_gap:  buildScoreGapPrompt(userProfile, studyReference),
    feedback:   buildFeedbackPrompt(userProfile, extraContext, studyReference)
  };

  const prompt = prompts[action];
  if (!prompt) {
    return res.status(400).json({ error: `Unknown action: ${action}` });
  }

  let timeout = null;
  try {
    const { default: fetch } = await import("node-fetch");
    const controller = new AbortController();
    timeout = setTimeout(() => controller.abort(), GROQ_TIMEOUT_MS);

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 700,
        top_p: 0.9,
        stream: false
      })
    });
    clearTimeout(timeout);
    timeout = null;

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error("[Groq API Error]", errData);
      return res.status(response.status).json({
        error: errData.error?.message || `Groq API error ${response.status}`
      });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";
    const parsed = parseAIJson(text);

    if (!parsed || !validateAIResult(action, parsed)) {
      return res.status(502).json({
        error: "AI returned invalid JSON. Local fallback is available."
      });
    }

    res.json({ result: parsed });
  } catch (err) {
    if (timeout) clearTimeout(timeout);
    if (err.name === "AbortError") {
      return res.status(504).json({ error: "AI request timed out. Local fallback is available." });
    }
    console.error("[Groq fetch error]", err.message);
    res.status(500).json({ error: "Failed to reach Groq API" });
  }
});

function rateLimitAIRequests(req, res, next) {
  const now = Date.now();
  const key = req.ip || req.headers["x-forwarded-for"] || "unknown";
  const bucket = requestBuckets.get(key) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };

  if (now > bucket.resetAt) {
    bucket.count = 0;
    bucket.resetAt = now + RATE_LIMIT_WINDOW_MS;
  }

  bucket.count += 1;
  requestBuckets.set(key, bucket);

  if (bucket.count > RATE_LIMIT_MAX_REQUESTS) {
    return res.status(429).json({ error: "Too many AI requests. Try again in a minute." });
  }

  next();
}

function validateAnalyzeRequest({ userProfile, action, extraContext }) {
  if (!userProfile || typeof userProfile !== "object" || Array.isArray(userProfile)) {
    return "Missing or invalid userProfile";
  }
  if (!VALID_ACTIONS.has(action)) {
    return `Unknown action: ${action}`;
  }

  const targetScore = Number(userProfile.targetScore);
  const currentPrediction = Number(userProfile.currentPrediction);
  const preparationDays = Number(userProfile.preparationDays);
  if (!Number.isFinite(targetScore) || targetScore < 0 || targetScore > 120) return "Invalid targetScore";
  if (!Number.isFinite(currentPrediction) || currentPrediction < 0 || currentPrediction > 120) return "Invalid currentPrediction";
  if (!Number.isFinite(preparationDays) || preparationDays < 0 || preparationDays > 3650) return "Invalid preparationDays";

  if (action === "feedback") {
    const answer = String(extraContext?.userAnswer || "");
    if (!answer.trim()) return "Missing feedback answer";
    if (answer.length > 3000) return "Feedback answer is too long";
  }

  return null;
}

function parseAIJson(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {}

  const match = String(text).match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

function validateAIResult(action, result) {
  if (!result || typeof result !== "object" || Array.isArray(result)) return false;

  if (action === "study_plan") {
    return typeof result.summary === "string" && Array.isArray(result.tasks);
  }
  if (action === "score_gap") {
    return typeof result.overall === "string" && Array.isArray(result.topActions);
  }
  if (action === "feedback") {
    return typeof result.good === "string" && typeof result.improve === "string";
  }
  return false;
}

// ─── Prompt builders ────────────────────────────────────────────────────────

function buildStudyPlanPrompt(profile, studyReference) {
  const { targetScore, currentPrediction, preparationDays, mistakes, totalTasks, confidence, weakZones, readiness } = profile;

  const skillLines = Object.entries(mistakes || {}).map(([skill, m]) => {
    const total = totalTasks?.[skill] || 10;
    const pct = Math.round((m / total) * 100);
    return `  - ${skill}: ${pct}% error rate (${m}/${total} mistakes)`;
  }).join("\n");
  const weakZoneLines = formatWeakZones(weakZones);
  const confidenceLine = formatConfidence(confidence);
  const readinessLine = readiness ? `Readiness: ${readiness.level || "unknown"} (${readiness.overall ?? "n/a"}%)` : "Readiness: not provided";

  return `You are an expert TOEFL iBT coach. Analyze this student's performance and create a personalized study plan.

Student Profile:
- Target TOEFL Score: ${targetScore}
- Current Predicted Score: ${currentPrediction}
- Days until exam: ${preparationDays}
- Score gap: ${targetScore - currentPrediction} points

Skill Error Rates:
${skillLines}

Weak Zones:
${weakZoneLines}

Scoring Confidence:
${confidenceLine}
${readinessLine}

Reference Data:
${formatStudyReference(studyReference)}

Task: Return ONLY valid minified JSON. No markdown, no asterisks, no headings outside JSON.
Schema:
{"summary":"1-2 short sentences","tasks":[{"skill":"reading|listening|speaking|writing|vocabulary","title":"short task","reason":"why this task matters","minutes":10,"type":"drill|timed|review|ai-feedback"}],"motivation":"one short sentence"}

Rules:
- Always include exactly 5 tasks.
- Distribute tasks across TOEFL skills based on weak zones and score gap.
- Keep each title and reason practical, not generic.
- Use the reference data when relevant.
- English only.`;
}

function buildScoreGapPrompt(profile, studyReference) {
  const { targetScore, currentPrediction, scores, confidence, readiness } = profile;
  const gap = targetScore - currentPrediction;

  const scoreLines = Object.entries(scores || {}).map(([skill, s]) => {
    const targetSkillScore = Math.round(targetScore / 4);
    const skillGap = Math.max(0, targetSkillScore - s);
    return `  - ${skill}: current ${s}/30 → need +${skillGap} points`;
  }).join("\n");

  return `You are a TOEFL iBT expert. Analyze this student's score gap and give targeted advice.

Score Gap Analysis:
- Target: TOEFL ${targetScore}
- Current prediction: TOEFL ${currentPrediction}
- Total gap: ${gap} points

Skill Scores (out of 30 each):
${scoreLines}

Scoring confidence:
${formatConfidence(confidence)}
${readiness ? `Readiness: ${readiness.level || "unknown"} (${readiness.overall ?? "n/a"}%)` : "Readiness: not provided"}

Reference Data:
${formatStudyReference(studyReference)}

Task: Return ONLY valid minified JSON. No markdown.
Schema:
{"overall":"1-2 sentence assessment","weakestSkill":"reading|listening|speaking|writing|vocabulary","breakdown":[{"skill":"reading","current":0,"target":0,"gap":0,"action":"short action"}],"topActions":["action 1","action 2","action 3"]}

Be direct and practical. English only.`;
}

function buildFeedbackPrompt(profile, context, studyReference) {
  const { skill, userAnswer, taskType } = context || {};
  return `You are a TOEFL iBT examiner. Give brief feedback on this student response.

Task type: ${taskType || "general"}
Skill: ${skill || "unknown"}
Student answer: "${userAnswer || ""}"

Relevant scoring criteria:
${formatRubricForSkill(studyReference, skill)}

Return ONLY valid minified JSON. No markdown.
Schema:
{"good":"what works","improve":"what to improve","score":"Weak|Developing|Proficient|Strong","idealAnswer":"short improved answer or structure"}

Be encouraging but honest. English only. Max 80 words.`;
}

function formatStudyReference(ref) {
  if (!ref) return "No local reference database was provided.";

  const current = ref.currentScoring || {};
  const legacy = ref.legacyScoring || {};
  const calendar = Array.isArray(ref.calendar)
    ? ref.calendar.map(w => `Week ${w.week}: ${w.focus}`).join("; ")
    : "No calendar.";

  return [
    `Exam: ${ref.exam || "TOEFL iBT"}`,
    `Current scoring: ${current.overallScore || "section-based TOEFL scoring"} (${current.effectiveDate || "current format date not provided"})`,
    `Legacy/comparable score: ${legacy.totalScore || "0-120 if available"}`,
    `Study calendar themes: ${calendar}`,
    `Core rubrics: ${Object.keys(ref.rubrics || {}).join(", ")}`
  ].join("\n");
}

function formatRubricForSkill(ref, skill) {
  const key = String(skill || "").toLowerCase();
  const rubrics = ref?.rubrics || {};
  const items = rubrics[key] || rubrics.speaking || rubrics.writing || [];
  return Array.isArray(items) ? items.map(item => `- ${item}`).join("\n") : "Use TOEFL clarity, organization, accuracy, and task fulfillment criteria.";
}

function formatWeakZones(weakZones) {
  if (!Array.isArray(weakZones) || weakZones.length === 0) return "No weak-zone data provided.";
  return weakZones.slice(0, 5).map(zone => {
    const pct = Math.round((Number(zone.score) || 0) * 100);
    return `  - ${zone.skill}: ${pct}% weighted error rate (${zone.mistakes || 0}/${zone.total || 0}), confidence ${zone.confidence || "unknown"}`;
  }).join("\n");
}

function formatConfidence(confidence) {
  if (!confidence || typeof confidence !== "object") return "Overall confidence: not provided";
  const skillLines = Object.entries(confidence.bySkill || {}).map(([skill, item]) => {
    return `  - ${skill}: ${item.level || "unknown"} (${item.score ?? "n/a"}%), sample ${item.sampleSize ?? "n/a"}`;
  }).join("\n");
  return `Overall confidence: ${confidence.level || "unknown"} (${confidence.score ?? "n/a"}%)${skillLines ? `\n${skillLines}` : ""}`;
}

module.exports = router;
