// AI TOEFL Coach - Groq-backed AI API integration

// Docker/nginx proxies /api/. Static local dev calls backend directly.
const API_BASE = (() => {
  const localStaticHosts = new Set(["localhost:3000", "127.0.0.1:3000"]);
  if (window.location.protocol === "file:" || localStaticHosts.has(window.location.host)) {
    return "http://localhost:3001/api/ai";
  }
  return "/api/ai";
})();

function percentClass(prefix, value) {
  const pct = Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
  return `${prefix}-${pct}`;
}

async function callGroqAI(action, extraContext = null) {
  const profile = loadProfile();
  const scoring = buildScoringSnapshot(profile);

  const body = {
    userProfile: {
      targetScore:      profile.targetScore,
      currentPrediction: scoring.predictedScore,
      preparationDays:  daysRemaining(profile),
      mistakes:         profile.mistakes,
      totalTasks:       profile.totalTasks,
      scores:           profile.scores,
      progress:         profile.progress,
      proficiency:      scoring.proficiency,
      confidence:       scoring.confidence,
      weakZones:        scoring.weakZones,
      readiness:        scoring.readiness,
      sampleSize:       scoring.sampleSize,
      scoringModelVersion: scoring.modelVersion
    },
    studyReference: buildStudyReferenceSummary(),
    action,
    extraContext
  };

  const resp = await fetch(API_BASE + "/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: "Network error" }));
    const requestError = new Error(err.error || `HTTP ${resp.status}`);
    requestError.status = resp.status;
    requestError.code = err.code || inferAIErrorCode(resp.status, requestError.message);
    requestError.action = action;
    throw requestError;
  }

  const data = await resp.json();
  return data.result || "";
}

function inferAIErrorCode(status, message = "") {
  const text = String(message).toLowerCase();
  if (status === 429) return "RATE_LIMITED";
  if (status === 504 || text.includes("timed out")) return "AI_TIMEOUT";
  if (status === 503 || text.includes("not configured")) return "AI_UNAVAILABLE";
  if (status === 502 || text.includes("invalid json")) return "INVALID_AI_RESPONSE";
  if (status === 400) return "VALIDATION_ERROR";
  if (status >= 500) return "AI_PROXY_ERROR";
  return "AI_REQUEST_FAILED";
}

function buildStudyReferenceSummary() {
  if (typeof TOEFL_REFERENCE_DB === "undefined") return null;

  return {
    exam: TOEFL_REFERENCE_DB.exam.name,
    currentScoring: TOEFL_REFERENCE_DB.exam.formatAfter2026,
    legacyScoring: TOEFL_REFERENCE_DB.exam.formatBefore2026,
    rubrics: TOEFL_REFERENCE_DB.scoringRubrics,
    calendar: TOEFL_REFERENCE_DB.studyCalendar,
    legalResources: TOEFL_REFERENCE_DB.exam.officialResources.map(resource => ({
      title: resource.title,
      use: resource.use,
      url: resource.url
    }))
  };
}

// ─── Study Plan ──────────────────────────────────

async function fetchAIStudyPlan() {
  return callGroqAI("study_plan");
}

// ─── Score Gap ────────────────────────────────────

async function fetchScoreGapAnalysis() {
  return callGroqAI("score_gap");
}

// ─── Speaking / Writing feedback ─────────────────

async function fetchAnswerFeedback(skill, userAnswer, taskType) {
  return callGroqAI("feedback", { skill, userAnswer, taskType });
}

// ─── RENDER: Score Gap Visual ────────────────────

function renderScoreGapVisual(profile) {
  const target  = profile.targetScore;
  const current = calcPredictedScore(profile);
  const skills  = ["reading","listening","speaking","writing"];

  const targetPerSkill = Math.round(target / 4);

  let html = `
    <div class="gap-summary">
      <span>Current: <strong class="text-accent">${current}</strong></span>
      <span>Target: <strong class="text-success">${target}</strong></span>
      <span>Gap: <strong class="text-warning">-${Math.max(0, target - current)}</strong></span>
    </div>`;

  skills.forEach(skill => {
    const curr  = profile.scores[skill];
    const tgt   = targetPerSkill;
    const gap   = Math.max(0, tgt - curr);
    const pct   = Math.min(100, Math.round((curr / 30) * 100));
    const tgtPct = Math.min(100, Math.round((tgt / 30) * 100));
    const meta  = SKILL_META[skill];

    html += `
      <div class="gap-row">
        <span class="gap-row-label">${meta.label}</span>
        <div class="gap-track">
          <div class="gap-current fill-${skill} ${percentClass("w", pct)}"></div>
          <div class="gap-target-marker ${percentClass("left", tgtPct)}"></div>
        </div>
        <span class="gap-numbers">${curr}/<span class="text-muted">${tgt}</span>
          ${gap > 0 ? `<span class="gap-plus"> +${gap}</span>` : ' <span class="text-success">✓</span>'}
        </span>
      </div>`;
  });

  return html;
}
