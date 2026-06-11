// ─────────────────────────────────────────────────────────────────────────────
//  Prompt builders. Pure functions: profile/reference in → prompt string out.
//  Kept separate from transport (provider.js) and orchestration (aiService.js).
// ─────────────────────────────────────────────────────────────────────────────

const SKILLS = ["reading", "listening", "speaking", "writing", "vocabulary"];

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
- Every task MUST include a concrete "reason" explaining why it matters for this student.
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

function buildRecommendationsPrompt(profile, studyReference) {
  const { targetScore, currentPrediction, preparationDays, mistakes, totalTasks } = profile;

  const skillLines = Object.entries(mistakes || {}).map(([skill, m]) => {
    const total = totalTasks?.[skill] || 10;
    const pct = Math.round((m / total) * 100);
    return `  - ${skill}: ${pct}% error rate (${m}/${total} mistakes)`;
  }).join("\n");

  return `You are an expert TOEFL iBT coach generating the dashboard "recommended focus" widget.

Student Profile:
- Target TOEFL Score: ${targetScore}
- Current Predicted Score: ${currentPrediction}
- Days until exam: ${preparationDays}
- Score gap: ${targetScore - currentPrediction} points

Skill Error Rates:
${skillLines}

Reference Data:
${formatStudyReference(studyReference)}

Task: Return ONLY valid minified JSON. No markdown.
Schema:
{"headline":"one short motivating sentence","recommendations":[{"skill":"reading|listening|speaking|writing|vocabulary","title":"short focus area","reason":"why now, tied to this student's data","priority":"high|medium|low","minutes":10}]}

Rules:
- Return 3 recommendations, ordered most-impactful first.
- Each recommendation MUST cite a concrete reason from the student's data.
- English only.`;
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
  return Array.isArray(items)
    ? items.map(item => `- ${item}`).join("\n")
    : "Use TOEFL clarity, organization, accuracy, and task fulfillment criteria.";
}

module.exports = {
  SKILLS,
  buildStudyPlanPrompt,
  buildScoreGapPrompt,
  buildFeedbackPrompt,
  buildRecommendationsPrompt
};
