// ═══════════════════════════════════════════════
//  AI TOEFL Coach — Main Application
// ═══════════════════════════════════════════════

// ─── State ───────────────────────────────────────
let profile = loadProfile();

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
  initDashboard();
  initPracticeSection("vocabulary");
  initPracticeSection("reading");
  initPracticeSection("listening");
  initPracticeSection("speaking");
  initPracticeSection("writing");
  initMiniTest();
  initAIPlan();
  initAnalytics();

  // Start on dashboard unless no goal set
  if (!profile.startDate) {
    navigateTo("goal");
    showToast("👋 Welcome! Set your TOEFL goal to get started.", "info");
  } else {
    navigateTo("dashboard");
  }

  document.getElementById("resetBtn").addEventListener("click", () => {
    if (confirm("Reset all progress? This cannot be undone.")) {
      profile = resetProfile();
      practiceState.vocabulary.idx = 0;
      practiceState.reading.idx    = 0;
      practiceState.listening.idx  = 0;
      practiceState.speaking.idx   = 0;
      practiceState.writing.idx    = 0;
      initDashboard();
      navigateTo("dashboard");
      showToast("Progress reset.", "info");
    }
  });
});

// ─── NAVIGATION ──────────────────────────────────
function initNavigation() {
  document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      navigateTo(link.dataset.section);
      // Close sidebar on mobile
      document.getElementById("sidebar").classList.remove("open");
    });
  });

  document.querySelectorAll(".btn-skill").forEach(btn => {
    btn.addEventListener("click", () => navigateTo(btn.dataset.section));
  });

  document.getElementById("hamburger").addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("open");
  });
}

function navigateTo(section) {
  // Update sidebar
  document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
  const activeLink = document.querySelector(`.nav-link[data-section="${section}"]`);
  if (activeLink) activeLink.classList.add("active");

  // Show section
  document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
  const el = document.getElementById(`section-${section}`);
  if (el) el.classList.add("active");

  // Page title
  document.getElementById("pageTitle").textContent = SECTION_TITLES[section] || section;

  // Refresh content on navigate
  if (section === "dashboard") renderDashboard();
  if (section === "analytics") renderAnalytics();
  if (section === "aiplan")    renderAIPlanSection();
  if (["vocabulary","reading","listening","speaking","writing"].includes(section)) {
    renderQuestion(section);
  }
}

// ─── DASHBOARD ───────────────────────────────────
function initDashboard() {
  document.getElementById("refreshAIBtn").addEventListener("click", async () => {
    await refreshTodayAIPlan();
  });
  renderDashboard();
}

function renderDashboard() {
  profile = loadProfile();
  const predicted = calcPredictedScore(profile);
  const gap       = Math.max(0, profile.targetScore - predicted);
  const days      = daysRemaining(profile);

  document.getElementById("dashTarget").textContent  = profile.targetScore;
  document.getElementById("dashCurrent").textContent = predicted;
  document.getElementById("dashGap").textContent     = gap;
  document.getElementById("dashDays").textContent    = days;
  document.getElementById("topScore").textContent    = predicted;

  renderSkillBars();
  renderWeakZones();
  renderTodayPlan();
}

function renderSkillBars() {
  const container = document.getElementById("skillBars");
  const skills = ["reading","listening","speaking","writing","vocabulary"];
  container.innerHTML = skills.map(skill => {
    const pct  = profile.progress[skill] || 0;
    const meta = SKILL_META[skill];
    return `
      <div class="skill-bar-row">
        <div class="skill-bar-header">
          <span class="skill-bar-label">${meta.icon} ${meta.label}</span>
          <span class="skill-bar-pct">${pct}%</span>
        </div>
        <div class="skill-bar-track">
          <div class="skill-bar-fill ${meta.fillClass}" style="width:${pct}%"></div>
        </div>
      </div>`;
  }).join("");
}

function renderWeakZones() {
  const container = document.getElementById("weakList");
  const weak      = calcWeaknessScores(profile).filter(s => s.total > 0);

  if (weak.length === 0) {
    container.innerHTML = `<p class="placeholder-text">Complete some practice tasks to see your weak zones.</p>`;
    return;
  }

  container.innerHTML = weak.slice(0, 4).map(w => {
    const meta     = SKILL_META[w.skill];
    const errPct   = Math.round(w.score * 100);
    const severity = w.score >= 0.5 ? "" : "medium";
    return `
      <div class="weak-item ${severity}">
        <span class="weak-icon">${meta.icon}</span>
        <span class="weak-name">${meta.label}</span>
        <span class="weak-score">${errPct}% errors (${w.mistakes}/${w.total})</span>
      </div>`;
  }).join("");
}

function renderTodayPlan() {
  const container = document.getElementById("todayPlan");

  // Use cached AI plan if recent (same day)
  if (profile.lastAIPlan && profile.lastAIPlanDate) {
    const today = new Date().toDateString();
    const planDate = new Date(profile.lastAIPlanDate).toDateString();
    if (today === planDate) {
      container.innerHTML = `<div class="feedback-box info" style="margin-bottom:12px;font-size:.8rem;">${profile.lastAIPlan.replace(/\n/g,"<br>")}</div>`;
      return;
    }
  }

  // Use local plan
  const plan = generateLocalStudyPlan(profile);
  container.innerHTML = `
    <div class="feedback-box info" style="margin-bottom:14px;font-size:.82rem;">${plan.explanation}</div>
    ${plan.tasks.map((t, i) => `
      <div class="plan-item">
        <div class="plan-num">${i + 1}</div>
        <div>
          <div class="plan-text">${SKILL_META[t.skill].icon} ${t.task}</div>
          <div class="plan-why">${t.why}</div>
        </div>
      </div>`).join("")}`;
}

async function refreshTodayAIPlan() {
  const btn = document.getElementById("refreshAIBtn");
  btn.disabled = true;
  btn.textContent = "⏳ Generating...";

  const container = document.getElementById("todayPlan");
  container.innerHTML = `<div class="ai-loading"><div class="spinner"></div> Asking Gemini AI...</div>`;

  try {
    const result = await fetchAIStudyPlan();
    container.innerHTML = `<div class="feedback-box info" style="font-size:.85rem;line-height:1.6">${result.replace(/\n/g,"<br>")}</div>`;
    profile.lastAIPlan     = result;
    profile.lastAIPlanDate = new Date().toISOString();
    saveProfile(profile);
    showToast("✅ AI plan updated!", "success");
  } catch (err) {
    // Fallback to local
    renderTodayPlan();
    showToast(`⚠️ Gemini unavailable — using local plan. (${err.message})`, "error");
  }

  btn.disabled = false;
  btn.textContent = "🤖 Refresh AI Plan";
}

// ─── GOAL SETUP ──────────────────────────────────
function initGoalForm() {
  setupBtnGroup("targetScoreGroup");
  setupBtnGroup("prepDaysGroup");
  setupBtnGroup("levelGroup");
  setupBtnGroup("goalGroup");

  // Restore saved values
  setActiveBtn("targetScoreGroup", String(profile.targetScore));
  setActiveBtn("prepDaysGroup",    String(profile.preparationDays));
  setActiveBtn("levelGroup",       profile.level);
  setActiveBtn("goalGroup",        profile.goal);

  document.getElementById("saveGoalBtn").addEventListener("click", () => {
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
    }

    saveProfile(profile);
    document.getElementById("goalSaved").classList.remove("hidden");
    showToast("🎯 Goal saved! Let's start preparing.", "success");
    setTimeout(() => {
      navigateTo("dashboard");
      document.getElementById("goalSaved").classList.add("hidden");
    }, 1800);
  });
}

function setupBtnGroup(groupId) {
  document.querySelectorAll(`#${groupId} .btn-option`).forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(`#${groupId} .btn-option`).forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
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

  // Vocabulary & Writing — standard MCQ
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
    <div id="feedback" style="margin-top:12px"></div>
    <div class="question-nav">
      <span class="q-counter">${SKILL_META[skill].label} · Q${practiceState[skill].idx + 1} of ${practiceState[skill].questions.length}</span>
      <button class="btn-primary" id="nextBtn" style="display:none">Next →</button>
    </div>`;

  attachOptionHandlers(container, q, skill, false);
}

// Reading
function renderReadingQ(q, container, skill) {
  const letters = ["A","B","C","D"];
  container.innerHTML = `
    <div class="passage-box">
      <div class="passage-label">📖 Reading Passage</div>
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
      <button class="btn-primary" id="nextBtn" style="display:none">Next →</button>
    </div>`;

  attachOptionHandlers(container, q, skill, false);
}

// Listening
function renderListeningQ(q, container, skill) {
  const state   = practiceState[skill];
  const letters = ["A","B","C","D"];

  container.innerHTML = `
    <div class="passage-box" style="margin-bottom:12px;">
      <div class="passage-label">🎧 ${q.lectureTitle}</div>
      <div id="lectureText" style="display:none;margin-top:10px;line-height:1.7">${q.lectureText}</div>
    </div>
    <button class="play-btn ${state.played ? "played" : ""}" id="playBtn">
      ${state.played ? "✅ Lecture Played" : "▶ Play Lecture"}
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
      <button class="btn-primary" id="nextBtn" style="display:none">Next →</button>
    </div>`;

  // Play button reveals text and unlocks options
  container.querySelector("#playBtn").addEventListener("click", function() {
    this.classList.add("played");
    this.textContent = "✅ Lecture Played";
    container.querySelector("#lectureText").style.display = "block";
    state.played = true;
    container.querySelectorAll(".option-btn").forEach(b => b.disabled = false);
  });

  // If already played, show text
  if (state.played) {
    container.querySelector("#lectureText").style.display = "block";
  }

  attachOptionHandlers(container, q, skill, false);
}

// Speaking
function renderSpeakingQ(q, container, skill) {
  const state = practiceState[skill];
  container.innerHTML = `
    <div class="passage-label" style="margin-bottom:8px">🎤 ${q.taskType}</div>
    <div class="speaking-prompt">${q.prompt}</div>
    <div class="speaking-tip">💡 Aim for ~60 seconds of speech. Include: position, reason, example, and a conclusion.</div>
    <textarea class="answer-textarea" id="speakAnswer" placeholder="Type your spoken response here..."></textarea>
    <div style="display:flex;gap:10px;margin-bottom:12px">
      <button class="btn-primary" id="submitSpeakBtn">Submit Answer</button>
      <button class="btn-secondary" id="skipSpeakBtn">Skip</button>
    </div>
    <div id="speakFeedback"></div>
    <div class="question-nav">
      <span class="q-counter">Speaking · Q${state.idx + 1} of ${state.questions.length}</span>
      <button class="btn-primary" id="nextBtn" style="display:none">Next →</button>
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
    profile = recordAnswer(profile, skill, false);
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
    <div class="feedback-box ${isGood ? "correct" : "wrong"}" style="margin-top:10px">`;

  // Try Gemini feedback
  try {
    const geminiFeedback = await fetchAnswerFeedback("Speaking", answer, q.taskType);
    feedbackHtml += geminiFeedback.replace(/\n/g,"<br>");
  } catch {
    if (isGood) {
      feedbackHtml += `✅ Good response! You covered ${passed}/${total} criteria. ${passed < total ? "Try to also include: " + Object.entries(criteria).filter(([,v]) => !v).map(([k]) => k.replace("_"," ")).join(", ") + "." : ""}`;
    } else {
      const missing = Object.entries(criteria).filter(([,v]) => !v).map(([k]) => k.replace("_"," "));
      feedbackHtml += `Your response needs improvement. Missing: ${missing.join(", ")}. Aim for a clear position, at least one reason, and a specific example.`;
    }
  }

  feedbackHtml += `</div>`;
  container.querySelector("#speakFeedback").innerHTML = feedbackHtml;
  container.querySelector("#nextBtn").style.display = "inline-block";

  profile = recordAnswer(profile, skill, isGood);
  btn.disabled = false;
  btn.textContent = "Submit Answer";
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
        profile = recordAnswer(profile, skill, correct);
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
            ? "✅ Correct! Well done."
            : `❌ Incorrect. The correct answer is: <strong>${q.correctAnswer}</strong>`}
        </div>`;
      }

      // Show Next button
      const nextBtn = container.querySelector("#nextBtn");
      if (nextBtn) nextBtn.style.display = "inline-block";

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
      <div class="done-icon">${pct >= 70 ? "🏆" : pct >= 50 ? "📈" : "💪"}</div>
      <div class="done-title">Section Complete!</div>
      <div class="done-sub">${meta.label} practice finished.</div>
      <div class="done-stats">
        <div>
          <div class="done-stat-val">${correct}</div>
          <div class="done-stat-label">Correct</div>
        </div>
        <div>
          <div class="done-stat-val" style="color:var(--danger)">${errors}</div>
          <div class="done-stat-label">Mistakes</div>
        </div>
        <div>
          <div class="done-stat-val" style="color:var(--warning)">${pct}%</div>
          <div class="done-stat-label">Accuracy</div>
        </div>
      </div>
      <button class="btn-primary" id="restartBtn">🔄 Restart Section</button>
      <button class="btn-secondary" style="margin-left:10px" id="goAIPlanBtn">🤖 View AI Plan</button>
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
      <h3>⚡ Mini TOEFL Test</h3>
      <p>10 questions across all skill areas. Complete without stopping.</p>
      <div class="mini-composition">
        <span class="mini-tag">📖 3 Reading</span>
        <span class="mini-tag">🎧 3 Listening</span>
        <span class="mini-tag">📚 2 Vocabulary</span>
        <span class="mini-tag">🎤 1 Speaking</span>
        <span class="mini-tag">✍️ 1 Writing</span>
      </div>
      <button class="btn-primary" id="startMiniBtn">▶ Start Mini Test</button>
    </div>`;

  document.getElementById("startMiniBtn").addEventListener("click", () => {
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
    <div class="passage-label" style="margin-bottom:8px">${SKILL_META[q.skill.toLowerCase()].icon} ${q.skill} · Question ${state.idx + 1}</div>
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
      <button class="btn-primary" id="nextBtn" style="display:none">Next →</button>
    </div>`;

  container.querySelectorAll(".option-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const chosen  = btn.dataset.val;
      const correct = chosen === q.correctAnswer;
      state.answers.push({ skill: q.skill.toLowerCase(), correct });

      container.querySelectorAll(".option-btn").forEach(b => {
        b.disabled = true;
        if (b.dataset.val === q.correctAnswer) b.classList.add("correct");
        else if (b === btn && !correct)         b.classList.add("wrong");
      });

      container.querySelector("#feedback").innerHTML = `
        <div class="feedback-box ${correct ? "correct" : "wrong"}">
          ${correct ? "✅ Correct!" : `❌ Correct answer: <strong>${q.correctAnswer}</strong>`}
        </div>`;

      const nextBtn = container.querySelector("#nextBtn");
      nextBtn.style.display = "inline-block";
      nextBtn.addEventListener("click", () => { state.idx++; renderMiniQuestion(); }, { once: true });
    });
  });
}

function renderMiniReading(q, container) {
  const state   = practiceState.minitest;
  const letters = ["A","B","C","D"];
  container.innerHTML = `
    <div class="passage-label">📖 Reading</div>
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
      <button class="btn-primary" id="nextBtn" style="display:none">Next →</button>
    </div>`;

  container.querySelectorAll(".option-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const correct = btn.dataset.val === q.correctAnswer;
      state.answers.push({ skill: "reading", correct });
      container.querySelectorAll(".option-btn").forEach(b => {
        b.disabled = true;
        if (b.dataset.val === q.correctAnswer) b.classList.add("correct");
        else if (b === btn && !correct)         b.classList.add("wrong");
      });
      container.querySelector("#feedback").innerHTML = `
        <div class="feedback-box ${correct ? "correct" : "wrong"}">
          ${correct ? "✅ Correct!" : `❌ Correct: <strong>${q.correctAnswer}</strong>`}
        </div>`;
      const nb = container.querySelector("#nextBtn");
      nb.style.display = "inline-block";
      nb.addEventListener("click", () => { state.idx++; renderMiniQuestion(); }, { once: true });
    });
  });
}

function renderMiniListening(q, container) {
  const state   = practiceState.minitest;
  const letters = ["A","B","C","D"];
  container.innerHTML = `
    <div class="passage-label">🎧 ${q.lectureTitle}</div>
    <div class="passage-box" id="miniLectureBox" style="display:none">${q.lectureText}</div>
    <button class="play-btn" id="miniPlayBtn">▶ Play Lecture</button>
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
      <button class="btn-primary" id="nextBtn" style="display:none">Next →</button>
    </div>`;

  container.querySelector("#miniPlayBtn").addEventListener("click", function() {
    this.classList.add("played");
    this.textContent = "✅ Played";
    container.querySelector("#miniLectureBox").style.display = "block";
    container.querySelectorAll(".option-btn").forEach(b => b.disabled = false);
  });

  container.querySelectorAll(".option-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const correct = btn.dataset.val === q.correctAnswer;
      state.answers.push({ skill: "listening", correct });
      container.querySelectorAll(".option-btn").forEach(b => {
        b.disabled = true;
        if (b.dataset.val === q.correctAnswer) b.classList.add("correct");
        else if (b === btn && !correct)         b.classList.add("wrong");
      });
      container.querySelector("#feedback").innerHTML = `
        <div class="feedback-box ${correct ? "correct" : "wrong"}">
          ${correct ? "✅ Correct!" : `❌ Correct: <strong>${q.correctAnswer}</strong>`}
        </div>`;
      const nb = container.querySelector("#nextBtn");
      nb.style.display = "inline-block";
      nb.addEventListener("click", () => { state.idx++; renderMiniQuestion(); }, { once: true });
    });
  });
}

function renderMiniSpeaking(q, container) {
  const state = practiceState.minitest;
  container.innerHTML = `
    <div class="passage-label">🎤 Speaking</div>
    <div class="speaking-prompt">${q.prompt}</div>
    <div class="speaking-tip">💡 Write your 60-second spoken response.</div>
    <textarea class="answer-textarea" id="miniSpeakAnswer" placeholder="Type your response..."></textarea>
    <div style="display:flex;gap:10px">
      <button class="btn-primary" id="miniSubmitSpeak">Submit</button>
      <button class="btn-secondary" id="miniSkipSpeak">Skip</button>
    </div>
    <div id="feedback" style="margin-top:12px"></div>
    <div class="question-nav">
      <span class="q-counter">Q${state.idx + 1} / ${state.questions.length}</span>
      <button class="btn-primary" id="nextBtn" style="display:none">Next →</button>
    </div>`;

  container.querySelector("#miniSubmitSpeak").addEventListener("click", () => {
    const ans   = container.querySelector("#miniSpeakAnswer").value.trim();
    const lower = ans.toLowerCase();
    const good  = ans.split(/\s+/).length >= 30 &&
                  /\b(because|since|i (agree|disagree)|i think)\b/.test(lower);
    state.answers.push({ skill: "speaking", correct: good });
    container.querySelector("#feedback").innerHTML = `
      <div class="feedback-box ${good ? "correct" : "wrong"}">
        ${good ? "✅ Good response!" : "❌ Response too short or missing position/reason. Keep practicing!"}
      </div>`;
    const nb = container.querySelector("#nextBtn");
    nb.style.display = "inline-block";
    nb.addEventListener("click", () => { state.idx++; renderMiniQuestion(); }, { once: true });
  });

  container.querySelector("#miniSkipSpeak").addEventListener("click", () => {
    state.answers.push({ skill: "speaking", correct: false });
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
    profile = recordAnswer(profile, a.skill, a.correct);
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
        <div style="margin-top:10px;font-size:1rem;color:var(--accent)">
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
              <div class="result-skill-name">${meta.icon} ${meta.label}</div>
              <div class="result-skill-score ${cls}">${d.correct}/${d.total}</div>
              <div style="font-size:.7rem;color:var(--muted)">${pct}%</div>
            </div>`;
        }).join("")}
      </div>

      ${weakest ? `
        <div class="feedback-box info" style="margin:16px 0">
          <strong>🤖 AI Insight:</strong> Your weakest section was
          <strong>${SKILL_META[weakest]?.label}</strong>.
          ${generateLocalStudyPlan(profile).explanation}
        </div>` : ""}

      <div style="display:flex;gap:10px;justify-content:center">
        <button class="btn-primary" id="retakeMiniBtn">🔄 Retake Test</button>
        <button class="btn-secondary" id="viewPlanBtn">📋 View AI Plan</button>
      </div>
    </div>`;

  document.getElementById("miniProgress").textContent = `Done`;
  content.querySelector("#retakeMiniBtn").addEventListener("click", () => {
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
    btn.textContent = "⏳ Generating...";
    out.innerHTML = `<div class="ai-loading"><div class="spinner"></div> Asking Gemini AI for your personalized plan...</div>`;

    try {
      const result = await fetchAIStudyPlan();
      out.innerHTML = `<div style="white-space:pre-line;font-size:.875rem;line-height:1.7">${result}</div>`;
      profile.lastAIPlan     = result;
      profile.lastAIPlanDate = new Date().toISOString();
      saveProfile(profile);
      showToast("✅ AI plan ready!", "success");
    } catch (err) {
      const local = generateLocalStudyPlan(profile);
      out.innerHTML = `
        <div class="feedback-box info" style="margin-bottom:12px">${local.explanation}</div>
        ${local.tasks.map((t, i) => `
          <div class="plan-item">
            <div class="plan-num">${i + 1}</div>
            <div>
              <div class="plan-text">${SKILL_META[t.skill].icon} ${t.task}</div>
              <div class="plan-why">${t.why}</div>
            </div>
          </div>`).join("")}`;
      showToast(`⚠️ Using local plan (Gemini: ${err.message})`, "error");
    }

    btn.disabled = false;
    btn.textContent = "✨ Generate Study Plan";
  });

  document.getElementById("analyzeGapBtn").addEventListener("click", async () => {
    const btn = document.getElementById("analyzeGapBtn");
    const out = document.getElementById("scoreGapContent");
    btn.disabled = true;
    btn.textContent = "⏳ Analyzing...";

    profile = loadProfile();
    const gapHtml = renderScoreGapVisual(profile);
    out.innerHTML = `<div class="gap-visual">${gapHtml}</div>
      <div class="ai-loading" style="margin-top:12px"><div class="spinner"></div> Asking Gemini for gap analysis...</div>`;

    try {
      const result = await fetchScoreGapAnalysis();
      out.innerHTML = `
        <div class="gap-visual">${gapHtml}</div>
        <div class="feedback-box info" style="margin-top:12px;font-size:.85rem;white-space:pre-line">${result}</div>`;
      showToast("✅ Gap analysis complete!", "success");
    } catch {
      out.innerHTML = `<div class="gap-visual">${gapHtml}</div>
        <div class="feedback-box info" style="margin-top:12px;font-size:.85rem">
          Gap of ${Math.max(0, profile.targetScore - calcPredictedScore(profile))} points.
          Focus on your weakest skills to close the gap fastest.
        </div>`;
    }

    btn.disabled = false;
    btn.textContent = "🔍 Run AI Analysis";
  });
}

function renderAIPlanSection() {
  profile = loadProfile();
  const gapHtml = renderScoreGapVisual(profile);
  document.getElementById("gapVisual").innerHTML = gapHtml;
}

// ─── ANALYTICS ───────────────────────────────────
function initAnalytics() { /* rendered on navigate */ }

function renderAnalytics() {
  profile = loadProfile();
  const skills = ["reading","listening","speaking","writing","vocabulary"];

  // Summary cards
  document.getElementById("analyticsSummary").innerHTML = skills.map(skill => {
    const correct = profile.correct[skill]    || 0;
    const total   = profile.totalTasks[skill] || 0;
    const pct     = total > 0 ? Math.round((correct / total) * 100) : 0;
    const meta    = SKILL_META[skill];
    const color   = meta.color;
    return `
      <div class="summary-card">
        <div class="summary-skill">${meta.icon} ${meta.label}</div>
        <div class="summary-score" style="color:${color}">${pct}%</div>
        <div class="summary-label">${correct}/${total} correct</div>
        <div class="summary-bar">
          <div class="summary-fill" style="width:${pct}%;background:${color}"></div>
        </div>
      </div>`;
  }).join("");

  // Bar chart — skill progress
  document.getElementById("skillChart").innerHTML = skills.map(skill => {
    const pct  = profile.progress[skill] || 0;
    const meta = SKILL_META[skill];
    return `
      <div class="bar-chart-row">
        <span class="bar-chart-label">${meta.icon} ${meta.label}</span>
        <div class="bar-chart-track">
          <div class="bar-chart-fill" style="width:${pct}%;background:${meta.color}">${pct > 12 ? pct + "%" : ""}</div>
        </div>
        <span class="bar-chart-pct">${pct}%</span>
      </div>`;
  }).join("");

  // Error analysis
  const weak = calcWeaknessScores(profile);
  document.getElementById("errorAnalysis").innerHTML = weak.length === 0
    ? `<p class="placeholder-text">No data yet. Complete practice tasks to see error analysis.</p>`
    : weak.map(w => {
        const meta   = SKILL_META[w.skill];
        const errPct = Math.round(w.score * 100);
        return `
          <div class="error-item">
            <span class="error-skill">${meta.icon} ${meta.label}</span>
            <div class="error-bar-wrap">
              <div class="error-bar-track">
                <div class="error-bar-fill" style="width:${errPct}%"></div>
              </div>
            </div>
            <span class="error-pct">${errPct}%</span>
            <span class="error-count">${w.mistakes}/${w.total}</span>
          </div>`;
      }).join("");
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
