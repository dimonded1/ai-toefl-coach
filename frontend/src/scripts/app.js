// AI TOEFL Coach - Main Application

// ─── State ───────────────────────────────────────
let profile = loadProfile();
let accountSyncState = { state: "local", message: "Local mode" };

const AVATAR_TONES = ["teal", "blue", "violet", "rose", "amber", "mint", "indigo", "sky", "green", "pink", "slate", "cyan"];

const PAGE_TITLES = {
  dashboard: "Dashboard",
  practice: "Practice",
  aiplan: "Study Plan",
  analytics: "Analytics",
  goal: "Profile"
};

const PRACTICE_SECTIONS = ["vocabulary","reading","listening","speaking","writing","minitest"];

// Per-section question state
const practiceState = {
  vocabulary: { idx: 0, questions: [], answered: false },
  reading:    { idx: 0, questions: [], answered: false },
  listening:  { idx: 0, questions: [], answered: false, played: false },
  speaking:   { idx: 0, questions: [], answered: false },
  writing:    { idx: 0, questions: [], answered: false },
  minitest:   { idx: 0, questions: [], answers: [], started: false, done: false }
};

// ─── INIT ────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initGoalForm();
  initAccountSync();
  initDashboard();
  initPracticeSection("vocabulary");
  initPracticeSection("reading");
  initPracticeSection("listening");
  initPracticeSection("speaking");
  initPracticeSection("writing");
  initMiniTest();
  initAIPlan();
  initAnalytics();
  renderAppShell();

  // Start on dashboard unless no goal set
  if (!profile.startDate) {
    navigateTo("goal");
    showToast("Set your TOEFL goal to get started.", "info");
  } else {
    navigateTo("dashboard");
  }

  hydrateProfileFromBackend();

  document.getElementById("resetBtn").addEventListener("click", () => {
    if (confirm("Reset all progress? This cannot be undone.")) {
      profile = resetProfile();
      practiceState.vocabulary.idx = 0;
      practiceState.reading.idx    = 0;
      practiceState.listening.idx  = 0;
      practiceState.speaking.idx   = 0;
      practiceState.writing.idx    = 0;
      initDashboard();
      renderAppShell();
      navigateTo("dashboard");
      showToast("Progress reset.", "info");
    }
  });
});

// ─── NAVIGATION ──────────────────────────────────
function initNavigation() {
  document.addEventListener("click", e => {
    const trigger = e.target.closest("[data-section]");
    if (!trigger) return;
    e.preventDefault();
    navigateTo(trigger.dataset.section);
    document.getElementById("sidebar").classList.remove("open");
  });

  document.getElementById("hamburger").addEventListener("click", () => {
    const sidebar = document.getElementById("sidebar");
    const isOpen = sidebar.classList.toggle("open");
    document.getElementById("hamburger").setAttribute("aria-expanded", String(isOpen));
  });
}

function getNavSection(section) {
  if (PRACTICE_SECTIONS.includes(section)) return "practice";
  if (section === "mistakes") return "analytics";
  return section;
}

function navigateTo(section) {
  // Update sidebar
  document.querySelectorAll(".nav-link").forEach(l => {
    l.classList.remove("active");
    l.removeAttribute("aria-current");
  });
  const activeLink = document.querySelector(`.nav-link[data-section="${getNavSection(section)}"]`);
  if (activeLink) {
    activeLink.classList.add("active");
    activeLink.setAttribute("aria-current", "page");
  }

  // Show section
  document.querySelectorAll(".section").forEach(s => {
    s.classList.remove("active");
    s.setAttribute("hidden", "");
  });
  const el = document.getElementById(`section-${section}`);
  if (el) {
    el.classList.add("active");
    el.removeAttribute("hidden");
  }

  // Page title
  document.getElementById("pageTitle").textContent = PAGE_TITLES[section] || SECTION_TITLES[section] || section;
  document.getElementById("mainContent").focus?.();

  // Refresh content on navigate
  if (section === "dashboard") renderDashboard();
  if (section === "practice")  renderPracticeHub();
  if (section === "mistakes")  renderMistakesSection();
  if (section === "analytics") renderAnalytics();
  if (section === "aiplan")    renderAIPlanSection();
  if (section === "goal")      renderProfileScreen();
  if (["vocabulary","reading","listening","speaking","writing"].includes(section)) {
    renderQuestion(section);
  }
}

function renderAppShell() {
  profile = loadProfile();
  const predicted = calcPredictedScore(profile);
  const day = Math.min(profile.preparationDays || 60, Math.max(1, (profile.preparationDays || 60) - daysRemaining(profile) + 1));
  setText("topScore", predicted);
  setText("sidebarName", profile.name || "Alex Carter");
  setText("sidebarScoreLine", `Current ${predicted} to Goal ${profile.targetScore}`);
  setText("sidebarTarget", profile.targetScore);
  setText("sidebarDay", `${day} / ${profile.preparationDays || 60}`);
  setAvatar("sidebarAvatar", profile.name);
}

async function hydrateProfileFromBackend() {
  renderAccountSync();
  if (typeof isAuthenticated !== "function" || !isAuthenticated()) return;

  const syncedProfile = await syncProfileFromBackend();
  if (!syncedProfile) {
    renderAccountSync();
    return;
  }

  profile = syncedProfile;
  renderAppShell();
  renderCurrentSection();
  renderAccountSync();
}

function renderCurrentSection() {
  const active = document.querySelector(".section.active");
  const section = active?.id?.replace("section-", "");
  if (!section) return;
  if (section === "dashboard") renderDashboard();
  if (section === "practice") renderPracticeHub();
  if (section === "mistakes") renderMistakesSection();
  if (section === "analytics") renderAnalytics();
  if (section === "aiplan") renderAIPlanSection();
  if (section === "goal") renderProfileScreen();
  if (["vocabulary","reading","listening","speaking","writing"].includes(section)) {
    renderQuestion(section);
  }
}

function setAvatar(id, name) {
  const el = document.getElementById(id);
  if (!el) return;
  const tone = getAvatarTone(name);
  el.className = `${el.className.split(" ").filter(cls => !cls.startsWith("avatar-tone-")).join(" ")} avatar-tone-${tone}`;
  el.textContent = getInitials(name);
}

function getInitials(name) {
  const parts = String(name || "Alex Carter").trim().split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] || "A") + (parts[1]?.[0] || "");
}

function getAvatarTone(name) {
  const source = String(name || "Alex Carter");
  const hash = [...source].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return AVATAR_TONES[hash % AVATAR_TONES.length];
}

// ─── DASHBOARD ───────────────────────────────────
function initDashboard() {
  document.getElementById("refreshAIBtn").addEventListener("click", async () => {
    await refreshTodayAIPlan();
  });
  document.getElementById("startFocusBtn").addEventListener("click", () => {
    const section = document.getElementById("startFocusBtn").dataset.section || "minitest";
    navigateTo(section);
  });
  renderDashboard();
}

function renderDashboard() {
  profile = loadProfile();
  const predicted = calcPredictedScore(profile);
  const gap       = Math.max(0, profile.targetScore - predicted);
  const days      = daysRemaining(profile);

  const scoreProgress = Math.min(100, Math.round((predicted / Math.max(profile.targetScore, 1)) * 100));
  const taskCount = totalCompletedTasks(profile);

  setText("dashTarget", profile.targetScore);
  setText("dashTargetStat", profile.targetScore);
  setText("dashCurrent", predicted);
  setText("dashCurrentStat", predicted);
  setText("dashGap", gap);
  setText("dashGapStat", gap);
  setText("dashDays", days);
  setText("topScore", predicted);
  setText("dashTasks", `${taskCount} ${taskCount === 1 ? "task" : "tasks"}`);
  setText("sidebarStreak", `${profile.streak?.current || 0} days`);
  setText("dashboardInsight", buildDashboardInsight(predicted, gap, days));
  const ring = document.getElementById("scoreRing");
  if (ring) ring.style.setProperty("--score-progress", `${scoreProgress}%`);

  renderSkillBars();
  renderWeakZones();
  renderTodayPlan();
  renderPrimaryFocus();
  renderAppShell();
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function totalCompletedTasks(currentProfile) {
  return Object.values(currentProfile.totalTasks || {}).reduce((sum, value) => sum + (value || 0), 0);
}

function buildDashboardInsight(predicted, gap, days) {
  if (gap <= 0) return "You are at or above target. Keep the rhythm and protect your strongest sections.";
  if (totalCompletedTasks(profile) === 0) return "Run the diagnostic first. The coach will turn your answers into a focused plan.";
  return `${gap} points to close over ${days} days. Prioritize the weakest skill before adding volume.`;
}

function getPrimaryFocus(currentProfile) {
  const totalTasks = totalCompletedTasks(currentProfile);
  if (totalTasks === 0) {
    return {
      section: "minitest",
      skill: "minitest",
      title: "Run a 10-question diagnostic",
      reason: "Start with a mixed mini test so the coach can find your first weak zones.",
      meta: ["10 questions", "Mixed skills", "Diagnostic"]
    };
  }

  const plan = normalizeStudyPlan(null, currentProfile);
  const task = plan.tasks[0];
  if (!task) {
    return {
      section: "practice",
      skill: "practice",
      title: "Choose a focused practice set",
      reason: "Keep daily practice moving while your data builds up.",
      meta: ["Practice", "Daily loop"]
    };
  }

  return {
    section: task.skill,
    skill: task.skill,
    title: task.title,
    reason: task.reason,
    meta: [SKILL_META[task.skill]?.label || task.skill, `${task.minutes} min`, task.type]
  };
}

function renderPrimaryFocus() {
  const focus = getPrimaryFocus(profile);
  document.getElementById("primaryFocusTitle").textContent = focus.title;
  document.getElementById("primaryFocusReason").textContent = focus.reason;
  document.getElementById("primaryFocusMeta").innerHTML = focus.meta
    .map(item => `<span class="plan-pill">${escapeHtml(item)}</span>`)
    .join("");
  document.getElementById("startFocusBtn").dataset.section = focus.section;
}

function renderSkillBars() {
  const container = document.getElementById("skillBars");
  const skills = ["reading","listening","speaking","writing"];
  container.innerHTML = skills.map(skill => {
    const meta = SKILL_META[skill];
    const score = profile.scores[skill] || 0;
    const pct = Math.round((score / 30) * 100);
    const total = profile.totalTasks[skill] || 0;
    const status = getSkillStatus(score);
    return `
      <div class="skill-row-modern">
        <div class="skill-row-top">
          <span class="skill-dot fill-${skill}"></span>
          <span class="skill-bar-label">${meta.label}</span>
          <strong>${score}/30</strong>
        </div>
        <div class="skill-bar-track">
          <div class="skill-bar-fill ${meta.fillClass} ${percentClass("w", pct)}"></div>
        </div>
        <div class="skill-row-meta">
          <span class="skill-status ${status.className}">${status.label}</span>
          <span>${total} tasks</span>
        </div>
      </div>`;
  }).join("");
}

function getSkillStatus(score) {
  if (score <= 14) return { label: "Priority", className: "priority" };
  if (score <= 20) return { label: "Needs practice", className: "needs" };
  return { label: "Stable", className: "stable" };
}

function renderWeakZones() {
  const container = document.getElementById("weakList");
  const weak      = calcWeaknessScores(profile).filter(s => s.total > 0);

  if (weak.length === 0) {
    const starterZones = [
      { skill: "reading", title: "Reading inference", copy: "Train evidence matching before timed passages.", risk: "Priority" },
      { skill: "listening", title: "Listening details", copy: "Catch speaker intent, examples, and lecture turns.", risk: "Priority" },
      { skill: "writing", title: "Writing structure", copy: "Build claim, support, and paragraph flow.", risk: "Needs practice" }
    ];
    container.innerHTML = starterZones.map(item => `
      <button class="weak-zone-card" data-section="${item.skill}">
        <span class="weak-zone-tag">${item.risk}</span>
        <strong>${item.title}</strong>
        <span>${item.copy}</span>
      </button>`).join("");
    return;
  }

  container.innerHTML = weak.slice(0, 4).map(w => {
    const meta     = SKILL_META[w.skill];
    const errPct   = Math.round(w.score * 100);
    const severity = w.score >= 0.5 ? "High priority" : "Medium priority";
    return `
      <button class="weak-zone-card" data-section="${w.skill}">
        <span class="weak-zone-tag">${severity}</span>
        <strong>${meta.label}</strong>
        <span>${errPct}% error rate across ${w.total} tasks.</span>
      </button>`;
  }).join("");
}

function renderTrajectoryChart(predicted) {
  renderTrajectoryChartInto("trajectoryChart", predicted);
}

function renderTrajectoryChartInto(containerId, predicted) {
  const targetContainer = document.getElementById(containerId);
  if (!targetContainer) return;
  renderTrajectoryBars(targetContainer, predicted);
}

function renderTrajectoryBars(container, predicted) {
  if (!container) return;

  const target = profile.targetScore || 95;
  const start = Math.max(35, Math.min(predicted - 10, predicted));
  const history = profile.miniTestHistory || [];
  const lastScores = history.slice(-8).map(item => item.predictedScore || predicted);
  const points = lastScores.length >= 2
    ? lastScores
    : Array.from({ length: 8 }, (_, i) => Math.round(start + ((predicted - start) * i / 7)));

  container.innerHTML = points.map((score, index) => {
    const pct = Math.max(18, Math.min(100, Math.round((score / Math.max(target, 1)) * 100)));
    return `
      <div class="trajectory-week">
        <span class="trajectory-bar" style="--bar-height:${pct}%"></span>
        <small>W${index + 1}</small>
      </div>`;
  }).join("");
  setText("trajectoryInsight", points.length > 1
    ? `Projected movement: ${points[0]} to ${points[points.length - 1]} toward your ${target} target.`
    : "Complete a mini test to start charting score movement.");
}

function renderTodayPlan() {
  const container = document.getElementById("todayPlan");

  // Use cached AI plan if recent (same day)
  if (profile.lastAIPlan && profile.lastAIPlanDate) {
    const today = new Date().toDateString();
    const planDate = new Date(profile.lastAIPlanDate).toDateString();
    if (today === planDate) {
      container.innerHTML = renderPlanHtml(normalizeStudyPlan(profile.lastAIPlan, profile));
      return;
    }
  }

  // Use local plan
  container.innerHTML = renderPlanHtml(normalizeStudyPlan(null, profile));
}

function renderHabitProgress() {
  const container = document.getElementById("habitProgress");
  if (!container) return;
  const level = calcUserLevel(profile);
  const next = xpForNextLevel(profile);
  const prev = (level - 1) * 120;
  const xp = profile.xp || 0;
  const pct = Math.min(100, Math.round(((xp - prev) / Math.max(1, next - prev)) * 100));
  const achievements = (profile.achievements || []).slice(-2);

  container.innerHTML = `
    <div class="habit-grid">
      <div class="habit-stat"><div class="habit-value">${level}</div><div class="habit-label">Level</div></div>
      <div class="habit-stat"><div class="habit-value">${profile.streak?.current || 0}</div><div class="habit-label">Day streak</div></div>
      <div class="habit-stat"><div class="habit-value">${xp}</div><div class="habit-label">Total XP</div></div>
      <div class="habit-stat"><div class="habit-value">${profile.streak?.best || 0}</div><div class="habit-label">Best streak</div></div>
    </div>
    <div class="xp-track"><div class="xp-fill ${percentClass("w", pct)}"></div></div>
    <div class="plan-why plan-why-spaced">${Math.max(0, next - xp)} XP to Level ${level + 1}</div>
    <div class="achievement-list achievement-list-spaced">
      ${achievements.length ? achievements.map(a => `<div class="achievement-mini">${a}</div>`).join("") : `<div class="placeholder-text placeholder-text-compact">Earn achievements by practicing.</div>`}
    </div>`;
}

function renderSmartFocus() {
  const container = document.getElementById("smartFocus");
  if (!container) return;
  const plan = normalizeStudyPlan(null, profile);
  container.innerHTML = `
    <div class="smart-list">
      ${plan.tasks.slice(0, 3).map(task => `
        <div class="smart-item">
          <strong>${task.title}</strong>
          <span>${task.reason}</span>
        </div>`).join("")}
    </div>`;
}

function renderMistakePreview() {
  const container = document.getElementById("mistakePreview");
  if (!container) return;
  const mistakes = (profile.mistakeBank || []).filter(item => !item.mastered).slice(0, 4);
  if (!mistakes.length) {
    container.innerHTML = `<p class="placeholder-text placeholder-text-compact">Wrong answers will appear here for review.</p>`;
    return;
  }

  container.innerHTML = `
    <div class="mistake-list">
      ${mistakes.map(item => `
        <div class="mistake-mini">
          <strong>${item.topic}</strong>
          <span>${escapeHtml(item.prompt).slice(0, 86)}${item.prompt.length > 86 ? "..." : ""}</span>
        </div>`).join("")}
    </div>`;
}

function renderPracticeHub() {
  const container = document.getElementById("practiceHub");
  if (!container) return;

  profile = loadProfile();
  const skills = ["reading","listening","speaking","writing","vocabulary"];
  const focus = getPrimaryFocus(profile);
  const skillCards = skills.map(skill => {
    const meta = SKILL_META[skill];
    const correct = profile.correct[skill] || 0;
    const total = profile.totalTasks[skill] || 0;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    const mistakes = profile.mistakes[skill] || 0;
    const readiness = skill === "vocabulary" ? pct : Math.round(((profile.scores[skill] || 0) / 30) * 100);
    const status = total === 0 ? "Not started" : pct >= 75 ? "Stable" : pct >= 50 ? "Needs practice" : "Priority";

    return `
      <button class="skill-practice-card" data-section="${skill}">
        <span class="hub-icon">${meta.label.slice(0, 1)}</span>
        <span class="hub-title">${meta.label}</span>
        <span class="skill-status ${statusClass(status)}">${status}</span>
        <span class="hub-copy">${total ? `${pct}% accuracy from ${total} tasks` : "Start with a short drill"}</span>
        <span class="hub-bar"><span class="hub-bar-fill fill-${skill} ${percentClass("w", readiness)}"></span></span>
        <span class="hub-meta">${mistakes} mistakes · readiness ${readiness}%</span>
      </button>`;
  }).join("");

  container.innerHTML = `
    <div class="card today-practice-card">
      <div class="card-kicker">Today's practice</div>
      <h2>${escapeHtml(focus.title)}</h2>
      <p>${escapeHtml(focus.reason)}</p>
      <div class="focus-meta">${focus.meta.map(item => `<span class="plan-pill">${escapeHtml(item)}</span>`).join("")}</div>
      <button class="btn-primary" data-section="${focus.section}">Start recommended drill</button>
    </div>
    <button class="card mini-test-feature" data-section="minitest">
      <span class="hub-icon">10</span>
      <span>
        <strong>Mini TOEFL Test</strong>
        <small>Mixed diagnostic across all skills. Updates prediction and weak zones.</small>
      </span>
    </button>
    <div class="practice-skills-grid">${skillCards}</div>`;
}

function statusClass(status) {
  const value = String(status).toLowerCase();
  if (value.includes("priority")) return "priority";
  if (value.includes("needs")) return "needs";
  if (value.includes("stable")) return "stable";
  return "";
}

function renderMistakesSection() {
  const container = document.getElementById("mistakesHub");
  if (!container) return;

  profile = loadProfile();
  const weak = calcWeaknessScores(profile).filter(item => item.total > 0);
  const mistakes = (profile.mistakeBank || []).filter(item => !item.mastered);

  const weakHtml = weak.length
    ? weak.slice(0, 5).map(item => {
        const meta = SKILL_META[item.skill];
        const errPct = Math.round(item.score * 100);
        return `
          <button class="mistake-focus-row" data-section="${item.skill}">
            <span>${meta.label}</span>
            <strong>${errPct}% errors</strong>
            <small>${item.mistakes}/${item.total} missed</small>
          </button>`;
      }).join("")
    : `<p class="placeholder-text">Complete practice tasks to build your weak-zone list.</p>`;

  const mistakesHtml = mistakes.length
    ? mistakes.slice(0, 10).map(item => `
        <button class="mistake-review-card" data-section="${item.skill}">
          <span class="mistake-review-skill">${SKILL_META[item.skill]?.label || item.skill}</span>
          <strong>${escapeHtml(item.topic)}</strong>
          <span>${escapeHtml(item.prompt).slice(0, 160)}${item.prompt.length > 160 ? "..." : ""}</span>
          ${item.correctAnswer ? `<small>Correct: ${escapeHtml(item.correctAnswer)}</small>` : ""}
        </button>`).join("")
    : `<p class="placeholder-text">Missed questions will appear here after practice.</p>`;

  container.innerHTML = `
    <div class="card mistakes-panel">
      <h2 class="card-title">Weak Zones</h2>
      <div class="mistake-focus-list">${weakHtml}</div>
    </div>
    <div class="card mistakes-panel">
      <h2 class="card-title">Review Bank</h2>
      <div class="mistake-review-list">${mistakesHtml}</div>
    </div>`;
}

function normalizeStudyPlan(rawPlan, currentProfile) {
  const local = generateLocalStudyPlan(currentProfile);
  const parsed = parseJsonFromAI(rawPlan);
  const cleanedSummary = parsed?.summary || cleanAIText(rawPlan || local.explanation).split("\n").find(Boolean) || local.explanation;
  const aiTasks = Array.isArray(parsed?.tasks) ? parsed.tasks : [];
  const fallbackTasks = local.tasks.map(task => ({
    skill: task.skill,
    title: task.task,
    reason: task.why,
    minutes: task.skill === "vocabulary" ? 8 : 15,
    type: task.skill === "speaking" || task.skill === "writing" ? "ai-feedback" : "drill"
  }));

  const tasks = normalizePlanTasks(aiTasks, fallbackTasks);
  return {
    summary: cleanedSummary,
    tasks,
    motivation: parsed?.motivation || "Small daily practice compounds into real score movement."
  };
}

function normalizePlanTasks(aiTasks, fallbackTasks) {
  const allowed = new Set(["reading","listening","speaking","writing","vocabulary"]);
  const tasks = aiTasks.map(task => {
    const skill = String(task.skill || "").toLowerCase();
    if (!allowed.has(skill)) return null;
    return {
      skill,
      title: cleanAIText(task.title || task.task || `Practice ${SKILL_META[skill].label}`),
      reason: cleanAIText(task.reason || "Targets your current score gap."),
      minutes: Number(task.minutes) || 12,
      type: cleanAIText(task.type || "drill")
    };
  }).filter(Boolean);

  fallbackTasks.forEach(task => {
    if (tasks.length < 5 && !tasks.some(existing => existing.skill === task.skill)) tasks.push(task);
  });

  return tasks.slice(0, 5);
}

function renderPlanHtml(plan) {
  return `
    <div class="feedback-box info plan-summary">${escapeHtml(plan.summary)}</div>
    ${plan.tasks.map((task, i) => `
      <div class="plan-item">
        <div class="plan-num">${i + 1}</div>
        <div>
          <div class="plan-text">${escapeHtml(task.title)}</div>
          <div class="plan-why">${escapeHtml(task.reason)}</div>
          <div class="plan-meta">
            <span class="plan-pill">${escapeHtml(SKILL_META[task.skill]?.label || task.skill)}</span>
            <span class="plan-pill">${task.minutes} min</span>
            <span class="plan-pill">${escapeHtml(task.type)}</span>
          </div>
        </div>
      </div>`).join("")}`;
}

function parseJsonFromAI(raw) {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) return raw;
  if (!raw || typeof raw !== "string") return null;
  try { return JSON.parse(raw); } catch {}
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try { return JSON.parse(match[0]); } catch { return null; }
}

function cleanAIText(text) {
  return String(text || "")
    .replace(/\*\*/g, "")
    .replace(/^\s*[*-]\s+/gm, "")
    .replace(/#+\s*/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function getAIStatusCopy(err) {
  const code = err?.code || "AI_REQUEST_FAILED";
  const status = err?.status ? `HTTP ${err.status}` : "Local fallback";
  const copies = {
    RATE_LIMITED: {
      tone: "warning",
      label: "Rate limit",
      title: "AI is taking a short break",
      message: "Too many AI requests were sent recently. Your local plan is still ready to use."
    },
    AI_TIMEOUT: {
      tone: "warning",
      label: "Timeout",
      title: "AI took too long to answer",
      message: "The coach switched to a local fallback so you can keep preparing without waiting."
    },
    AI_UNAVAILABLE: {
      tone: "danger",
      label: "Unavailable",
      title: "AI is not available right now",
      message: "The Groq connection or API key is not ready. Local recommendations are shown instead."
    },
    INVALID_AI_RESPONSE: {
      tone: "warning",
      label: "Invalid response",
      title: "AI response could not be used",
      message: "The app protected the plan quality and replaced the response with a structured fallback."
    },
    VALIDATION_ERROR: {
      tone: "danger",
      label: "Data issue",
      title: "The request needs cleaner data",
      message: "Some study data did not pass validation. A local plan is shown while the data is corrected."
    },
    AI_PROXY_ERROR: {
      tone: "danger",
      label: "Server error",
      title: "AI proxy had a problem",
      message: "The backend could not complete the AI request. You can keep working with the local plan."
    },
    AI_REQUEST_FAILED: {
      tone: "danger",
      label: "Fallback",
      title: "AI plan could not be generated",
      message: "The app switched to local recommendations so the preparation flow stays usable."
    }
  };
  return { ...copies[code] || copies.AI_REQUEST_FAILED, detail: err?.message || status, code };
}

function renderAIStatus(state, options = {}) {
  const detail = options.showDetail === false ? "" : `<small>${escapeHtml(state.detail)}</small>`;
  const action = options.action ? `<span class="ai-state-action">${escapeHtml(options.action)}</span>` : "";
  return `
    <div class="ai-state-card ai-state-${state.tone}" role="status">
      <div class="ai-state-icon">${state.tone === "danger" ? "!" : "i"}</div>
      <div class="ai-state-copy">
        <div class="ai-state-topline">
          <span class="ai-state-label">${escapeHtml(state.label)}</span>
          ${action}
        </div>
        <strong>${escapeHtml(state.title)}</strong>
        <p>${escapeHtml(state.message)}</p>
        ${detail}
      </div>
    </div>`;
}

function renderAILoading(message) {
  return `
    <div class="ai-state-card ai-state-loading" role="status">
      <div class="spinner"></div>
      <div class="ai-state-copy">
        <span class="ai-state-label">AI working</span>
        <strong>${escapeHtml(message)}</strong>
        <p>Using your current score, weak zones, confidence, and target pace.</p>
      </div>
    </div>`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function refreshTodayAIPlan() {
  const btn = document.getElementById("refreshAIBtn");
  btn.disabled = true;
  btn.textContent = "Generating...";

  const container = document.getElementById("todayPlan");
  container.innerHTML = renderAILoading("Building your structured AI plan...");

  try {
    const result = await fetchAIStudyPlan();
    container.innerHTML = renderPlanHtml(normalizeStudyPlan(result, profile));
    profile.lastAIPlan     = result;
    profile.lastAIPlanDate = new Date().toISOString();
    saveProfile(profile);
    showToast("AI plan updated.", "success");
  } catch (err) {
    const state = getAIStatusCopy(err);
    container.innerHTML = `
      ${renderAIStatus(state, { action: "Local plan is active" })}
      ${renderPlanHtml(normalizeStudyPlan(null, profile))}`;
    showToast("AI unavailable. Local plan is active.", state.tone === "danger" ? "error" : "info");
  }

  btn.disabled = false;
  btn.textContent = "Refresh AI Plan";
}

// ─── GOAL SETUP ──────────────────────────────────
function initGoalForm() {
  setupBtnGroup("targetScoreGroup");
  setupBtnGroup("prepDaysGroup");
  setupBtnGroup("levelGroup");
  setupBtnGroup("goalGroup");
  document.getElementById("profileNameInput").addEventListener("input", updateSetupPreview);

  // Restore saved values
  document.getElementById("profileNameInput").value = profile.name || "Alex Carter";
  setActiveBtn("targetScoreGroup", String(profile.targetScore));
  setActiveBtn("prepDaysGroup",    String(profile.preparationDays));
  setActiveBtn("levelGroup",       profile.level);
  setActiveBtn("goalGroup",        profile.goal);
  updateSetupPreview();

  document.getElementById("saveGoalBtn").addEventListener("click", () => {
    profile.name             = document.getElementById("profileNameInput").value.trim() || "Alex Carter";
    profile.targetScore      = parseInt(getSelected("targetScoreGroup")) || 95;
    profile.preparationDays  = parseInt(getSelected("prepDaysGroup"))    || 60;
    profile.level            = getSelected("levelGroup")  || "intermediate";
    profile.goal             = getSelected("goalGroup")   || "study abroad";
    profile.startDate        = profile.startDate || new Date().toISOString();

    // Set initial scores based on level
    const levelScores = { beginner: 8, intermediate: 14, advanced: 20 };
    const base = levelScores[profile.level] || 14;
    if (profile.totalTasks.reading === 0) {
      profile.scores = { reading: base, listening: base, speaking: base, writing: base };
      profile.baselineScores = { ...profile.scores };
    }

    saveProfile(profile);
    renderAppShell();
    updateSetupPreview();
    document.getElementById("goalSaved").classList.remove("hidden");
    showToast("Goal saved. Let's start preparing.", "success");
    setTimeout(() => {
      navigateTo("dashboard");
      document.getElementById("goalSaved").classList.add("hidden");
    }, 1800);
  });
}

function initAccountSync() {
  window.addEventListener("profile-sync-state", event => {
    accountSyncState = event.detail || accountSyncState;
    renderAccountSync();
  });

  document.getElementById("createAccountBtn")?.addEventListener("click", async () => {
    await handleAuthSubmit("register");
  });
  document.getElementById("signInBtn")?.addEventListener("click", async () => {
    await handleAuthSubmit("login");
  });
  document.getElementById("syncNowBtn")?.addEventListener("click", async () => {
    await handleManualSync();
  });
  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    logoutUser();
    renderAccountSync();
    showToast("Signed out. Local mode is active.", "info");
  });

  renderAccountSync();
}

async function handleAuthSubmit(mode) {
  const nameInput = document.getElementById("authNameInput");
  const emailInput = document.getElementById("authEmailInput");
  const passwordInput = document.getElementById("authPasswordInput");
  const createBtn = document.getElementById("createAccountBtn");
  const signInBtn = document.getElementById("signInBtn");

  const name = (nameInput?.value || document.getElementById("profileNameInput")?.value || profile.name || "").trim();
  const email = (emailInput?.value || "").trim();
  const password = passwordInput?.value || "";

  createBtn.disabled = true;
  signInBtn.disabled = true;

  try {
    if (mode === "register") {
      await registerUser({ name, email, password });
      profile.name = name || profile.name;
      cacheProfile(profile);
      await apiSaveProfile(profile);
      showToast("Signed in. Progress is synced.", "success");
    } else {
      await loginUser({ email, password });
      const syncedProfile = await syncProfileFromBackend();
      if (syncedProfile) profile = syncedProfile;
      showToast("Signed in.", "success");
    }
    passwordInput.value = "";
    renderAppShell();
    renderCurrentSection();
  } catch (err) {
    showToast(err.message || "Sign in failed.", "error");
    if (typeof setProfileSyncState === "function") setProfileSyncState("failed", "Sync failed");
  } finally {
    createBtn.disabled = false;
    signInBtn.disabled = false;
    renderAccountSync();
  }
}

async function handleManualSync() {
  if (!isAuthenticated()) return;
  const btn = document.getElementById("syncNowBtn");
  btn.disabled = true;
  try {
    accountSyncState = { state: "saving", message: "Saving" };
    renderAccountSync();
    await apiSaveProfile(loadProfile());
    const syncedProfile = await syncProfileFromBackend();
    if (syncedProfile) profile = syncedProfile;
    showToast("Synced.", "success");
    renderAppShell();
    renderCurrentSection();
  } catch (err) {
    console.warn("Manual sync failed:", err);
    showToast("Sync failed. Local changes are still saved.", "error");
    accountSyncState = { state: "failed", message: "Sync failed" };
  } finally {
    btn.disabled = false;
    renderAccountSync();
  }
}

function renderAccountSync() {
  const signedIn = typeof isAuthenticated === "function" && isAuthenticated();
  const signedOutPanel = document.getElementById("accountSignedOut");
  const signedInPanel = document.getElementById("accountSignedIn");
  const status = document.getElementById("accountSyncStatus");
  if (!signedOutPanel || !signedInPanel || !status) {
    renderTopbarSyncStatus(signedIn);
    return;
  }

  signedOutPanel.classList.toggle("hidden", signedIn);
  signedInPanel.classList.toggle("hidden", !signedIn);

  if (!signedIn) {
    status.textContent = "Local mode";
    status.className = "sync-status sync-status-local";
    const nameInput = document.getElementById("authNameInput");
    if (nameInput && !nameInput.value) nameInput.value = document.getElementById("profileNameInput")?.value || profile.name || "";
    renderTopbarSyncStatus(false);
    return;
  }

  const user = getCurrentUser() || {};
  setText("accountName", user.name || profile.name || "Student");
  setText("accountEmail", user.email || "");
  setAvatar("accountAvatar", user.name || profile.name);

  const statusCopy = getSyncStatusCopy(accountSyncState);
  status.textContent = statusCopy.label;
  status.className = `sync-status ${statusCopy.className}`;
  renderTopbarSyncStatus(true);
}

function getSyncStatusCopy(state) {
  if (state.state === "failed") return { label: "Sync failed", className: "sync-status-failed" };
  if (state.state === "saving" || state.state === "syncing") return { label: "Saving", className: "sync-status-saving" };
  return { label: "Synced", className: "sync-status-synced" };
}

function renderTopbarSyncStatus(signedIn) {
  const topbarStatus = document.getElementById("topbarSyncStatus");
  if (!topbarStatus) return;

  if (!signedIn) {
    topbarStatus.textContent = "Local";
    topbarStatus.className = "sync-topbar-status sync-topbar-local";
    topbarStatus.title = "Local mode. Create an account to sync progress.";
    return;
  }

  const state = accountSyncState.state;
  if (state === "failed") {
    topbarStatus.textContent = "Sync failed";
    topbarStatus.className = "sync-topbar-status sync-topbar-failed";
    topbarStatus.title = "Sync failed. Open Profile to try again.";
    return;
  }
  if (state === "saving" || state === "syncing") {
    topbarStatus.textContent = "Saving";
    topbarStatus.className = "sync-topbar-status sync-topbar-saving";
    topbarStatus.title = "Saving profile to SQLite.";
    return;
  }

  topbarStatus.textContent = "Synced";
  topbarStatus.className = "sync-topbar-status sync-topbar-synced";
  topbarStatus.title = "Progress is synced to SQLite.";
}

function renderProfileScreen() {
  profile = loadProfile();
  document.getElementById("profileNameInput").value = profile.name || "Alex Carter";
  updateSetupPreview();
}

function setupBtnGroup(groupId) {
  document.querySelectorAll(`#${groupId} .btn-option`).forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(`#${groupId} .btn-option`).forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      updateSetupPreview();
    });
  });
}

function getSelected(groupId) {
  const btn = document.querySelector(`#${groupId} .btn-option.selected`);
  return btn ? btn.dataset.val : null;
}

function setActiveBtn(groupId, val) {
  document.querySelectorAll(`#${groupId} .btn-option`).forEach(btn => {
    btn.classList.toggle("selected", btn.dataset.val === val);
  });
}

function updateSetupPreview() {
  const current = calcPredictedScore(profile);
  const name = document.getElementById("profileNameInput")?.value.trim() || profile.name || "Alex Carter";
  setText("setupTarget", getSelected("targetScoreGroup") || profile.targetScore || 95);
  setText("setupCurrent", current);
  setText("setupDays", `${getSelected("prepDaysGroup") || profile.preparationDays || 60} days`);
  setText("setupLevel", titleCase(getSelected("levelGroup") || profile.level || "intermediate"));
  setText("setupGoal", titleCase(getSelected("goalGroup") || profile.goal || "study abroad"));
  setText("profilePreviewName", name);
  setText("profilePreviewGoal", titleCase(getSelected("goalGroup") || profile.goal || "study abroad"));
  setAvatar("profilePreviewAvatar", name);
}

function titleCase(value) {
  return String(value || "")
    .split(" ")
    .map(part => part ? part[0].toUpperCase() + part.slice(1) : "")
    .join(" ");
}

// ─── PRACTICE SECTIONS ───────────────────────────

const SECTION_CONTENT_ID = {
  vocabulary: "vocabContent",
  reading:    "readContent",
  listening:  "listenContent",
  speaking:   "speakContent",
  writing:    "writeContent"
};

const SECTION_STAT_IDS = {
  vocabulary: { progress: "vocabProgress", mistakes: "vocabMistakes" },
  reading:    { progress: "readProgress",  mistakes: "readMistakes"  },
  listening:  { progress: "listenProgress",mistakes: "listenMistakes"},
  speaking:   { progress: "speakProgress", mistakes: "speakMistakes" },
  writing:    { progress: "writeProgress", mistakes: "writeMistakes" }
};

function initPracticeSection(skill) {
  practiceState[skill].questions = [...QUESTIONS[skill]];
}

function renderQuestion(skill) {
  const state   = practiceState[skill];
  const content = document.getElementById(SECTION_CONTENT_ID[skill]);

  // Update stat badges
  const stats = SECTION_STAT_IDS[skill];
  const total = state.questions.length;
  document.getElementById(stats.progress).textContent = `${state.idx + 1} / ${total}`;
  document.getElementById(stats.mistakes).textContent = `Mistakes: ${profile.mistakes[skill] || 0}`;

  if (state.idx >= total) {
    renderSectionDone(skill, content);
    return;
  }

  const q = state.questions[state.idx];
  state.answered = false;

  if (skill === "reading")    { renderReadingQ(q, content, skill); return; }
  if (skill === "listening")  { renderListeningQ(q, content, skill); return; }
  if (skill === "speaking")   { renderSpeakingQ(q, content, skill); return; }

  // Vocabulary and Writing standard MCQ
  renderMCQ(q, content, skill);
}

// Standard MCQ (vocabulary, writing)
function renderMCQ(q, container, skill) {
  const letters = ["A","B","C","D"];
  container.innerHTML = `
    <div class="question-text">${q.question.replace(/\n/g,"<br>")}</div>
    <ul class="options-list">
      ${q.options.map((opt, i) => `
        <li><button class="option-btn" data-val="${opt}">
          <span class="option-letter">${letters[i]}</span> ${opt}
        </button></li>`).join("")}
    </ul>
    <div class="feedback-slot" id="feedback"></div>
    <div class="question-nav">
      <span class="q-counter">${SKILL_META[skill].label} · Q${practiceState[skill].idx + 1} of ${practiceState[skill].questions.length}</span>
      <button class="btn-primary hidden" id="nextBtn">Next</button>
    </div>`;

  attachOptionHandlers(container, q, skill, false);
}

// Reading
function renderReadingQ(q, container, skill) {
  const letters = ["A","B","C","D"];
  container.innerHTML = `
    <div class="passage-box">
      <div class="passage-label">Reading Passage</div>
      ${q.passage}
    </div>
    <div class="question-text">${q.question}</div>
    <ul class="options-list">
      ${q.options.map((opt, i) => `
        <li><button class="option-btn" data-val="${opt}">
          <span class="option-letter">${letters[i]}</span> ${opt}
        </button></li>`).join("")}
    </ul>
    <div id="feedback"></div>
    <div class="question-nav">
      <span class="q-counter">Reading · Q${practiceState[skill].idx + 1} of ${practiceState[skill].questions.length}</span>
      <button class="btn-primary hidden" id="nextBtn">Next</button>
    </div>`;

  attachOptionHandlers(container, q, skill, false);
}

// Listening
function renderListeningQ(q, container, skill) {
  const state   = practiceState[skill];
  const letters = ["A","B","C","D"];

  container.innerHTML = `
    <div class="passage-box passage-box-compact">
      <div class="passage-label">${q.lectureTitle}</div>
      <div class="lecture-text hidden" id="lectureText">${q.lectureText}</div>
    </div>
    <button class="play-btn ${state.played ? "played" : ""}" id="playBtn">
      ${state.played ? "Lecture Played" : "Play Lecture"}
    </button>
    <div class="question-text">${q.question}</div>
    <ul class="options-list" id="optionsList">
      ${q.options.map((opt, i) => `
        <li><button class="option-btn" data-val="${opt}" ${state.played ? "" : "disabled"}>
          <span class="option-letter">${letters[i]}</span> ${opt}
        </button></li>`).join("")}
    </ul>
    <div id="feedback"></div>
    <div class="question-nav">
      <span class="q-counter">Listening · Q${state.idx + 1} of ${state.questions.length}</span>
      <button class="btn-primary hidden" id="nextBtn">Next</button>
    </div>`;

  // Play button reveals text and unlocks options
  container.querySelector("#playBtn").addEventListener("click", function() {
    this.classList.add("played");
    this.textContent = "Lecture Played";
    container.querySelector("#lectureText").classList.remove("hidden");
    state.played = true;
    container.querySelectorAll(".option-btn").forEach(b => b.disabled = false);
  });

  // If already played, show text
  if (state.played) {
    container.querySelector("#lectureText").classList.remove("hidden");
  }

  attachOptionHandlers(container, q, skill, false);
}

// Speaking
function renderSpeakingQ(q, container, skill) {
  const state = practiceState[skill];
  container.innerHTML = `
    <div class="passage-label">${q.taskType}</div>
    <div class="speaking-prompt">${q.prompt}</div>
    <div class="speaking-tip">💡 Aim for ~60 seconds of speech. Include: position, reason, example, and a conclusion.</div>
    <textarea class="answer-textarea" id="speakAnswer" placeholder="Type your spoken response here..."></textarea>
    <div class="button-row button-row-spaced">
      <button class="btn-primary" id="submitSpeakBtn">Submit Answer</button>
      <button class="btn-secondary" id="skipSpeakBtn">Skip</button>
    </div>
    <div id="speakFeedback"></div>
    <div class="question-nav">
      <span class="q-counter">Speaking · Q${state.idx + 1} of ${state.questions.length}</span>
      <button class="btn-primary hidden" id="nextBtn">Next</button>
    </div>`;

  container.querySelector("#submitSpeakBtn").addEventListener("click", async () => {
    const answer = container.querySelector("#speakAnswer").value.trim();
    if (answer.length < 10) {
      showToast("Please write a longer response.", "error");
      return;
    }
    evaluateSpeaking(answer, q, container, skill);
  });

  container.querySelector("#skipSpeakBtn").addEventListener("click", () => {
    profile = recordAnswer(profile, skill, false, q);
    advanceQuestion(skill);
  });

  container.querySelector("#nextBtn")?.addEventListener("click", () => {
    state.played = false;
    advanceQuestion(skill);
  });
}

// ─── Evaluate speaking locally ───────────────────
async function evaluateSpeaking(answer, q, container, skill) {
  const btn = container.querySelector("#submitSpeakBtn");
  btn.disabled = true;
  btn.textContent = "Evaluating...";

  const lower = answer.toLowerCase();
  const criteria = {
    position:     /\b(i (agree|disagree)|i think|in my opinion|i believe|i prefer)\b/.test(lower),
    reason:       /\b(because|since|as|therefore|the reason)\b/.test(lower),
    example:      /\b(for example|for instance|such as|like|specifically)\b/.test(lower),
    length:       answer.split(/\s+/).length >= 40,
    linking_words:/\b(however|furthermore|in addition|moreover|on the other hand|firstly|secondly|finally|as a result)\b/.test(lower)
  };

  const passed   = Object.values(criteria).filter(Boolean).length;
  const total    = Object.keys(criteria).length;
  const isGood   = passed >= 3;

  let feedbackHtml = `
    <div class="criteria-list">
      ${Object.entries(criteria).map(([k, v]) => `
        <span class="criteria-tag ${v ? "pass" : "fail"}">
          ${v ? "✓" : "✗"} ${k.replace("_"," ")}
        </span>`).join("")}
    </div>
    <div class="feedback-box ${isGood ? "correct" : "wrong"} feedback-box-tight">`;

  // Try AI feedback
  try {
    const aiFeedback = await fetchAnswerFeedback("Speaking", answer, q.taskType);
    feedbackHtml += renderCoachFeedback(aiFeedback);
  } catch {
    if (isGood) {
      feedbackHtml += `Good response. You covered ${passed}/${total} criteria. ${passed < total ? "Try to also include: " + Object.entries(criteria).filter(([,v]) => !v).map(([k]) => k.replace("_"," ")).join(", ") + "." : ""}`;
    } else {
      const missing = Object.entries(criteria).filter(([,v]) => !v).map(([k]) => k.replace("_"," "));
      feedbackHtml += `Your response needs improvement. Missing: ${missing.join(", ")}. Aim for a clear position, at least one reason, and a specific example.`;
    }
  }

  feedbackHtml += `</div>`;
  container.querySelector("#speakFeedback").innerHTML = feedbackHtml;
  container.querySelector("#nextBtn").classList.remove("hidden");

  profile = recordAnswer(profile, skill, isGood, q);
  btn.disabled = false;
  btn.textContent = "Submit Answer";
}

function renderCoachFeedback(rawFeedback) {
  const parsed = parseJsonFromAI(rawFeedback);
  if (parsed) {
    return `
      <strong>Good:</strong> ${escapeHtml(parsed.good || "You answered the task.")}<br>
      <strong>Improve:</strong> ${escapeHtml(parsed.improve || "Add clearer support and transitions.")}<br>
      <strong>Score:</strong> ${escapeHtml(parsed.score || "Developing")}
      ${parsed.idealAnswer ? `<br><strong>Better version:</strong> ${escapeHtml(parsed.idealAnswer)}` : ""}`;
  }
  return cleanAIText(rawFeedback).split("\n").map(escapeHtml).join("<br>");
}

// ─── Option handler (MCQ) ─────────────────────────
function attachOptionHandlers(container, q, skill, isMiniTest) {
  container.querySelectorAll(".option-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (practiceState[skill]?.answered && !isMiniTest) return;

      const chosen  = btn.dataset.val;
      const correct = chosen === q.correctAnswer;

      if (!isMiniTest) {
        practiceState[skill].answered = true;
        profile = recordAnswer(profile, skill, correct, q);
        updateStatBadges(skill);
      }

      // Highlight all buttons
      container.querySelectorAll(".option-btn").forEach(b => {
        b.disabled = true;
        if (b.dataset.val === q.correctAnswer) b.classList.add("correct");
        else if (b === btn && !correct)         b.classList.add("wrong");
      });

      // Feedback
      const fb = container.querySelector("#feedback");
      if (fb) {
        fb.innerHTML = `<div class="feedback-box ${correct ? "correct" : "wrong"}">
          ${correct
            ? "Correct. Well done."
            : `Incorrect. The correct answer is: <strong>${q.correctAnswer}</strong>`}
        </div>`;
      }

      // Show Next button
      const nextBtn = container.querySelector("#nextBtn");
      if (nextBtn) nextBtn.classList.remove("hidden");

      if (isMiniTest) return; // mini test handles its own next

      nextBtn.addEventListener("click", () => {
        if (skill === "listening") practiceState[skill].played = false;
        advanceQuestion(skill);
      }, { once: true });
    });
  });
}

function advanceQuestion(skill) {
  const state = practiceState[skill];
  state.idx++;
  state.answered = false;
  renderQuestion(skill);
  updateStatBadges(skill);
}

function updateStatBadges(skill) {
  profile = loadProfile();
  const stats = SECTION_STAT_IDS[skill];
  const total = practiceState[skill].questions.length;
  document.getElementById(stats.progress).textContent = `${practiceState[skill].idx + 1} / ${total}`;
  document.getElementById(stats.mistakes).textContent = `Mistakes: ${profile.mistakes[skill] || 0}`;
}

// ─── Section Done ─────────────────────────────────
function renderSectionDone(skill, container) {
  const correct = profile.correct[skill]    || 0;
  const total   = profile.totalTasks[skill] || 0;
  const errors  = profile.mistakes[skill]   || 0;
  const pct     = total > 0 ? Math.round((correct / total) * 100) : 0;
  const meta    = SKILL_META[skill];

  container.innerHTML = `
    <div class="section-done">
      <div class="done-icon">${pct >= 70 ? "Strong" : pct >= 50 ? "Review" : "Practice"}</div>
      <div class="done-title">Section Complete!</div>
      <div class="done-sub">${meta.label} practice finished.</div>
      <div class="done-stats">
        <div>
          <div class="done-stat-val">${correct}</div>
          <div class="done-stat-label">Correct</div>
        </div>
        <div>
          <div class="done-stat-val done-stat-danger">${errors}</div>
          <div class="done-stat-label">Mistakes</div>
        </div>
        <div>
          <div class="done-stat-val done-stat-warning">${pct}%</div>
          <div class="done-stat-label">Accuracy</div>
        </div>
      </div>
      <button class="btn-primary" id="restartBtn">Restart Section</button>
      <button class="btn-secondary btn-adjacent" id="goAIPlanBtn">View AI Plan</button>
    </div>`;

  container.querySelector("#restartBtn").addEventListener("click", () => {
    practiceState[skill].idx      = 0;
    practiceState[skill].answered = false;
    if (skill === "listening") practiceState[skill].played = false;
    renderQuestion(skill);
  });
  container.querySelector("#goAIPlanBtn").addEventListener("click", () => navigateTo("aiplan"));
}

// ─── MINI TEST ────────────────────────────────────
function initMiniTest() {
  const state = practiceState.minitest;
  state.questions = buildMiniTest();
  renderMiniTestStart();
}

function renderMiniTestStart() {
  document.getElementById("miniContent").innerHTML = `
    <div class="mini-start">
      <h3>Mini TOEFL Test</h3>
      <p>10 questions across all skill areas. Complete without stopping.</p>
      <div class="mini-composition">
        <span class="mini-tag">3 Reading</span>
        <span class="mini-tag">3 Listening</span>
        <span class="mini-tag">2 Vocabulary</span>
        <span class="mini-tag">1 Speaking</span>
        <span class="mini-tag">1 Writing</span>
      </div>
      <button class="btn-primary" id="startMiniBtn">Start Mini Test</button>
    </div>`;

  document.getElementById("startMiniBtn").addEventListener("click", () => {
    practiceState.minitest.questions = buildMiniTest();
    practiceState.minitest.idx     = 0;
    practiceState.minitest.answers = [];
    practiceState.minitest.started = true;
    practiceState.minitest.done    = false;
    renderMiniQuestion();
  });
}

function renderMiniQuestion() {
  const state = practiceState.minitest;
  const total = state.questions.length;

  document.getElementById("miniProgress").textContent = `${state.idx + 1} / ${total}`;

  if (state.idx >= total) {
    renderMiniResults();
    return;
  }

  const q = state.questions[state.idx];
  const content = document.getElementById("miniContent");

  if (q.type === "speaking") {
    renderMiniSpeaking(q, content);
    return;
  }

  if (q.type === "listening") {
    renderMiniListening(q, content);
    return;
  }

  if (q.type === "reading") {
    renderMiniReading(q, content);
    return;
  }

  // MCQ (vocab/writing)
  renderMiniMCQ(q, content);
}

function renderMiniMCQ(q, container) {
  const letters = ["A","B","C","D"];
  const state   = practiceState.minitest;
  container.innerHTML = `
    <div class="passage-label">${SKILL_META[q.skill.toLowerCase()].icon} ${q.skill} · Question ${state.idx + 1}</div>
    <div class="question-text">${q.question.replace(/\n/g,"<br>")}</div>
    <ul class="options-list">
      ${q.options.map((opt, i) => `
        <li><button class="option-btn" data-val="${opt}">
          <span class="option-letter">${letters[i]}</span> ${opt}
        </button></li>`).join("")}
    </ul>
    <div id="feedback"></div>
    <div class="question-nav">
      <span class="q-counter">Q${state.idx + 1} / ${state.questions.length}</span>
      <button class="btn-primary hidden" id="nextBtn">Next</button>
    </div>`;

  container.querySelectorAll(".option-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const chosen  = btn.dataset.val;
      const correct = chosen === q.correctAnswer;
      state.answers.push({ skill: q.skill.toLowerCase(), correct, question: q });

      container.querySelectorAll(".option-btn").forEach(b => {
        b.disabled = true;
        if (b.dataset.val === q.correctAnswer) b.classList.add("correct");
        else if (b === btn && !correct)         b.classList.add("wrong");
      });

      container.querySelector("#feedback").innerHTML = `
        <div class="feedback-box ${correct ? "correct" : "wrong"}">
          ${correct ? "Correct." : `Correct answer: <strong>${q.correctAnswer}</strong>`}
        </div>`;

      const nextBtn = container.querySelector("#nextBtn");
      nextBtn.classList.remove("hidden");
      nextBtn.addEventListener("click", () => { state.idx++; renderMiniQuestion(); }, { once: true });
    });
  });
}

function renderMiniReading(q, container) {
  const state   = practiceState.minitest;
  const letters = ["A","B","C","D"];
  container.innerHTML = `
    <div class="passage-label">Reading</div>
    <div class="passage-box">${q.passage}</div>
    <div class="question-text">${q.question}</div>
    <ul class="options-list">
      ${q.options.map((opt, i) => `
        <li><button class="option-btn" data-val="${opt}">
          <span class="option-letter">${letters[i]}</span> ${opt}
        </button></li>`).join("")}
    </ul>
    <div id="feedback"></div>
    <div class="question-nav">
      <span class="q-counter">Q${state.idx + 1} / ${state.questions.length}</span>
      <button class="btn-primary hidden" id="nextBtn">Next</button>
    </div>`;

  container.querySelectorAll(".option-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const correct = btn.dataset.val === q.correctAnswer;
      state.answers.push({ skill: "reading", correct, question: q });
      container.querySelectorAll(".option-btn").forEach(b => {
        b.disabled = true;
        if (b.dataset.val === q.correctAnswer) b.classList.add("correct");
        else if (b === btn && !correct)         b.classList.add("wrong");
      });
      container.querySelector("#feedback").innerHTML = `
        <div class="feedback-box ${correct ? "correct" : "wrong"}">
          ${correct ? "Correct." : `Correct: <strong>${q.correctAnswer}</strong>`}
        </div>`;
      const nb = container.querySelector("#nextBtn");
      nb.classList.remove("hidden");
      nb.addEventListener("click", () => { state.idx++; renderMiniQuestion(); }, { once: true });
    });
  });
}

function renderMiniListening(q, container) {
  const state   = practiceState.minitest;
  const letters = ["A","B","C","D"];
  container.innerHTML = `
    <div class="passage-label">${q.lectureTitle}</div>
    <div class="passage-box hidden" id="miniLectureBox">${q.lectureText}</div>
    <button class="play-btn" id="miniPlayBtn">Play Lecture</button>
    <div class="question-text">${q.question}</div>
    <ul class="options-list" id="miniOpts">
      ${q.options.map((opt, i) => `
        <li><button class="option-btn" data-val="${opt}" disabled>
          <span class="option-letter">${letters[i]}</span> ${opt}
        </button></li>`).join("")}
    </ul>
    <div id="feedback"></div>
    <div class="question-nav">
      <span class="q-counter">Q${state.idx + 1} / ${state.questions.length}</span>
      <button class="btn-primary hidden" id="nextBtn">Next</button>
    </div>`;

  container.querySelector("#miniPlayBtn").addEventListener("click", function() {
    this.classList.add("played");
    this.textContent = "Played";
    container.querySelector("#miniLectureBox").classList.remove("hidden");
    container.querySelectorAll(".option-btn").forEach(b => b.disabled = false);
  });

  container.querySelectorAll(".option-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const correct = btn.dataset.val === q.correctAnswer;
      state.answers.push({ skill: "listening", correct, question: q });
      container.querySelectorAll(".option-btn").forEach(b => {
        b.disabled = true;
        if (b.dataset.val === q.correctAnswer) b.classList.add("correct");
        else if (b === btn && !correct)         b.classList.add("wrong");
      });
      container.querySelector("#feedback").innerHTML = `
        <div class="feedback-box ${correct ? "correct" : "wrong"}">
          ${correct ? "Correct." : `Correct: <strong>${q.correctAnswer}</strong>`}
        </div>`;
      const nb = container.querySelector("#nextBtn");
      nb.classList.remove("hidden");
      nb.addEventListener("click", () => { state.idx++; renderMiniQuestion(); }, { once: true });
    });
  });
}

function renderMiniSpeaking(q, container) {
  const state = practiceState.minitest;
  container.innerHTML = `
    <div class="passage-label">Speaking</div>
    <div class="speaking-prompt">${q.prompt}</div>
    <div class="speaking-tip">💡 Write your 60-second spoken response.</div>
    <textarea class="answer-textarea" id="miniSpeakAnswer" placeholder="Type your response..."></textarea>
    <div class="button-row">
      <button class="btn-primary" id="miniSubmitSpeak">Submit</button>
      <button class="btn-secondary" id="miniSkipSpeak">Skip</button>
    </div>
    <div class="feedback-slot" id="feedback"></div>
    <div class="question-nav">
      <span class="q-counter">Q${state.idx + 1} / ${state.questions.length}</span>
      <button class="btn-primary hidden" id="nextBtn">Next</button>
    </div>`;

  container.querySelector("#miniSubmitSpeak").addEventListener("click", () => {
    const ans   = container.querySelector("#miniSpeakAnswer").value.trim();
    const lower = ans.toLowerCase();
    const good  = ans.split(/\s+/).length >= 30 &&
                  /\b(because|since|i (agree|disagree)|i think)\b/.test(lower);
    state.answers.push({ skill: "speaking", correct: good, question: q });
    container.querySelector("#feedback").innerHTML = `
      <div class="feedback-box ${good ? "correct" : "wrong"}">
        ${good ? "Good response." : "Response too short or missing position/reason. Keep practicing."}
      </div>`;
    const nb = container.querySelector("#nextBtn");
    nb.classList.remove("hidden");
    nb.addEventListener("click", () => { state.idx++; renderMiniQuestion(); }, { once: true });
  });

  container.querySelector("#miniSkipSpeak").addEventListener("click", () => {
    state.answers.push({ skill: "speaking", correct: false, question: q });
    state.idx++;
    renderMiniQuestion();
  });
}

function renderMiniResults() {
  const state   = practiceState.minitest;
  const answers = state.answers;

  // Tally by skill
  const bySkill = {};
  answers.forEach(a => {
    if (!bySkill[a.skill]) bySkill[a.skill] = { correct: 0, total: 0 };
    bySkill[a.skill].total++;
    if (a.correct) bySkill[a.skill].correct++;
    // Also update main profile
    profile = recordAnswer(profile, a.skill, a.correct, a.question);
  });

  const totalCorrect = answers.filter(a => a.correct).length;
  const predicted    = calcPredictedScore(profile);

  // Find weakest
  let weakest = null, worstRate = -1;
  Object.entries(bySkill).forEach(([sk, d]) => {
    const errRate = d.total > 0 ? (d.total - d.correct) / d.total : 0;
    if (errRate > worstRate) { worstRate = errRate; weakest = sk; }
  });

  const skills = ["reading","listening","vocabulary","speaking","writing"];
  const content = document.getElementById("miniContent");

  content.innerHTML = `
    <div class="mini-results">
      <div class="mini-result-header">
        <div class="mini-result-score">${totalCorrect}/10</div>
        <div class="mini-result-label">Correct Answers</div>
        <div class="mini-result-prediction">
          Predicted TOEFL: <strong>${predicted}</strong>
        </div>
      </div>

      <div class="result-skill-grid">
        ${skills.map(sk => {
          const d       = bySkill[sk] || { correct: 0, total: 0 };
          const pct     = d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0;
          const cls     = pct >= 70 ? "strong" : pct >= 40 ? "medium" : "weak";
          const meta    = SKILL_META[sk];
          return `
            <div class="result-skill-card">
              <div class="result-skill-name">${meta.label}</div>
              <div class="result-skill-score ${cls}">${d.correct}/${d.total}</div>
              <div class="result-skill-pct">${pct}%</div>
            </div>`;
        }).join("")}
      </div>

      ${weakest ? `
        <div class="feedback-box info mini-insight">
          <strong>AI Insight:</strong> Your weakest section was
          <strong>${SKILL_META[weakest]?.label}</strong>.
          ${generateLocalStudyPlan(profile).explanation}
        </div>` : ""}

      <div class="button-row button-row-center">
        <button class="btn-primary" id="retakeMiniBtn">Retake Test</button>
        <button class="btn-secondary" id="viewPlanBtn">View AI Plan</button>
      </div>
    </div>`;

  document.getElementById("miniProgress").textContent = `Done`;
  content.querySelector("#retakeMiniBtn").addEventListener("click", () => {
    state.questions = buildMiniTest();
    state.idx = 0; state.answers = [];
    renderMiniTestStart();
  });
  content.querySelector("#viewPlanBtn").addEventListener("click", () => navigateTo("aiplan"));
}

// ─── AI PLAN SECTION ──────────────────────────────
function initAIPlan() {
  document.getElementById("generatePlanBtn").addEventListener("click", async () => {
    const btn = document.getElementById("generatePlanBtn");
    const out = document.getElementById("studyPlanContent");
    btn.disabled = true;
    btn.textContent = "Generating...";
    out.innerHTML = renderAILoading("Building your structured AI study plan...");

    try {
      const result = await fetchAIStudyPlan();
      out.innerHTML = renderPlanHtml(normalizeStudyPlan(result, profile));
      profile.lastAIPlan     = result;
      profile.lastAIPlanDate = new Date().toISOString();
      saveProfile(profile);
      showToast("AI plan ready.", "success");
    } catch (err) {
      const state = getAIStatusCopy(err);
      out.innerHTML = `
        ${renderAIStatus(state, { action: "Fallback recommendations" })}
        ${renderPlanHtml(normalizeStudyPlan(null, profile))}`;
      showToast("AI unavailable. Fallback plan is ready.", state.tone === "danger" ? "error" : "info");
    }

    btn.disabled = false;
    btn.textContent = "Generate Study Plan";
  });

  document.getElementById("analyzeGapBtn").addEventListener("click", async () => {
    const btn = document.getElementById("analyzeGapBtn");
    const out = document.getElementById("scoreGapContent");
    btn.disabled = true;
    btn.textContent = "Analyzing...";

    profile = loadProfile();
    const gapHtml = renderScoreGapVisual(profile);
    out.innerHTML = `<div class="gap-visual">${gapHtml}</div>
      <div class="ai-loading-spaced">${renderAILoading("Running AI gap analysis...")}</div>`;

    try {
      const result = await fetchScoreGapAnalysis();
      out.innerHTML = `
        <div class="gap-visual">${gapHtml}</div>
        ${renderGapAnalysisHtml(result, profile)}`;
      showToast("Gap analysis complete.", "success");
    } catch (err) {
      const state = getAIStatusCopy(err);
      out.innerHTML = `<div class="gap-visual">${gapHtml}</div>
        ${renderAIStatus(state, { action: "Local gap summary" })}
        ${renderGapAnalysisHtml(null, profile)}`;
      showToast("AI gap analysis unavailable. Local summary is shown.", state.tone === "danger" ? "error" : "info");
    }

    btn.disabled = false;
    btn.textContent = "Run AI Analysis";
  });
}

function renderGapAnalysisHtml(raw, currentProfile) {
  const parsed = parseJsonFromAI(raw);
  const weak = calcWeaknessScores(currentProfile)[0];
  const fallback = {
    overall: `Your current gap is ${Math.max(0, currentProfile.targetScore - calcPredictedScore(currentProfile))} points. The fastest improvement path is to reduce mistakes in ${SKILL_META[weak.skill].label}.`,
    weakestSkill: weak.skill,
    topActions: [
      `Review mistakes in ${SKILL_META[weak.skill].label}`,
      "Complete one timed mixed set",
      "Redo missed questions after 24 hours"
    ]
  };
  const analysis = parsed || fallback;
  const actions = Array.isArray(analysis.topActions) ? analysis.topActions : fallback.topActions;

  return `
    <div class="feedback-box info gap-fallback">
      ${escapeHtml(cleanAIText(analysis.overall || fallback.overall))}
    </div>
    <div class="smart-list smart-list-spaced">
      ${actions.slice(0, 3).map((action, index) => `
        <div class="smart-item">
          <strong>${index + 1}. ${escapeHtml(cleanAIText(action))}</strong>
          <span>${escapeHtml(SKILL_META[analysis.weakestSkill]?.label || "Score gap")} improvement action</span>
        </div>`).join("")}
    </div>`;
}

function renderAIPlanSection() {
  profile = loadProfile();
  const gapHtml = renderScoreGapVisual(profile);
  document.getElementById("gapVisual").innerHTML = gapHtml;
  renderStudyGoalOverview();
  renderRoadmap();
  renderWeeklyTargets();
  if (!document.getElementById("studyPlanContent").dataset.hydrated) {
    document.getElementById("studyPlanContent").innerHTML = renderPlanHtml(normalizeStudyPlan(profile.lastAIPlan, profile));
    document.getElementById("studyPlanContent").dataset.hydrated = "true";
  }
}

function renderStudyGoalOverview() {
  const current = calcPredictedScore(profile);
  const gap = Math.max(0, profile.targetScore - current);
  const days = daysRemaining(profile);
  const el = document.getElementById("studyGoalOverview");
  if (!el) return;
  el.innerHTML = `
    <div class="goal-overview">
      <div><span>Current</span><strong>${current}</strong></div>
      <div class="goal-arrow">to</div>
      <div><span>Target</span><strong>${profile.targetScore}</strong></div>
    </div>
    <p>${gap} points to close over ${days} days.</p>`;
}

function renderRoadmap() {
  const el = document.getElementById("roadmapContent");
  if (!el) return;
  const phases = [
    { range: "Week 1-2", title: "Diagnose and stabilize", copy: "Mini test, first weak zones, core vocabulary, evidence habits." },
    { range: "Week 3-4", title: "Repair weak skills", copy: "Focused Reading and Listening sets, speaking structure, writing organization." },
    { range: "Week 5-6", title: "Build timed accuracy", copy: "Mixed drills, review bank, AI feedback, score-gap checks." },
    { range: "Week 7-8", title: "Simulate and polish", copy: "Mini tests, final error review, pacing and exam routine." }
  ];
  el.innerHTML = phases.map(phase => `
    <div class="roadmap-item">
      <span>${phase.range}</span>
      <strong>${phase.title}</strong>
      <p>${phase.copy}</p>
    </div>`).join("");
}

function renderWeeklyTargets() {
  const el = document.getElementById("weeklyTargets");
  if (!el) return;
  const weeklyTasks = Math.max(12, Math.min(34, Math.round((Math.max(0, profile.targetScore - calcPredictedScore(profile)) || 20) / 2)));
  el.innerHTML = `
    <div class="weekly-target"><strong>${weeklyTasks}</strong><span>practice tasks / week</span></div>
    <div class="weekly-target"><strong>2</strong><span>mini tests / week</span></div>
    <div class="weekly-target"><strong>3</strong><span>mistake reviews / week</span></div>`;
}

// ─── ANALYTICS ───────────────────────────────────
function initAnalytics() { /* rendered on navigate */ }

function renderAnalytics() {
  profile = loadProfile();
  const analytics = buildAnalyticsModel(profile);
  const container = document.getElementById("analyticsWorkspace");
  if (!container) return;
  const skills = ["reading","listening","speaking","writing","vocabulary"];
  const completed = totalCompletedTasks(profile);
  const correct = Object.values(profile.correct || {}).reduce((sum, value) => sum + (value || 0), 0);
  const accuracy = completed ? Math.round((correct / completed) * 100) : 0;
  const current = analytics.predictedScore;
  const weak = analytics.weakZones.length
    ? analytics.weakZones
    : calcWeaknessScores(profile).filter(item => item.total > 0);
  const confidence = analytics.confidence || { level: "none", score: 0 };
  const readiness = analytics.readiness || { level: "not-ready", overall: 0 };

  container.innerHTML = `
    ${renderAnalyticsInsight(analytics, accuracy, completed)}
    <div class="analytics-kpi-grid">
      ${renderKpi("Current TOEFL", current, "Predicted score")}
      ${renderKpi("Accuracy", `${accuracy}%`, `${correct}/${completed} correct`)}
      ${renderKpi("Confidence", confidence.level, `${confidence.score}% model confidence`)}
      ${renderKpi("Readiness", readiness.level, `${readiness.overall}% exam readiness`)}
      ${renderKpi("Completed tasks", completed, "all practice")}
    </div>
    <div class="analytics-grid">
      <div class="card score-progress-card">
        <div class="section-heading"><div><div class="card-kicker">Score progress</div><h2 class="card-title">Movement over time</h2></div></div>
        <div class="trajectory-chart analytics-trajectory" id="analyticsTrajectory"></div>
      </div>
      <div class="card skill-distribution-card">
        <div class="section-heading"><div><div class="card-kicker">Skill distribution</div><h2 class="card-title">Score, progress, confidence</h2></div></div>
        ${skills.map(skill => renderSkillDistribution(skill)).join("")}
      </div>
      <div class="card target-pace-card">
        <div class="card-kicker">Target pace</div>
        ${renderTargetPace(analytics)}
      </div>
      <div class="card weak-areas-card">
        <div class="section-heading"><div><div class="card-kicker">Weak areas</div><h2 class="card-title">Most repeated pressure points</h2></div></div>
        <div class="error-list">
          ${weak.length ? weak.slice(0, 5).map(w => renderWeakArea(w)).join("") : renderAnalyticsEmpty("Complete practice tasks to reveal weak areas.")}
        </div>
      </div>
      <div class="card mistake-analysis-card">
        <div class="section-heading"><div><div class="card-kicker">Mistake analysis</div><h2 class="card-title">What keeps repeating</h2></div></div>
        <div id="mistakeBankReview" class="error-list"></div>
      </div>
      <div class="card progress-history-card">
        <div class="section-heading"><div><div class="card-kicker">Progress history</div><h2 class="card-title">Last 7 days</h2></div></div>
        <div id="weeklyReport" class="error-list"></div>
      </div>
    </div>`;
  renderTrajectoryChartInto("analyticsTrajectory", current);
  renderMistakeBankReview();
  renderWeeklyReport();
}

function renderKpi(label, value, note) {
  return `<div class="card analytics-kpi"><span>${label}</span><strong>${value}</strong><small>${note}</small></div>`;
}

function renderAnalyticsInsight(analytics, accuracy, completed) {
  const confidence = analytics.confidence || { level: "none", score: 0 };
  const readiness = analytics.readiness || { level: "not-ready", overall: 0 };
  const gap = Math.max(0, profile.targetScore - analytics.predictedScore);
  const weak = analytics.weakZones?.[0];
  const weakLabel = weak ? SKILL_META[weak.skill]?.label || weak.skill : "mixed practice";
  const confidenceCopy = confidence.score < 45
    ? "Prediction confidence is still low, so new practice will move the model more."
    : "Prediction confidence is stable enough to track directional progress.";
  return `
    <div class="card analytics-insight">
      <div>
        <div class="card-kicker">Score evidence</div>
        <h2 class="card-title">${gap} points to close</h2>
        <p>${completed} completed tasks, ${accuracy}% accuracy, ${readiness.overall}% readiness. ${confidenceCopy}</p>
      </div>
      <div class="analytics-insight-tags">
        <span>${escapeHtml(confidence.level)} confidence</span>
        <span>${escapeHtml(readiness.level)} readiness</span>
        <span>${escapeHtml(weakLabel)} focus</span>
      </div>
    </div>`;
}

function renderTargetPace(analytics) {
  const gap = Math.max(0, profile.targetScore - analytics.predictedScore);
  const days = daysRemaining(profile);
  const weeks = Math.max(1, Math.ceil(days / 7));
  const pointsPerWeek = Math.max(0, round(gap / weeks, 1));
  const weeklyTasks = Math.max(12, Math.min(34, Math.round((gap || 20) / 2)));
  return `
    <div class="pace-grid">
      <div class="pace-stat"><span>Gap</span><strong>${gap}</strong><small>points</small></div>
      <div class="pace-stat"><span>Weeks</span><strong>${weeks}</strong><small>left</small></div>
      <div class="pace-stat"><span>Pace</span><strong>${pointsPerWeek}</strong><small>pts / week</small></div>
      <div class="pace-stat"><span>Workload</span><strong>${weeklyTasks}</strong><small>tasks / week</small></div>
    </div>
    <p class="pace-note">Use this as a planning signal, not a promise. Confidence rises as the sample size grows.</p>`;
}

function renderAnalyticsEmpty(text) {
  return `<div class="analytics-empty">${escapeHtml(text)}</div>`;
}

function renderSkillDistribution(skill) {
  const meta = SKILL_META[skill];
  const analytics = buildAnalyticsModel(profile);
  const skillData = analytics.skills.find(item => item.skill === skill);
  const score = skill === "vocabulary" ? (profile.progress[skill] || 0) : (profile.scores[skill] || 0);
  const pct = skill === "vocabulary" ? score : Math.round((score / 30) * 100);
  const confidence = skillData?.confidence?.level || "none";
  const readiness = skillData?.readiness?.readiness ?? pct;
  const source = skillData?.source || "profile";
  return `
    <div class="skill-distribution-row">
      <div class="skill-distribution-head">
        <span class="bar-chart-label">${meta.label}</span>
        <span class="skill-distribution-note">${confidence} confidence · ${source}</span>
      </div>
      <div class="bar-chart-row">
        <div class="bar-chart-track"><div class="bar-chart-fill fill-${skill} ${percentClass("w", pct)}"></div></div>
        <span class="bar-chart-pct">${skill === "vocabulary" ? pct + "%" : score + "/30"}</span>
      </div>
      <div class="skill-distribution-foot">
        <span>Readiness ${readiness}%</span>
        <span>Proficiency ${skillData?.proficiency ?? pct}%</span>
      </div>
    </div>`;
}

function renderWeakArea(w) {
  const meta = SKILL_META[w.skill];
  const errPct = Math.round(w.score * 100);
  return `
    <div class="error-item">
      <span class="error-skill">${meta.label}</span>
      <div class="error-bar-wrap"><div class="error-bar-track"><div class="error-bar-fill ${percentClass("w", errPct)}"></div></div></div>
      <span class="error-pct">${errPct}%</span>
      <span class="error-count">${w.mistakes}/${w.total}</span>
    </div>`;
}

function renderMistakeBankReview() {
  const container = document.getElementById("mistakeBankReview");
  if (!container) return;
  const mistakes = (profile.mistakeBank || []).filter(item => !item.mastered).slice(0, 8);
  if (!mistakes.length) {
    container.innerHTML = `<p class="placeholder-text">No mistakes saved yet. Missed questions will become review cards.</p>`;
    return;
  }

  container.innerHTML = mistakes.map(item => `
    <div class="error-item error-item-start">
      <span class="error-skill">${SKILL_META[item.skill]?.label || item.skill}</span>
      <div class="mistake-detail">
        <strong>${escapeHtml(item.topic)}</strong><br>
        <span class="mistake-prompt">${escapeHtml(item.prompt).slice(0, 150)}${item.prompt.length > 150 ? "..." : ""}</span>
        ${item.correctAnswer ? `<br><span class="mistake-correct">Correct: ${escapeHtml(item.correctAnswer)}</span>` : ""}
      </div>
      <span class="error-count">x${item.count}</span>
    </div>`).join("");
}

function renderWeeklyReport() {
  const container = document.getElementById("weeklyReport");
  if (!container) return;
  const weekAgo = Date.now() - 7 * 86400000;
  const recent = (profile.activityLog || []).filter(item => new Date(item.date).getTime() >= weekAgo);
  const correct = recent.filter(item => item.correct).length;
  const xp = recent.reduce((sum, item) => sum + (item.xp || 0), 0);
  const accuracy = recent.length ? Math.round((correct / recent.length) * 100) : 0;
  const achievements = profile.achievements || [];

  container.innerHTML = `
    <div class="habit-grid">
      <div class="habit-stat"><div class="habit-value">${recent.length}</div><div class="habit-label">Tasks this week</div></div>
      <div class="habit-stat"><div class="habit-value">${accuracy}%</div><div class="habit-label">Weekly accuracy</div></div>
      <div class="habit-stat"><div class="habit-value">${xp}</div><div class="habit-label">Weekly XP</div></div>
      <div class="habit-stat"><div class="habit-value">${achievements.length}</div><div class="habit-label">Achievements</div></div>
    </div>
    <div class="achievement-list">
      ${achievements.length ? achievements.map(a => `<div class="achievement-mini">${escapeHtml(a)}</div>`).join("") : `<p class="placeholder-text">No achievements yet. Complete 10 tasks to unlock the first one.</p>`}
    </div>`;
}

// ─── TOAST ───────────────────────────────────────
let toastTimer = null;
function showToast(msg, type = "info") {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.className = `toast ${type}`;
  el.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add("hidden"), 3500);
}
