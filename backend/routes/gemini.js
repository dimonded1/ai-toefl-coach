const express = require("express");
const router = express.Router();

// Groq — free tier: 30 RPM, 14 400 req/day
// Free models: llama-3.1-8b-instant, llama-3.3-70b-versatile, mixtral-8x7b-32768
const GROQ_MODEL   = "llama-3.1-8b-instant";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

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

  if (!userProfile || !action) {
    return res.status(400).json({ error: "Missing userProfile or action" });
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

  try {
    const { default: fetch } = await import("node-fetch");

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
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

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error("[Groq API Error]", errData);
      return res.status(response.status).json({
        error: errData.error?.message || `Groq API error ${response.status}`
      });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";

    res.json({ result: text });
  } catch (err) {
    console.error("[Groq fetch error]", err.message);
    res.status(500).json({ error: "Failed to reach Groq API" });
  }
});

// ─── Prompt builders ────────────────────────────────────────────────────────

function buildStudyPlanPrompt(profile, studyReference) {
  const { targetScore, currentPrediction, preparationDays, mistakes, totalTasks } = profile;

  const skillLines = Object.entries(mistakes || {}).map(([skill, m]) => {
    const total = totalTasks?.[skill] || 10;
    const pct = Math.round((m / total) * 100);
    return `  - ${skill}: ${pct}% error rate (${m}/${total} mistakes)`;
  }).join("\n");

  return `You are an expert TOEFL iBT coach. Analyze this student's performance and create a personalized study plan.

Student Profile:
- Target TOEFL Score: ${targetScore}
- Current Predicted Score: ${currentPrediction}
- Days until exam: ${preparationDays}
- Score gap: ${targetScore - currentPrediction} points

Skill Error Rates:
${skillLines}

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
  const { targetScore, currentPrediction, scores } = profile;
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

module.exports = router;
