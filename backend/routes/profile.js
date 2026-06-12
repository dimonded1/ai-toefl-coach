const express = require("express");
const db = require("../database/db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const DEFAULT_PROFILE = {
  name: "Alex Carter",
  exam: "TOEFL iBT",
  targetScore: 95,
  preparationDays: 60,
  level: "intermediate",
  goal: "study abroad",
  startDate: null,
  scores: { reading: 15, listening: 14, speaking: 14, writing: 13 },
  baselineScores: { reading: 15, listening: 14, speaking: 14, writing: 13 },
  mistakes: { reading: 0, listening: 0, speaking: 0, writing: 0, vocabulary: 0 },
  totalTasks: { reading: 0, listening: 0, speaking: 0, writing: 0, vocabulary: 0 },
  correct: { reading: 0, listening: 0, speaking: 0, writing: 0, vocabulary: 0 },
  progress: { reading: 0, listening: 0, speaking: 0, writing: 0, vocabulary: 0 },
  proficiency: { reading: 50, listening: 47, speaking: 47, writing: 43, vocabulary: 0 },
  confidence: { level: "none", score: 0, bySkill: {} },
  readiness: { level: "not-ready", overall: 0, bySkill: {} },
  weakZones: [],
  attempts: [],
  miniTestHistory: [],
  xp: 0,
  streak: { current: 0, best: 0, lastActiveDate: null },
  activityLog: [],
  mistakeBank: [],
  achievements: [],
  lastAIPlan: null,
  lastAIPlanDate: null,
  scoringModelVersion: "legacy",
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

const JSON_FIELDS = {
  scores_json: "scores",
  baseline_scores_json: "baselineScores",
  mistakes_json: "mistakes",
  total_tasks_json: "totalTasks",
  correct_json: "correct",
  progress_json: "progress",
  proficiency_json: "proficiency",
  confidence_json: "confidence",
  readiness_json: "readiness",
  weak_zones_json: "weakZones",
  attempts_json: "attempts",
  mini_test_history_json: "miniTestHistory",
  streak_json: "streak",
  activity_log_json: "activityLog",
  mistake_bank_json: "mistakeBank",
  achievements_json: "achievements",
  last_ai_plan_json: "lastAIPlan",
  learning_progress_json: "learningProgress",
  vocabulary_progress_json: "vocabularyProgress",
  notes_json: "notes"
};

router.get("/", requireAuth, (req, res) => {
  const profile = getOrCreateProfile(req.user.id, { name: req.user.name });
  res.json({ profile });
});

router.put("/", requireAuth, (req, res) => {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    return res.status(400).json({ error: "Profile object required" });
  }

  const profile = saveProfileForUser(req.user.id, req.body, { name: req.user.name });
  res.json({ profile });
});

function getOrCreateProfile(userId, overrides = {}) {
  const row = db.prepare("SELECT * FROM profiles WHERE user_id = ?").get(userId);
  if (row) return rowToProfile(row);

  const profile = createDefaultProfile(overrides);
  saveProfileForUser(userId, profile);
  return getOrCreateProfile(userId);
}

function createDefaultProfile(overrides = {}) {
  return deepMerge(clone(DEFAULT_PROFILE), overrides);
}

function saveProfileForUser(userId, rawProfile, defaults = {}) {
  const current = db.prepare("SELECT * FROM profiles WHERE user_id = ?").get(userId);
  const merged = deepMerge(createDefaultProfile(defaults), current ? rowToProfile(current) : {});
  const profile = normalizeProfile(deepMerge(merged, rawProfile || {}));
  const now = new Date().toISOString();
  const existingCreatedAt = current?.created_at || now;

  const payload = {
    user_id: userId,
    name: textOrNull(profile.name),
    exam: textOrNull(profile.exam),
    target_score: intOrNull(profile.targetScore),
    preparation_days: intOrNull(profile.preparationDays),
    level: textOrNull(profile.level),
    goal: textOrNull(profile.goal),
    start_date: textOrNull(profile.startDate),
    xp: Number.isFinite(Number(profile.xp)) ? Number(profile.xp) : 0,
    last_ai_plan_date: textOrNull(profile.lastAIPlanDate),
    scoring_model_version: textOrNull(profile.scoringModelVersion),
    created_at: existingCreatedAt,
    updated_at: now
  };

  for (const [column, key] of Object.entries(JSON_FIELDS)) {
    payload[column] = JSON.stringify(profile[key] ?? DEFAULT_PROFILE[key] ?? null);
  }

  db.prepare(`
    INSERT INTO profiles (
      user_id, name, exam, target_score, preparation_days, level, goal, start_date,
      scores_json, baseline_scores_json, mistakes_json, total_tasks_json, correct_json,
      progress_json, proficiency_json, confidence_json, readiness_json, weak_zones_json,
      attempts_json, mini_test_history_json, xp, streak_json, activity_log_json,
      mistake_bank_json, achievements_json, last_ai_plan_json, learning_progress_json,
      vocabulary_progress_json, notes_json, last_ai_plan_date,
      scoring_model_version, created_at, updated_at
    ) VALUES (
      @user_id, @name, @exam, @target_score, @preparation_days, @level, @goal, @start_date,
      @scores_json, @baseline_scores_json, @mistakes_json, @total_tasks_json, @correct_json,
      @progress_json, @proficiency_json, @confidence_json, @readiness_json, @weak_zones_json,
      @attempts_json, @mini_test_history_json, @xp, @streak_json, @activity_log_json,
      @mistake_bank_json, @achievements_json, @last_ai_plan_json, @learning_progress_json,
      @vocabulary_progress_json, @notes_json, @last_ai_plan_date,
      @scoring_model_version, @created_at, @updated_at
    )
    ON CONFLICT(user_id) DO UPDATE SET
      name = excluded.name,
      exam = excluded.exam,
      target_score = excluded.target_score,
      preparation_days = excluded.preparation_days,
      level = excluded.level,
      goal = excluded.goal,
      start_date = excluded.start_date,
      scores_json = excluded.scores_json,
      baseline_scores_json = excluded.baseline_scores_json,
      mistakes_json = excluded.mistakes_json,
      total_tasks_json = excluded.total_tasks_json,
      correct_json = excluded.correct_json,
      progress_json = excluded.progress_json,
      proficiency_json = excluded.proficiency_json,
      confidence_json = excluded.confidence_json,
      readiness_json = excluded.readiness_json,
      weak_zones_json = excluded.weak_zones_json,
      attempts_json = excluded.attempts_json,
      mini_test_history_json = excluded.mini_test_history_json,
      xp = excluded.xp,
      streak_json = excluded.streak_json,
      activity_log_json = excluded.activity_log_json,
      mistake_bank_json = excluded.mistake_bank_json,
      achievements_json = excluded.achievements_json,
      last_ai_plan_json = excluded.last_ai_plan_json,
      learning_progress_json = excluded.learning_progress_json,
      vocabulary_progress_json = excluded.vocabulary_progress_json,
      notes_json = excluded.notes_json,
      last_ai_plan_date = excluded.last_ai_plan_date,
      scoring_model_version = excluded.scoring_model_version,
      updated_at = excluded.updated_at
  `).run(payload);

  if (profile.lastAIPlan) {
    db.prepare("INSERT INTO ai_plans (user_id, plan_json, created_at) VALUES (?, ?, ?)")
      .run(userId, JSON.stringify(profile.lastAIPlan), profile.lastAIPlanDate || now);
  }

  return rowToProfile(db.prepare("SELECT * FROM profiles WHERE user_id = ?").get(userId));
}

function rowToProfile(row) {
  const profile = createDefaultProfile({
    name: row.name,
    exam: row.exam,
    targetScore: row.target_score,
    preparationDays: row.preparation_days,
    level: row.level,
    goal: row.goal,
    startDate: row.start_date,
    xp: row.xp || 0,
    lastAIPlanDate: row.last_ai_plan_date,
    scoringModelVersion: row.scoring_model_version
  });

  for (const [column, key] of Object.entries(JSON_FIELDS)) {
    profile[key] = parseJson(row[column], DEFAULT_PROFILE[key] ?? null);
  }

  return normalizeProfile(profile);
}

function normalizeProfile(profile) {
  const normalized = deepMerge(clone(DEFAULT_PROFILE), profile || {});
  normalized.targetScore = clampInt(normalized.targetScore, 0, 120, DEFAULT_PROFILE.targetScore);
  normalized.preparationDays = clampInt(normalized.preparationDays, 1, 3650, DEFAULT_PROFILE.preparationDays);
  normalized.xp = Math.max(0, Number.parseInt(normalized.xp, 10) || 0);
  normalized.name = String(normalized.name || DEFAULT_PROFILE.name).slice(0, 80);
  normalized.exam = String(normalized.exam || DEFAULT_PROFILE.exam).slice(0, 80);
  normalized.level = String(normalized.level || DEFAULT_PROFILE.level).slice(0, 40);
  normalized.goal = String(normalized.goal || DEFAULT_PROFILE.goal).slice(0, 80);
  return normalized;
}

function parseJson(value, fallback) {
  if (value === null || value === undefined || value === "") return clone(fallback);
  try {
    return JSON.parse(value);
  } catch {
    return clone(fallback);
  }
}

function deepMerge(target, source) {
  if (!source || typeof source !== "object" || Array.isArray(source)) return target;
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
      if (!target[key] || typeof target[key] !== "object" || Array.isArray(target[key])) target[key] = {};
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function textOrNull(value) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text || null;
}

function intOrNull(value) {
  const int = Number.parseInt(value, 10);
  return Number.isFinite(int) ? int : null;
}

function clampInt(value, min, max, fallback) {
  const int = Number.parseInt(value, 10);
  if (!Number.isFinite(int)) return fallback;
  return Math.max(min, Math.min(max, int));
}

module.exports = router;
module.exports.createDefaultProfile = createDefaultProfile;
module.exports.saveProfileForUser = saveProfileForUser;
