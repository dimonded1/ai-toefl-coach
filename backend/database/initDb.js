function initDb(db) {
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      name TEXT,
      exam TEXT,
      target_score INTEGER,
      preparation_days INTEGER,
      level TEXT,
      goal TEXT,
      start_date TEXT,
      scores_json TEXT,
      baseline_scores_json TEXT,
      mistakes_json TEXT,
      total_tasks_json TEXT,
      correct_json TEXT,
      progress_json TEXT,
      proficiency_json TEXT,
      confidence_json TEXT,
      readiness_json TEXT,
      weak_zones_json TEXT,
      attempts_json TEXT,
      mini_test_history_json TEXT,
      xp INTEGER DEFAULT 0,
      streak_json TEXT,
      activity_log_json TEXT,
      mistake_bank_json TEXT,
      achievements_json TEXT,
      last_ai_plan_json TEXT,
      learning_progress_json TEXT,
      vocabulary_progress_json TEXT,
      notes_json TEXT,
      last_ai_plan_date TEXT,
      scoring_model_version TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS ai_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      plan_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
  `);

  ensureColumn(db, "profiles", "learning_progress_json", "TEXT");
  ensureColumn(db, "profiles", "vocabulary_progress_json", "TEXT");
  ensureColumn(db, "profiles", "notes_json", "TEXT");
}

function ensureColumn(db, table, column, type) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all();
  const exists = columns.some(item => item.name === column);
  if (!exists) {
    db.prepare(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`).run();
  }
}

module.exports = initDb;
