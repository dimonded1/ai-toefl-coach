const bcrypt = require("bcryptjs");
const db = require("./db");
const { saveProfileForUser } = require("../routes/profile");

const PASSWORD = "demo1234";
const PASSWORD_HASH = bcrypt.hashSync(PASSWORD, 10);
const TODAY = "2026-06-14";
const SKILLS = ["reading", "listening", "speaking", "writing", "vocabulary"];

const USERS = [
  {
    name: "Кирилл",
    email: "kirill.smirnov2025@mail.ru",
    createdAt: "2026-06-04T09:15:00.000Z",
    targetScore: 98,
    preparationDays: 60,
    level: "intermediate",
    goal: "study abroad",
    startDate: "2026-06-04",
    xp: 410,
    scores: [22, 21, 19, 20, 0],
    baselineScores: [16, 15, 14, 14, 0],
    totalTasks: [12, 12, 10, 10, 12],
    correct: [9, 8, 5, 6, 9],
    weakSkills: ["speaking", "writing"]
  },
  {
    name: "Елена",
    email: "elena.koval2026@yandex.ru",
    createdAt: "2026-06-05T13:20:00.000Z",
    targetScore: 90,
    preparationDays: 70,
    level: "pre-intermediate",
    goal: "exchange program",
    startDate: "2026-06-05",
    xp: 260,
    scores: [18, 17, 16, 17, 0],
    baselineScores: [14, 13, 13, 12, 0],
    totalTasks: [9, 8, 7, 8, 10],
    correct: [6, 5, 3, 5, 7],
    weakSkills: ["listening", "speaking"]
  },
  {
    name: "Гоша",
    email: "gosha.makarkin2016@yandex.ru",
    createdAt: "2026-06-06T10:30:00.000Z",
    targetScore: 95,
    preparationDays: 60,
    level: "intermediate",
    goal: "study abroad",
    startDate: "2026-06-06",
    xp: 390,
    scores: [21, 20, 18, 19, 0],
    baselineScores: [15, 14, 14, 13, 0],
    totalTasks: [12, 11, 8, 9, 12],
    correct: [8, 7, 5, 6, 9],
    weakSkills: ["speaking", "listening"]
  },
  {
    name: "Дмитрий",
    email: "dima@bk.ru",
    createdAt: "2026-06-07T12:00:00.000Z",
    targetScore: 80,
    preparationDays: 45,
    level: "intermediate",
    goal: "work",
    startDate: "2026-06-07",
    xp: 240,
    scores: [19, 18, 17, 18, 0],
    baselineScores: [15, 14, 13, 13, 0],
    totalTasks: [8, 9, 7, 7, 9],
    correct: [5, 5, 4, 4, 6],
    weakSkills: ["listening", "writing"]
  },
  {
    name: "Настя",
    email: "nastya.ivanova2025@yandex.ru",
    createdAt: "2026-06-08T09:12:00.000Z",
    targetScore: 105,
    preparationDays: 45,
    level: "upper-intermediate",
    goal: "study abroad",
    startDate: "2026-06-08",
    xp: 620,
    scores: [25, 24, 22, 23, 0],
    baselineScores: [20, 19, 18, 18, 0],
    totalTasks: [18, 16, 12, 11, 20],
    correct: [14, 12, 8, 8, 16],
    weakSkills: ["speaking", "writing"]
  },
  {
    name: "Олег",
    email: "boss.oleg2026@bk.ru",
    createdAt: "2026-06-08T11:05:00.000Z",
    targetScore: 95,
    preparationDays: 60,
    level: "intermediate",
    goal: "work",
    startDate: "2026-06-08",
    xp: 340,
    scores: [20, 21, 18, 19, 0],
    baselineScores: [17, 17, 16, 16, 0],
    totalTasks: [12, 14, 8, 9, 15],
    correct: [8, 10, 5, 6, 11],
    weakSkills: ["speaking", "reading"]
  },
  {
    name: "Андрей",
    email: "andrey.petrov25@mail.ru",
    createdAt: "2026-06-09T15:40:00.000Z",
    targetScore: 88,
    preparationDays: 75,
    level: "pre-intermediate",
    goal: "university admission",
    startDate: "2026-06-09",
    xp: 190,
    scores: [17, 16, 15, 15, 0],
    baselineScores: [14, 13, 13, 12, 0],
    totalTasks: [9, 8, 6, 6, 10],
    correct: [5, 4, 3, 3, 6],
    weakSkills: ["listening", "writing"]
  },
  {
    name: "Мария",
    email: "maria.study2025@gmail.com",
    createdAt: "2026-06-10T08:25:00.000Z",
    targetScore: 112,
    preparationDays: 35,
    level: "advanced",
    goal: "scholarship",
    startDate: "2026-06-10",
    xp: 910,
    scores: [28, 27, 25, 26, 0],
    baselineScores: [24, 23, 22, 22, 0],
    totalTasks: [24, 22, 18, 17, 25],
    correct: [21, 19, 14, 14, 22],
    weakSkills: ["speaking", "writing"]
  },
  {
    name: "Дима",
    email: "dima.english2026@yandex.ru",
    createdAt: "2026-06-11T13:15:00.000Z",
    targetScore: 100,
    preparationDays: 50,
    level: "intermediate",
    goal: "study abroad",
    startDate: "2026-06-11",
    xp: 455,
    scores: [23, 20, 20, 21, 0],
    baselineScores: [18, 17, 17, 18, 0],
    totalTasks: [15, 13, 10, 12, 18],
    correct: [11, 8, 7, 8, 13],
    weakSkills: ["listening", "speaking"]
  },
  {
    name: "Соня",
    email: "sonya.leto.2025@yandex.ru",
    createdAt: "2026-06-12T10:10:00.000Z",
    targetScore: 92,
    preparationDays: 80,
    level: "intermediate",
    goal: "exchange program",
    startDate: "2026-06-12",
    xp: 275,
    scores: [19, 20, 17, 18, 0],
    baselineScores: [16, 16, 15, 15, 0],
    totalTasks: [11, 12, 7, 8, 14],
    correct: [7, 8, 4, 5, 9],
    weakSkills: ["speaking", "writing"]
  },
  {
    name: "Георгий",
    email: "georgiy.makarov2026@bk.ru",
    createdAt: "2026-06-13T17:30:00.000Z",
    targetScore: 108,
    preparationDays: 40,
    level: "upper-intermediate",
    goal: "master program",
    startDate: "2026-06-13",
    xp: 735,
    scores: [26, 23, 24, 24, 0],
    baselineScores: [21, 19, 20, 19, 0],
    totalTasks: [20, 17, 16, 15, 21],
    correct: [16, 12, 12, 11, 17],
    weakSkills: ["listening", "writing"]
  }
];

const upsertUser = db.prepare(`
  INSERT INTO users (name, email, password_hash, created_at, plan, subscription_status)
  VALUES (@name, @email, @passwordHash, @createdAt, 'free', 'free')
  ON CONFLICT(email) DO UPDATE SET
    name = excluded.name,
    password_hash = excluded.password_hash,
    plan = 'free',
    subscription_status = 'free'
`);

const findUser = db.prepare("SELECT id FROM users WHERE email = ?");
const deletePlans = db.prepare("DELETE FROM ai_plans WHERE user_id = ?");
const insertPlan = db.prepare("INSERT INTO ai_plans (user_id, plan_json, created_at) VALUES (?, ?, ?)");

function toSkillObject(values) {
  return Object.fromEntries(SKILLS.map((skill, index) => [skill, values[index] || 0]));
}

function buildProfile(user) {
  const totalTasks = toSkillObject(user.totalTasks);
  const correct = toSkillObject(user.correct);
  const mistakes = Object.fromEntries(SKILLS.map(skill => [skill, Math.max(0, totalTasks[skill] - correct[skill])]));
  const proficiency = Object.fromEntries(SKILLS.map(skill => {
    if (!totalTasks[skill]) return [skill, 0];
    return [skill, Math.round((correct[skill] / totalTasks[skill]) * 100)];
  }));
  const progress = Object.fromEntries(SKILLS.map(skill => [skill, Math.min(100, totalTasks[skill] * 4)]));
  const confidenceScore = Math.round(Object.values(proficiency).reduce((sum, value) => sum + value, 0) / SKILLS.length);
  const plan = buildPlan(user);

  return {
    name: user.name,
    exam: "TOEFL iBT",
    targetScore: user.targetScore,
    preparationDays: user.preparationDays,
    level: user.level,
    goal: user.goal,
    startDate: user.startDate,
    scores: toSkillObject(user.scores),
    baselineScores: toSkillObject(user.baselineScores),
    mistakes,
    totalTasks,
    correct,
    progress,
    proficiency,
    confidence: {
      level: confidenceScore >= 75 ? "high" : confidenceScore >= 50 ? "medium" : "low",
      score: confidenceScore,
      bySkill: proficiency
    },
    readiness: {
      level: confidenceScore >= 75 ? "ready" : confidenceScore >= 50 ? "almost-ready" : "needs-practice",
      overall: confidenceScore,
      bySkill: Object.fromEntries(SKILLS.map(skill => [skill, Math.max(0, proficiency[skill] - 8)]))
    },
    weakZones: user.weakSkills.map((skill, index) => ({
      skill,
      label: skill[0].toUpperCase() + skill.slice(1),
      score: Number((0.72 - index * 0.08).toFixed(2)),
      total: totalTasks[skill],
      confidence: proficiency[skill]
    })),
    attempts: buildAttempts(user),
    miniTestHistory: [{
      date: `${user.startDate}T16:00:00.000Z`,
      predictedScore: user.scores.slice(0, 4).reduce((sum, value) => sum + value, 0),
      accuracy: confidenceScore
    }],
    xp: user.xp,
    streak: {
      current: Math.max(1, Math.min(7, Math.round(user.xp / 130))),
      best: Math.max(3, Math.min(12, Math.round(user.xp / 90))),
      lastActiveDate: TODAY
    },
    activityLog: SKILLS.map((skill, index) => ({
      date: `${user.startDate}T${String(10 + index).padStart(2, "0")}:05:00.000Z`,
      skill,
      xp: 12,
      type: "practice"
    })),
    mistakeBank: user.weakSkills.map((skill, index) => ({
      id: `mistake-${user.email}-${skill}`,
      skill,
      prompt: `${skill} TOEFL practice task`,
      answer: index === 0 ? "Needs clearer structure" : "Needs more specific examples",
      correctAnswer: "Use a clear answer, reason, and specific example.",
      count: index + 1,
      lastSeen: `${user.startDate}T14:00:00.000Z`
    })),
    achievements: user.xp > 700 ? ["3-Day Streak", "500 XP", "Practice Leader"] : user.xp > 300 ? ["3-Day Streak"] : [],
    lastAIPlan: plan,
    lastAIPlanDate: `${user.startDate}T18:00:00.000Z`,
    scoringModelVersion: "score-v2.1",
    learningProgress: {
      completedLessons: ["toefl-structure", "reading-main-idea"],
      savedLessons: ["writing-concession"],
      currentLessonId: "reading-main-idea"
    },
    vocabularyProgress: {
      savedWords: ["empirical", "approximate"],
      masteredWords: user.xp > 500 ? ["plausible"] : [],
      missedWords: user.weakSkills.includes("writing") ? ["offset"] : ["profound"],
      reviews: [{
        wordId: "empirical",
        action: "reviewed",
        date: `${user.startDate}T12:00:00.000Z`
      }]
    },
    notes: [{
      id: `note-${user.email}`,
      text: `${user.name}: обычный учебный профиль с прогрессом и слабой зоной.`,
      createdAt: `${user.startDate}T18:30:00.000Z`
    }]
  };
}

function buildPlan(user) {
  const [firstSkill, secondSkill] = user.weakSkills;
  return {
    summary: `${user.name} готовится к TOEFL и фокусируется на ${firstSkill}${secondSkill ? ` и ${secondSkill}` : ""}.`,
    tasks: [
      {
        skill: firstSkill,
        title: `Timed ${firstSkill} practice`,
        reason: "Основная слабая зона профиля",
        minutes: 20,
        type: "timed"
      },
      {
        skill: secondSkill || "vocabulary",
        title: `${secondSkill || "Vocabulary"} review`,
        reason: "Закрепить ошибки из последних заданий",
        minutes: 15,
        type: "review"
      },
      {
        skill: "vocabulary",
        title: "Academic vocabulary review",
        reason: "Лексика помогает во всех секциях",
        minutes: 10,
        type: "drill"
      }
    ],
    motivation: "Регулярная практика помогает уверенно дойти до целевого балла."
  };
}

function buildAttempts(user) {
  return ["reading", "listening", "speaking", "writing"].map((skill, index) => ({
    id: `${user.email}-${skill}-${index + 1}`,
    skill,
    correct: user.correct[index] >= Math.ceil(user.totalTasks[index] / 2),
    difficulty: index >= 2 ? "hard" : "medium",
    topic: `${skill} practice`,
    prompt: `${skill} TOEFL demo task`,
    createdAt: `${user.startDate}T${String(9 + index).padStart(2, "0")}:20:00.000Z`
  }));
}

const seedDemoUsers = db.transaction(() => {
  for (const user of USERS) {
    upsertUser.run({
      name: user.name,
      email: user.email,
      passwordHash: PASSWORD_HASH,
      createdAt: user.createdAt
    });

    const row = findUser.get(user.email);
    const profile = buildProfile(user);
    saveProfileForUser(row.id, profile);

    deletePlans.run(row.id);
    insertPlan.run(row.id, JSON.stringify(profile.lastAIPlan), profile.lastAIPlanDate);
  }
});

seedDemoUsers();

const counts = db.prepare(`
  SELECT 'users' AS table_name, COUNT(*) AS count FROM users
  UNION ALL SELECT 'profiles', COUNT(*) FROM profiles
  UNION ALL SELECT 'ai_plans', COUNT(*) FROM ai_plans
`).all();

console.log(`Demo users seeded. Password for demo accounts: ${PASSWORD}`);
console.table(counts);
