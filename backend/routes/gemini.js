const express = require("express");
const router = express.Router();

// Groq — free tier: 30 RPM, 14 400 req/day
// Free models: llama-3.1-8b-instant, llama-3.3-70b-versatile, mixtral-8x7b-32768
const GROQ_MODEL   = "llama-3.1-8b-instant";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

/**
 * POST /api/gemini/analyze
 * Body: { userProfile, action: "study_plan" | "score_gap" | "feedback" }
 */
router.post("/analyze", async (req, res) => {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return res.status(503).json({
      error: "Groq API key not configured. Add GROQ_API_KEY to backend/.env"
    });
  }

  const { userProfile, action, extraContext } = req.body;

  if (!userProfile || !action) {
    return res.status(400).json({ error: "Missing userProfile or action" });
  }

  const prompts = {
    study_plan: buildStudyPlanPrompt(userProfile),
    score_gap:  buildScoreGapPrompt(userProfile),
    feedback:   buildFeedbackPrompt(userProfile, extraContext)
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
        max_tokens: 512,
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

function buildStudyPlanPrompt(profile) {
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

Task: Write a SHORT, actionable study plan for TODAY. Format it as:
1. Priority focus (which 1-2 skills to work on today and why, 2 sentences)
2. Today's tasks (5 bullet points, each max 1 line)
3. One motivational sentence

Be concise. Use English. Max 200 words.`;
}

function buildScoreGapPrompt(profile) {
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

Task: Write a BRIEF score gap analysis. Format:
1. Overall assessment (1-2 sentences)
2. Biggest weakness and why it matters (2-3 sentences)
3. Top 3 specific actions to close the gap (bullet points)

Be direct and practical. Use English. Max 150 words.`;
}

function buildFeedbackPrompt(profile, context) {
  const { skill, userAnswer, taskType } = context || {};
  return `You are a TOEFL iBT examiner. Give brief feedback on this student response.

Task type: ${taskType || "general"}
Skill: ${skill || "unknown"}
Student answer: "${userAnswer || ""}"

Evaluate in 3 lines max:
1. What's good
2. What to improve
3. Score estimate: Weak / Developing / Proficient / Strong

Be encouraging but honest. English only. Max 80 words.`;
}

module.exports = router;
