// ═══════════════════════════════════════════════
//  AI TOEFL Coach — Analytics Data Model
// ═══════════════════════════════════════════════

function buildAnalyticsModel(profile) {
  const scoring = buildScoringSnapshot(profile);

  return {
    generatedAt: new Date().toISOString(),
    scoringModelVersion: scoring.modelVersion,
    predictedScore: scoring.predictedScore,
    confidence: scoring.confidence,
    readiness: scoring.readiness,
    weakZones: scoring.weakZones,
    skills: TRACKED_SKILLS.map(skill => buildSkillAnalytics(profile, scoring, skill)),
    recentAttempts: (profile.attempts || []).slice(-30).map(attempt => ({
      date: attempt.date,
      skill: attempt.skill,
      correct: attempt.correct,
      difficulty: attempt.difficulty || "medium",
      topic: attempt.topic || "General"
    }))
  };
}

function buildSkillAnalytics(profile, scoring, skill) {
  const stats = calcSkillStats(profile, skill);
  const confidence = scoring.confidence.bySkill[skill] || calcSkillConfidence(profile, skill);
  const readiness = scoring.readiness.bySkill[skill] || null;

  return {
    skill,
    totalTasks: stats.total,
    correct: stats.correct,
    mistakes: stats.mistakes,
    accuracy: stats.accuracy === null ? null : round(stats.accuracy * 100, 1),
    weightedAccuracy: stats.weightedAccuracy === null ? null : round(stats.weightedAccuracy * 100, 1),
    progress: scoring.progress[skill] || 0,
    proficiency: scoring.proficiency[skill] || 0,
    confidence,
    readiness,
    source: stats.source
  };
}
