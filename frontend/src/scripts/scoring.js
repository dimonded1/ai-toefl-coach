// ═══════════════════════════════════════════════
//  AI TOEFL Coach — Scoring Model
// ═══════════════════════════════════════════════

const TOEFL_SCORE_SKILLS = ["reading", "listening", "speaking", "writing"];
const TRACKED_SKILLS = [...TOEFL_SCORE_SKILLS, "vocabulary"];
const SCORING_MODEL_VERSION = "andrew-sprint-4-v1";
const PROGRESS_TARGET_TASKS = 20;
const CONFIDENCE_TARGET_TASKS = 20;
const SCORE_FULL_WEIGHT_TASKS = 20;
const RECENCY_HALF_LIFE_DAYS = 21;
const READINESS_TARGET_SCORE = 24;
const DIFFICULTY_WEIGHTS = {
  easy: 0.85,
  medium: 1,
  hard: 1.15
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function round(value, digits = 0) {
  const factor = 10 ** digits;
  return Math.round((value + 1e-10) * factor) / factor;
}

function getDifficultyWeight(difficulty) {
  return DIFFICULTY_WEIGHTS[String(difficulty || "medium").toLowerCase()] || DIFFICULTY_WEIGHTS.medium;
}

function getRecencyWeight(dateLike, now = new Date()) {
  if (!dateLike) return 1;
  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) return 1;

  const ageDays = Math.max(0, (now - date) / 86400000);
  return 0.5 ** (ageDays / RECENCY_HALF_LIFE_DAYS);
}

function getSkillTotal(profile, skill) {
  return profile.totalTasks?.[skill] || 0;
}

function getSkillCorrect(profile, skill) {
  return profile.correct?.[skill] || 0;
}

function getSkillMistakes(profile, skill) {
  return profile.mistakes?.[skill] || 0;
}

function getSkillAttempts(profile, skill) {
  return (profile.attempts || []).filter(attempt => attempt.skill === skill);
}

function calcSkillStats(profile, skill, now = new Date()) {
  const attempts = getSkillAttempts(profile, skill);

  if (attempts.length > 0) {
    const stats = attempts.reduce((acc, attempt) => {
      const difficultyWeight = getDifficultyWeight(attempt.difficulty);
      const recencyWeight = getRecencyWeight(attempt.date || attempt.answeredAt, now);
      const weight = difficultyWeight * recencyWeight;

      acc.total += 1;
      acc.weightedTotal += weight;
      if (attempt.correct) {
        acc.correct += 1;
        acc.weightedCorrect += weight;
      } else {
        acc.mistakes += 1;
        acc.weightedMistakes += weight;
      }
      acc.recencyWeightTotal += recencyWeight;
      return acc;
    }, {
      total: 0,
      correct: 0,
      mistakes: 0,
      weightedTotal: 0,
      weightedCorrect: 0,
      weightedMistakes: 0,
      recencyWeightTotal: 0
    });

    stats.accuracy = stats.total > 0 ? stats.correct / stats.total : null;
    stats.weightedAccuracy = stats.weightedTotal > 0 ? stats.weightedCorrect / stats.weightedTotal : null;
    stats.errorRate = stats.total > 0 ? stats.mistakes / stats.total : 0;
    stats.weightedErrorRate = stats.weightedTotal > 0 ? stats.weightedMistakes / stats.weightedTotal : 0;
    stats.averageRecencyWeight = stats.total > 0 ? stats.recencyWeightTotal / stats.total : 0;
    stats.source = "attempts";
    return stats;
  }

  const total = getSkillTotal(profile, skill);
  const correct = getSkillCorrect(profile, skill);
  const mistakes = getSkillMistakes(profile, skill);
  const accuracy = total > 0 ? correct / total : null;

  return {
    total,
    correct,
    mistakes,
    weightedTotal: total,
    weightedCorrect: correct,
    weightedMistakes: mistakes,
    accuracy,
    weightedAccuracy: accuracy,
    errorRate: total > 0 ? mistakes / total : 0,
    weightedErrorRate: total > 0 ? mistakes / total : 0,
    averageRecencyWeight: total > 0 ? 0.35 : 0,
    source: "aggregate"
  };
}

function calcSkillAccuracy(profile, skill) {
  return calcSkillStats(profile, skill).accuracy;
}

function calcWeightedSkillAccuracy(profile, skill) {
  return calcSkillStats(profile, skill).weightedAccuracy;
}

function calcSectionScoreFromAccuracy(accuracy) {
  if (accuracy === null) return null;
  return Math.round(accuracy * 30);
}

function calcSkillScore(profile, skill) {
  const stats = calcSkillStats(profile, skill);
  const observedScore = calcSectionScoreFromAccuracy(stats.weightedAccuracy);
  if (observedScore === null) return null;

  const baselineScore = profile.baselineScores?.[skill] ?? profile.scores?.[skill] ?? observedScore;
  const sampleWeight = clamp(stats.total / SCORE_FULL_WEIGHT_TASKS, 0, 1);
  return Math.round((baselineScore * (1 - sampleWeight)) + (observedScore * sampleWeight));
}

function calcSkillProgressPercent(profile, skill) {
  const total = calcSkillStats(profile, skill).total;
  if (total === 0) return null;

  return Math.round(clamp(total / PROGRESS_TARGET_TASKS, 0, 1) * 100);
}

function calcSkillProficiencyPercent(profile, skill) {
  const accuracy = calcWeightedSkillAccuracy(profile, skill);
  if (accuracy === null) {
    const sectionScore = profile.scores?.[skill];
    if (TOEFL_SCORE_SKILLS.includes(skill) && typeof sectionScore === "number") {
      return round(clamp(sectionScore / 30, 0, 1) * 100);
    }
    return null;
  }
  return round(accuracy * 100);
}

function calcSkillConfidence(profile, skill) {
  const stats = calcSkillStats(profile, skill);
  if (stats.total === 0) {
    return {
      skill,
      level: "none",
      score: 0,
      sampleSize: 0,
      source: stats.source
    };
  }

  const sampleFactor = clamp(stats.total / CONFIDENCE_TARGET_TASKS, 0, 1);
  const recencyFactor = clamp(stats.averageRecencyWeight || 0, 0, 1);
  const score = Math.round((sampleFactor * 0.75 + recencyFactor * 0.25) * 100);
  const level = score >= 75 ? "high" : score >= 45 ? "medium" : "low";

  return {
    skill,
    level,
    score,
    sampleSize: stats.total,
    source: stats.source
  };
}

function calcPredictedScore(profile) {
  const scores = profile.scores || {};
  return TOEFL_SCORE_SKILLS.reduce((sum, skill) => sum + (scores[skill] || 0), 0);
}

function updateSkillScore(profile, skill) {
  if (!TOEFL_SCORE_SKILLS.includes(skill)) return profile;

  const score = calcSkillScore(profile, skill);
  if (score === null) return profile;

  profile.scores[skill] = score;
  return profile;
}

function updateProgress(profile, skill) {
  const progress = calcSkillProgressPercent(profile, skill);
  if (progress === null) return profile;

  profile.progress[skill] = progress;
  return profile;
}

function updateProficiency(profile, skill) {
  const proficiency = calcSkillProficiencyPercent(profile, skill);
  if (proficiency === null) return profile;

  profile.proficiency = profile.proficiency || {};
  profile.proficiency[skill] = proficiency;
  return profile;
}

function calcWeaknessScores(profile) {
  return TRACKED_SKILLS.map(skill => {
    const stats = calcSkillStats(profile, skill);
    const confidence = calcSkillConfidence(profile, skill);
    return {
      skill,
      score: stats.weightedErrorRate,
      mistakes: stats.mistakes,
      total: stats.total,
      confidence: confidence.level,
      confidenceScore: confidence.score
    };
  }).sort((a, b) => b.score - a.score);
}

function getWeakSkills(profile, threshold = 0.4) {
  return calcWeaknessScores(profile).filter(s => s.score >= threshold);
}

function getStrongestSkills(profile) {
  return calcWeaknessScores(profile).filter(s => s.score < 0.3);
}

function calcConfidenceSummary(profile) {
  const bySkill = TRACKED_SKILLS.reduce((acc, skill) => {
    acc[skill] = calcSkillConfidence(profile, skill);
    return acc;
  }, {});

  const scoreSkills = TOEFL_SCORE_SKILLS.map(skill => bySkill[skill]);
  const overallScore = Math.round(
    scoreSkills.reduce((sum, item) => sum + item.score, 0) / scoreSkills.length
  );

  return {
    level: overallScore >= 75 ? "high" : overallScore >= 45 ? "medium" : overallScore > 0 ? "low" : "none",
    score: overallScore,
    bySkill
  };
}

function calcReadinessMetrics(profile) {
  const targetPerSkill = Math.round((profile.targetScore || 0) / 4);
  const bySkill = TOEFL_SCORE_SKILLS.reduce((acc, skill) => {
    const score = profile.scores?.[skill] || 0;
    const confidence = calcSkillConfidence(profile, skill);
    const target = targetPerSkill || READINESS_TARGET_SCORE;
    const scoreFactor = clamp(score / Math.max(1, target), 0, 1);
    const confidenceFactor = confidence.score / 100;
    const readiness = Math.round((scoreFactor * 0.7 + confidenceFactor * 0.3) * 100);

    acc[skill] = {
      score,
      target,
      readiness,
      confidence: confidence.level,
      gap: Math.max(0, target - score)
    };
    return acc;
  }, {});

  const overall = Math.round(
    Object.values(bySkill).reduce((sum, item) => sum + item.readiness, 0) / TOEFL_SCORE_SKILLS.length
  );

  return {
    overall,
    level: overall >= 80 ? "ready" : overall >= 55 ? "developing" : "not-ready",
    bySkill
  };
}

function refreshScoringMetrics(profile) {
  profile.proficiency = profile.proficiency || {};
  profile.progress = profile.progress || {};
  profile.scores = profile.scores || {};

  TRACKED_SKILLS.forEach(skill => {
    updateProgress(profile, skill);
    updateProficiency(profile, skill);
    updateSkillScore(profile, skill);
  });

  profile.confidence = calcConfidenceSummary(profile);
  profile.readiness = calcReadinessMetrics(profile);
  profile.weakZones = calcWeaknessScores(profile).filter(item => item.total > 0).slice(0, 5);
  profile.scoringModelVersion = SCORING_MODEL_VERSION;
  return profile;
}

function buildScoringSnapshot(profile) {
  const refreshed = refreshScoringMetrics(JSON.parse(JSON.stringify(profile)));
  return {
    modelVersion: SCORING_MODEL_VERSION,
    predictedScore: calcPredictedScore(refreshed),
    scores: refreshed.scores,
    progress: refreshed.progress,
    proficiency: refreshed.proficiency,
    confidence: refreshed.confidence,
    readiness: refreshed.readiness,
    weakZones: refreshed.weakZones,
    sampleSize: TRACKED_SKILLS.reduce((acc, skill) => {
      acc[skill] = calcSkillStats(refreshed, skill).total;
      return acc;
    }, {})
  };
}
