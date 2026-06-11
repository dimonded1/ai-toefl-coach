-- ═══════════════════════════════════════════════════════════════════════════
--  AI TOEFL Coach — backend storage schema (PostgreSQL flavor)
--
--  The app currently persists progress in the browser (localStorage). This
--  schema is the planned server-side model so progress can move to a real DB
--  without reshaping the data later. Mirrors the frontend profile structure.
--
--  Apply with:  psql "$DATABASE_URL" -f models/schema.sql
-- ═══════════════════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- gen_random_uuid()

-- ── users ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT UNIQUE NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── profiles ─────────────────────────────────────────────────────────────────
-- One learning profile per user (goal + denormalized scoring snapshot).
CREATE TABLE IF NOT EXISTS profiles (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  target_score       SMALLINT NOT NULL CHECK (target_score BETWEEN 0 AND 120),
  preparation_days   SMALLINT,
  level              TEXT,             -- beginner | intermediate | advanced
  goal               TEXT,
  start_date         TIMESTAMPTZ,
  scores             JSONB NOT NULL DEFAULT '{}'::jsonb,  -- { reading, listening, speaking, writing }
  xp                 INTEGER NOT NULL DEFAULT 0,
  streak_current     INTEGER NOT NULL DEFAULT 0,
  streak_best        INTEGER NOT NULL DEFAULT 0,
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── attempts ─────────────────────────────────────────────────────────────────
-- A practice session or mini-test run (groups individual answers).
CREATE TABLE IF NOT EXISTS attempts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind         TEXT NOT NULL,          -- practice | mini_test
  skill        TEXT,                   -- null for mixed mini-test
  total        SMALLINT NOT NULL DEFAULT 0,
  correct      SMALLINT NOT NULL DEFAULT 0,
  started_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at  TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_attempts_user ON attempts(user_id, started_at DESC);

-- ── answers ──────────────────────────────────────────────────────────────────
-- One row per answered question within an attempt.
CREATE TABLE IF NOT EXISTS answers (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id     UUID NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill          TEXT NOT NULL,        -- reading | listening | speaking | writing | vocabulary
  question_ref   TEXT,                 -- stable id/topic of the source question
  is_correct     BOOLEAN NOT NULL,
  user_answer    TEXT,
  correct_answer TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_answers_user_skill ON answers(user_id, skill);

-- ── mistake_bank ─────────────────────────────────────────────────────────────
-- Deduplicated review cards for missed questions; `count` increments on repeats.
CREATE TABLE IF NOT EXISTS mistake_bank (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill          TEXT NOT NULL,
  topic          TEXT,
  prompt         TEXT NOT NULL,
  correct_answer TEXT,
  count          INTEGER NOT NULL DEFAULT 1,
  mastered       BOOLEAN NOT NULL DEFAULT FALSE,
  last_seen_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, skill, prompt)
);
CREATE INDEX IF NOT EXISTS idx_mistake_bank_user ON mistake_bank(user_id, mastered);

-- ── ai_feedback ──────────────────────────────────────────────────────────────
-- Stored, validated AI outputs (study_plan / score_gap / feedback / recommendations).
CREATE TABLE IF NOT EXISTS ai_feedback (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  attempt_id  UUID REFERENCES attempts(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,           -- study_plan | score_gap | feedback | recommendations
  model       TEXT NOT NULL,           -- provider model id used
  data        JSONB NOT NULL,          -- the validated structured payload
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_user ON ai_feedback(user_id, action, created_at DESC);
