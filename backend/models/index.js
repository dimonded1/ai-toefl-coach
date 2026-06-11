// ─────────────────────────────────────────────────────────────────────────────
//  Storage model — typedefs + repository interface.
//
//  The app persists in the browser today; this module defines the server-side
//  contract (see schema.sql for DDL) so a real DB can be dropped in later by
//  implementing `Repository` without touching routes/services.
//
//  An in-memory implementation is provided as a placeholder for local dev/tests.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} createdAt
 *
 * @typedef {Object} Profile
 * @property {string} userId
 * @property {number} targetScore
 * @property {number} [preparationDays]
 * @property {string} [level]
 * @property {string} [goal]
 * @property {Object} scores            // { reading, listening, speaking, writing }
 * @property {number} xp
 *
 * @typedef {Object} Attempt
 * @property {string} id
 * @property {string} userId
 * @property {"practice"|"mini_test"} kind
 * @property {string} [skill]
 * @property {number} total
 * @property {number} correct
 *
 * @typedef {Object} Answer
 * @property {string} attemptId
 * @property {string} userId
 * @property {string} skill
 * @property {boolean} isCorrect
 * @property {string} [userAnswer]
 *
 * @typedef {Object} MistakeCard
 * @property {string} userId
 * @property {string} skill
 * @property {string} prompt
 * @property {number} count
 * @property {boolean} mastered
 *
 * @typedef {Object} AiFeedbackRecord
 * @property {string} userId
 * @property {"study_plan"|"score_gap"|"feedback"|"recommendations"} action
 * @property {string} model
 * @property {Object} data
 */

/**
 * Repository interface every storage backend must satisfy.
 * @typedef {Object} Repository
 * @property {(email: string) => Promise<User>} createUser
 * @property {(userId: string) => Promise<Profile|null>} getProfile
 * @property {(profile: Profile) => Promise<Profile>} upsertProfile
 * @property {(attempt: Attempt) => Promise<Attempt>} createAttempt
 * @property {(answer: Answer) => Promise<Answer>} recordAnswer
 * @property {(card: MistakeCard) => Promise<MistakeCard>} upsertMistake
 * @property {(record: AiFeedbackRecord) => Promise<AiFeedbackRecord>} saveAiFeedback
 */

const { randomUUID } = require("crypto");

/**
 * Minimal in-memory Repository for local dev/tests. Not for production.
 * @returns {Repository}
 */
function createInMemoryRepository() {
  const users = new Map();
  const profiles = new Map();
  const attempts = new Map();
  const answers = [];
  const mistakes = new Map();       // key: `${userId}|${skill}|${prompt}`
  const aiFeedback = [];

  return {
    async createUser(email) {
      const user = { id: randomUUID(), email, createdAt: new Date().toISOString() };
      users.set(user.id, user);
      return user;
    },
    async getProfile(userId) {
      return profiles.get(userId) || null;
    },
    async upsertProfile(profile) {
      profiles.set(profile.userId, profile);
      return profile;
    },
    async createAttempt(attempt) {
      const row = { id: randomUUID(), total: 0, correct: 0, ...attempt };
      attempts.set(row.id, row);
      return row;
    },
    async recordAnswer(answer) {
      answers.push(answer);
      return answer;
    },
    async upsertMistake(card) {
      const key = `${card.userId}|${card.skill}|${card.prompt}`;
      const existing = mistakes.get(key);
      const row = existing
        ? { ...existing, count: existing.count + 1, mastered: card.mastered ?? existing.mastered }
        : { count: 1, mastered: false, ...card };
      mistakes.set(key, row);
      return row;
    },
    async saveAiFeedback(record) {
      const row = { id: randomUUID(), createdAt: new Date().toISOString(), ...record };
      aiFeedback.push(row);
      return row;
    }
  };
}

module.exports = { createInMemoryRepository };
