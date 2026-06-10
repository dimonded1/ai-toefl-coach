// Control examples for Andrew's scoring work.
// These examples are intentionally framework-free so they can run in a browser or Node VM.

const BASE_EXAMPLE_PROFILE = {
  targetScore: 95,
  scores: { reading: 15, listening: 14, speaking: 14, writing: 13 },
  totalTasks: { reading: 0, listening: 0, speaking: 0, writing: 0, vocabulary: 0 },
  correct: { reading: 0, listening: 0, speaking: 0, writing: 0, vocabulary: 0 },
  mistakes: { reading: 0, listening: 0, speaking: 0, writing: 0, vocabulary: 0 },
  progress: { reading: 0, listening: 0, speaking: 0, writing: 0, vocabulary: 0 },
  proficiency: { reading: 50, listening: 47, speaking: 47, writing: 43, vocabulary: 0 },
  attempts: []
};

const SCORING_CONTROL_EXAMPLES = [
  {
    name: "zero tasks keep legacy default prediction and no confidence",
    profile: BASE_EXAMPLE_PROFILE,
    expected: {
      predictedScore: 56,
      readingScore: 15,
      readingProgress: 0,
      readingProficiency: 50,
      readingConfidence: "none",
      readingSampleSize: 0,
      topWeakSkill: "reading",
      topWeakScore: 0
    }
  },
  {
    name: "aggregate 7 of 10 reading correct maps to 21 score and 50 volume progress",
    profile: mergeExampleProfile({
      totalTasks: { reading: 10 },
      correct: { reading: 7 },
      mistakes: { reading: 3 }
    }),
    expected: {
      predictedScore: 62,
      readingScore: 21,
      readingProgress: 50,
      readingProficiency: 70,
      readingConfidence: "medium",
      readingSampleSize: 10,
      topWeakSkill: "reading",
      topWeakScore: 0.3
    }
  },
  {
    name: "small sample remains low confidence",
    profile: mergeExampleProfile({
      totalTasks: { reading: 2 },
      correct: { reading: 1 },
      mistakes: { reading: 1 }
    }),
    expected: {
      predictedScore: 56,
      readingScore: 15,
      readingProgress: 10,
      readingProficiency: 50,
      readingConfidence: "low",
      readingSampleSize: 2,
      topWeakSkill: "reading",
      topWeakScore: 0.5
    }
  },
  {
    name: "all correct hard attempts raise weighted proficiency",
    profile: mergeExampleProfile({
      attempts: buildAttempts("reading", [true, true, true, true], "hard")
    }),
    expected: {
      predictedScore: 71,
      readingScore: 30,
      readingProgress: 20,
      readingProficiency: 100,
      readingConfidence: "low",
      readingSampleSize: 4,
      topWeakSkill: "reading",
      topWeakScore: 0
    }
  },
  {
    name: "all wrong easy attempts produce zero proficiency",
    profile: mergeExampleProfile({
      attempts: buildAttempts("reading", [false, false, false, false], "easy")
    }),
    expected: {
      predictedScore: 41,
      readingScore: 0,
      readingProgress: 20,
      readingProficiency: 0,
      readingConfidence: "low",
      readingSampleSize: 4,
      topWeakSkill: "reading",
      topWeakScore: 1
    }
  },
  {
    name: "difficulty weights reward hard correct answers more than easy correct answers",
    profile: mergeExampleProfile({
      attempts: [
        ...buildAttempts("reading", [true, true], "hard"),
        ...buildAttempts("reading", [false, false], "easy")
      ]
    }),
    expected: {
      predictedScore: 58,
      readingScore: 17,
      readingProgress: 20,
      readingProficiency: 58,
      readingConfidence: "low",
      readingSampleSize: 4,
      topWeakSkill: "reading",
      topWeakScore: 0.43
    }
  },
  {
    name: "recent wrong answers outweigh old correct answers",
    profile: mergeExampleProfile({
      attempts: [
        ...buildAttempts("reading", [true, true, true, true], "medium", "2026-04-01T00:00:00.000Z"),
        ...buildAttempts("reading", [false, false], "medium", "2026-06-10T00:00:00.000Z")
      ]
    }),
    now: "2026-06-10T00:00:00.000Z",
    expected: {
      predictedScore: 46,
      readingScore: 5,
      readingProgress: 30,
      readingProficiency: 17,
      readingConfidence: "low",
      readingSampleSize: 6,
      topWeakSkill: "reading",
      topWeakScore: 0.83
    }
  }
];

function mergeExampleProfile(overrides) {
  const profile = cloneScoringExampleProfile(BASE_EXAMPLE_PROFILE);
  Object.entries(overrides).forEach(([key, value]) => {
    if (value && typeof value === "object" && !Array.isArray(value) && profile[key]) {
      profile[key] = { ...profile[key], ...value };
    } else {
      profile[key] = value;
    }
  });
  return profile;
}

function buildAttempts(skill, correctnessList, difficulty = "medium", date = "2026-06-10T00:00:00.000Z") {
  return correctnessList.map((correct, index) => ({
    id: `${skill}-${difficulty}-${index}`,
    date,
    skill,
    correct,
    difficulty,
    topic: "Control example"
  }));
}

function cloneScoringExampleProfile(profile) {
  return JSON.parse(JSON.stringify(profile));
}

function runScoringControlExamples() {
  return SCORING_CONTROL_EXAMPLES.map(example => {
    const profile = cloneScoringExampleProfile(example.profile);
    if (example.now) {
      const originalDate = Date;
      const fixedNow = new originalDate(example.now);
      Date = class extends originalDate {
        constructor(...args) {
          return args.length ? new originalDate(...args) : new originalDate(fixedNow);
        }
        static now() {
          return fixedNow.getTime();
        }
      };
      refreshScoringMetrics(profile);
      Date = originalDate;
    } else {
      refreshScoringMetrics(profile);
    }

    const weakness = calcWeaknessScores(profile)[0];
    const readingConfidence = profile.confidence.bySkill.reading;
    return {
      name: example.name,
      actual: {
        predictedScore: calcPredictedScore(profile),
        readingScore: profile.scores.reading,
        readingProgress: profile.progress.reading,
        readingProficiency: profile.proficiency.reading,
        readingConfidence: readingConfidence.level,
        readingSampleSize: readingConfidence.sampleSize,
        topWeakSkill: weakness.skill,
        topWeakScore: round(weakness.score, 2)
      },
      expected: example.expected
    };
  });
}
