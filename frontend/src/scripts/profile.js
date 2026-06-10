// ═══════════════════════════════════════════════
//  AI TOEFL Coach — User Profile & localStorage
// ═══════════════════════════════════════════════

const STORAGE_KEY = "toefl_coach_profile";

const DEFAULT_PROFILE = {
  name: "Alex Carter",
  exam: "TOEFL iBT",
  targetScore: 95,
  preparationDays: 60,
  level: "intermediate",
  goal: "study abroad",
  startDate: null,

  // Per-skill scores (0–30 each, total 0–120)
  scores: {
    reading:    15,
    listening:  14,
    speaking:   14,
    writing:    13
  },

  // Task tracking
  mistakes: {
    reading: 0, listening: 0, speaking: 0, writing: 0, vocabulary: 0
  },
  totalTasks: {
    reading: 0, listening: 0, speaking: 0, writing: 0, vocabulary: 0
  },
  correct: {
    reading: 0, listening: 0, speaking: 0, writing: 0, vocabulary: 0
  },

  // Progress 0–100 (%)
  progress: {
    reading: 0, listening: 0, speaking: 0, writing: 0, vocabulary: 0
  },

  // History for mini test
  miniTestHistory: [],

  // Habit and progress tracking
  xp: 0,
  streak: {
    current: 0,
    best: 0,
    lastActiveDate: null
  },
  activityLog: [],
  mistakeBank: [],
  achievements: [],

  // AI plan cache
  lastAIPlan: null,
  lastAIPlanDate: null
};

// ─── CRUD ────────────────────────────────────────

function loadProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return JSON.parse(JSON.stringify(DEFAULT_PROFILE));
    const saved = JSON.parse(raw);
    // Merge with defaults to handle new fields
    return deepMerge(JSON.parse(JSON.stringify(DEFAULT_PROFILE)), saved);
  } catch {
    return JSON.parse(JSON.stringify(DEFAULT_PROFILE));
  }
}

function saveProfile(profile) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.warn("localStorage save failed:", e);
  }
}

function resetProfile() {
  localStorage.removeItem(STORAGE_KEY);
  return JSON.parse(JSON.stringify(DEFAULT_PROFILE));
}

function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
      if (!target[key]) target[key] = {};
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

// ─── SCORE CALCULATION ───────────────────────────

function calcPredictedScore(profile) {
  const s = profile.scores;
  return s.reading + s.listening + s.speaking + s.writing;
}

/**
 * Update a skill score based on error rate.
 * Better performance → higher score (approaching 30).
 * Worse performance → score decreases toward 0.
 */
function updateSkillScore(profile, skill) {
  if (!["reading","listening","speaking","writing"].includes(skill)) return profile;

  const total   = profile.totalTasks[skill];
  const correct = profile.correct[skill];
  if (total === 0) return profile;

  const accuracy = correct / total; // 0–1
  // Map accuracy to 0–30 range, smoothly
  profile.scores[skill] = Math.round(accuracy * 30);
  return profile;
}

/**
 * Update progress % for a skill.
 * Progress = (correct / max_tasks_expected) * 100, capped at 100.
 */
function updateProgress(profile, skill) {
  const total   = profile.totalTasks[skill];
  const correct = profile.correct[skill];
  if (total === 0) return profile;

  const accuracy = correct / total;
  // Progress also reflects how much has been practiced (volume factor)
  const volumeFactor = Math.min(total / 10, 1); // full credit after 10 tasks
  profile.progress[skill] = Math.round(accuracy * volumeFactor * 100);
  return profile;
}

// ─── WEAKNESS ANALYSIS ───────────────────────────

function calcWeaknessScores(profile) {
  const skills = ["reading","listening","speaking","writing","vocabulary"];
  return skills.map(skill => {
    const m = profile.mistakes[skill];
    const t = profile.totalTasks[skill];
    const score = t > 0 ? m / t : 0;
    return { skill, score, mistakes: m, total: t };
  }).sort((a, b) => b.score - a.score);
}

function getWeakSkills(profile, threshold = 0.4) {
  return calcWeaknessScores(profile).filter(s => s.score >= threshold);
}

function getStrongestSkills(profile) {
  return calcWeaknessScores(profile).filter(s => s.score < 0.3);
}

// ─── RECORD ANSWER ───────────────────────────────

/**
 * Call this after every question is answered.
 * @param {object} profile
 * @param {string} skill  - "reading"|"listening"|"speaking"|"writing"|"vocabulary"
 * @param {boolean} isCorrect
 * @returns updated profile
 */
function recordAnswer(profile, skill, isCorrect, question = null) {
  const s = skill.toLowerCase();
  profile.totalTasks[s] = (profile.totalTasks[s] || 0) + 1;
  if (isCorrect) {
    profile.correct[s] = (profile.correct[s] || 0) + 1;
  } else {
    profile.mistakes[s] = (profile.mistakes[s] || 0) + 1;
    recordMistake(profile, s, question);
  }

  updateHabitProgress(profile, s, isCorrect);
  if (["reading","listening","speaking","writing"].includes(s)) {
    updateSkillScore(profile, s);
  }
  updateProgress(profile, s);
  saveProfile(profile);
  return profile;
}

function recordMistake(profile, skill, question) {
  if (!question) return profile;
  profile.mistakeBank = profile.mistakeBank || [];
  const id = question.id || `${skill}-${Date.now()}`;
  const existing = profile.mistakeBank.find(item => item.id === id);
  if (existing) {
    existing.count += 1;
    existing.lastSeen = new Date().toISOString();
    return profile;
  }

  profile.mistakeBank.unshift({
    id,
    skill,
    topic: question.topic || "General",
    difficulty: question.difficulty || "medium",
    prompt: question.question || question.prompt || question.lectureTitle || "Open response task",
    correctAnswer: question.correctAnswer || null,
    count: 1,
    mastered: false,
    lastSeen: new Date().toISOString()
  });

  profile.mistakeBank = profile.mistakeBank.slice(0, 80);
  return profile;
}

function updateHabitProgress(profile, skill, isCorrect) {
  const today = new Date().toISOString().slice(0, 10);
  const streak = profile.streak || { current: 0, best: 0, lastActiveDate: null };

  if (streak.lastActiveDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    streak.current = streak.lastActiveDate === yesterday ? streak.current + 1 : 1;
    streak.best = Math.max(streak.best || 0, streak.current);
    streak.lastActiveDate = today;
  }
  profile.streak = streak;

  profile.xp = (profile.xp || 0) + (isCorrect ? 12 : 5);
  profile.activityLog = profile.activityLog || [];
  profile.activityLog.push({
    date: new Date().toISOString(),
    skill,
    correct: isCorrect,
    xp: isCorrect ? 12 : 5
  });
  profile.activityLog = profile.activityLog.slice(-300);

  updateAchievements(profile);
  return profile;
}

function updateAchievements(profile) {
  const earned = new Set(profile.achievements || []);
  const total = Object.values(profile.totalTasks || {}).reduce((sum, value) => sum + value, 0);
  const correct = Object.values(profile.correct || {}).reduce((sum, value) => sum + value, 0);

  if (total >= 10) earned.add("First 10 Tasks");
  if (total >= 50) earned.add("Practice Engine");
  if ((profile.streak?.current || 0) >= 3) earned.add("3-Day Streak");
  if ((profile.xp || 0) >= 500) earned.add("500 XP");
  if (total >= 20 && correct / total >= 0.8) earned.add("80% Accuracy");

  profile.achievements = Array.from(earned);
  return profile;
}

function calcUserLevel(profile) {
  const xp = profile.xp || 0;
  return Math.max(1, Math.floor(xp / 120) + 1);
}

function xpForNextLevel(profile) {
  const level = calcUserLevel(profile);
  return level * 120;
}

// ─── DAYS REMAINING ──────────────────────────────

function daysRemaining(profile) {
  if (!profile.startDate) return profile.preparationDays;
  const start   = new Date(profile.startDate);
  const now     = new Date();
  const elapsed = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  return Math.max(0, profile.preparationDays - elapsed);
}

// ─── LOCAL AI STUDY PLAN (no API) ────────────────

function generateLocalStudyPlan(profile) {
  const weak    = calcWeaknessScores(profile);
  const target  = profile.targetScore;
  const current = calcPredictedScore(profile);
  const gap     = target - current;

  const top1 = weak[0];
  const top2 = weak[1];

  const tasks = [
    {
      skill: top1.skill,
      task: `Practice 8–10 ${SKILL_META[top1.skill].label} questions`,
      why: `${top1.mistakes}/${top1.total} mistakes — highest error rate`
    },
    {
      skill: top2.skill,
      task: `Complete a ${SKILL_META[top2.skill].label} exercise set`,
      why: `Second weakest skill with ${Math.round(top2.score * 100)}% error rate`
    },
    {
      skill: "vocabulary",
      task: "Review 10 academic vocabulary words",
      why: "Vocabulary supports all TOEFL sections"
    },
    {
      skill: "speaking",
      task: "Write a 60-second response to 1 speaking prompt",
      why: "Regular speaking practice builds fluency"
    },
    {
      skill: "reading",
      task: "Read one academic passage and answer all questions",
      why: "Reading comprehension underpins Writing and Listening"
    },
    {
      skill: "writing",
      task: "Build one TOEFL paragraph with a clear claim and support",
      why: "Writing structure improves both essays and academic discussion tasks"
    }
  ];

  // Deduplicate: don't repeat skills already in top 2
  const uniqueTasks = [];
  const seen = new Set();
  tasks.forEach(t => {
    if (!seen.has(t.skill)) {
      seen.add(t.skill);
      uniqueTasks.push(t);
    }
  });

  const explanation = `Focus on ${SKILL_META[top1.skill].label} and ${SKILL_META[top2.skill].label} today.\n` +
    `Your gap to TOEFL ${target} is ${gap} points. ` +
    `${SKILL_META[top1.skill].label} has ${top1.mistakes} mistakes out of ${top1.total} tasks (${Math.round(top1.score * 100)}% error rate). ` +
    `Consistent daily practice in these areas will close the gap fastest.`;

  return { tasks: uniqueTasks, explanation, gap, current, target };
}
