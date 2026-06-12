// ═══════════════════════════════════════════════
//  AI TOEFL Coach — User Profile & localStorage
// ═══════════════════════════════════════════════

const STORAGE_KEY = "toefl_coach_profile";
let profileSyncTimer = null;

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
  baselineScores: {
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

  // Proficiency 0–100 (%) is performance quality; progress is practice volume.
  proficiency: {
    reading: 50, listening: 47, speaking: 47, writing: 43, vocabulary: 0
  },

  confidence: {
    level: "none",
    score: 0,
    bySkill: {}
  },
  readiness: {
    level: "not-ready",
    overall: 0,
    bySkill: {}
  },
  weakZones: [],
  attempts: [],
  scoringModelVersion: "legacy",

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
  lastAIPlanDate: null,

  // Learning layer
  learningProgress: {
    completedLessons: [],
    savedLessons: [],
    currentLessonId: "toefl-structure"
  },
  vocabularyProgress: {
    savedWords: [],
    masteredWords: [],
    missedWords: [],
    reviews: []
  },
  notes: []
};

// ─── CRUD ────────────────────────────────────────

function loadProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return refreshScoringMetrics(JSON.parse(JSON.stringify(DEFAULT_PROFILE)));
    const saved = JSON.parse(raw);
    // Merge with defaults to handle new fields
    const merged = deepMerge(JSON.parse(JSON.stringify(DEFAULT_PROFILE)), saved);
    if (!saved.baselineScores) merged.baselineScores = { ...merged.scores };
    return refreshScoringMetrics(merged);
  } catch {
    return refreshScoringMetrics(JSON.parse(JSON.stringify(DEFAULT_PROFILE)));
  }
}

function saveProfile(profile, options = {}) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.warn("localStorage save failed:", e);
  }

  if (options.sync !== false) {
    scheduleProfileSync(profile);
  }
}

function resetProfile() {
  localStorage.removeItem(STORAGE_KEY);
  const fresh = refreshScoringMetrics(JSON.parse(JSON.stringify(DEFAULT_PROFILE)));
  scheduleProfileSync(fresh);
  return fresh;
}

function cacheProfile(profile) {
  saveProfile(refreshScoringMetrics(profile), { sync: false });
}

async function syncProfileFromBackend() {
  if (typeof isAuthenticated !== "function" || !isAuthenticated()) return null;
  if (typeof apiGetProfile !== "function") return null;

  try {
    emitProfileSyncState("syncing", "Loading synced profile");
    const remoteProfile = await apiGetProfile();
    const merged = deepMerge(JSON.parse(JSON.stringify(DEFAULT_PROFILE)), remoteProfile || {});
    if (!remoteProfile?.baselineScores) merged.baselineScores = { ...merged.scores };
    const syncedProfile = refreshScoringMetrics(merged);
    cacheProfile(syncedProfile);
    emitProfileSyncState("synced", "Synced");
    return syncedProfile;
  } catch (e) {
    if (e.status === 401 && typeof clearAuthToken === "function") clearAuthToken();
    console.warn("Profile sync failed:", e);
    emitProfileSyncState("failed", "Sync failed");
    return null;
  }
}

function scheduleProfileSync(profile) {
  if (typeof isAuthenticated !== "function" || !isAuthenticated()) {
    emitProfileSyncState("local", "Saving locally");
    return;
  }
  if (typeof apiSaveProfile !== "function") return;

  emitProfileSyncState("saving", "Saving");
  clearTimeout(profileSyncTimer);
  const snapshot = JSON.parse(JSON.stringify(profile));
  profileSyncTimer = setTimeout(async () => {
    try {
      await apiSaveProfile(snapshot);
      emitProfileSyncState("synced", "Synced");
    } catch (e) {
      console.warn("Remote profile save failed:", e);
      emitProfileSyncState("failed", "Sync failed");
    }
  }, 250);
}

function emitProfileSyncState(state, message) {
  if (typeof setProfileSyncState === "function") {
    setProfileSyncState(state, message);
  }
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
    if (s === "vocabulary") recordVocabularyReview(profile, question, "reviewed");
  } else {
    profile.mistakes[s] = (profile.mistakes[s] || 0) + 1;
    recordMistake(profile, s, question);
    if (s === "vocabulary") recordVocabularyReview(profile, question, "missed");
  }

  recordAttempt(profile, s, isCorrect, question);
  updateHabitProgress(profile, s, isCorrect);
  refreshScoringMetrics(profile);
  saveProfile(profile);
  return profile;
}

function normalizeVocabularyWordId(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function extractVocabularyWordId(question) {
  const prompt = question?.question || "";
  const quoted = prompt.match(/"([^"]+)"/);
  return normalizeVocabularyWordId(quoted?.[1] || question?.word || question?.id);
}

function recordVocabularyReview(profile, question, action) {
  const wordId = extractVocabularyWordId(question);
  if (!wordId) return profile;

  profile.vocabularyProgress = profile.vocabularyProgress || {};
  profile.vocabularyProgress.savedWords = profile.vocabularyProgress.savedWords || [];
  profile.vocabularyProgress.masteredWords = profile.vocabularyProgress.masteredWords || [];
  profile.vocabularyProgress.missedWords = profile.vocabularyProgress.missedWords || [];
  profile.vocabularyProgress.reviews = profile.vocabularyProgress.reviews || [];

  if (action === "missed" && !profile.vocabularyProgress.missedWords.includes(wordId)) {
    profile.vocabularyProgress.missedWords.push(wordId);
  }

  profile.vocabularyProgress.reviews.push({
    wordId,
    action,
    questionId: question?.id || null,
    date: new Date().toISOString()
  });
  profile.vocabularyProgress.reviews = profile.vocabularyProgress.reviews.slice(-250);
  return profile;
}

function recordAttempt(profile, skill, isCorrect, question) {
  profile.attempts = profile.attempts || [];
  profile.attempts.push({
    id: `${skill}-${Date.now()}-${profile.attempts.length}`,
    date: new Date().toISOString(),
    skill,
    correct: Boolean(isCorrect),
    difficulty: question?.difficulty || "medium",
    topic: question?.topic || "General",
    questionId: question?.id || null
  });
  profile.attempts = profile.attempts.slice(-1000);
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
