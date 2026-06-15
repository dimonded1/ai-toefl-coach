require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const fs = require("fs");
const path = require("path");
const db = require("./db");

const DEFAULT_REMOTE_API_BASE = "https://ai-toefl-backend.onrender.com/api";
const REMOTE_API_BASE = (process.env.REMOTE_API_BASE || DEFAULT_REMOTE_API_BASE).replace(/\/$/, "");
const SYNC_TOKEN = process.env.REMOTE_SYNC_TOKEN || process.env.ADMIN_SYNC_TOKEN || process.env.ADMIN_TOKEN;

if (!SYNC_TOKEN) {
  console.error("Missing sync token. Add REMOTE_SYNC_TOKEN=... to backend/.env");
  process.exit(1);
}

main().catch(error => {
  console.error("Remote DB sync failed:", error.message);
  process.exit(1);
});

async function main() {
  const snapshot = await fetchRemoteSnapshot();
  validateSnapshot(snapshot);
  backupLocalDatabase();
  importSnapshot(snapshot);

  console.log("Remote DB synced into backend/database/app.sqlite");
  console.log(`Users: ${snapshot.counts.users}`);
  console.log(`Profiles: ${snapshot.counts.profiles}`);
  console.log(`AI plans: ${snapshot.counts.aiPlans}`);
}

async function fetchRemoteSnapshot() {
  const response = await fetch(`${REMOTE_API_BASE}/admin/snapshot`, {
    headers: { "X-Admin-Token": SYNC_TOKEN }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Snapshot request failed (${response.status})`);
  }
  return data;
}

function validateSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== "object" || !snapshot.tables) {
    throw new Error("Remote snapshot has an invalid format");
  }

  for (const table of ["users", "profiles", "aiPlans"]) {
    if (!Array.isArray(snapshot.tables[table])) {
      throw new Error(`Remote snapshot is missing ${table}`);
    }
  }
}

function backupLocalDatabase() {
  const dbPath = process.env.DATABASE_PATH || path.join(__dirname, "app.sqlite");
  if (!fs.existsSync(dbPath)) return;

  const stamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14);
  const backupPath = `${dbPath}.backup-before-remote-sync-${stamp}`;
  fs.copyFileSync(dbPath, backupPath);
  console.log(`Backup created: ${backupPath}`);
}

function importSnapshot(snapshot) {
  const { users, profiles, aiPlans } = snapshot.tables;

  db.transaction(() => {
    db.prepare("DELETE FROM ai_plans").run();
    db.prepare("DELETE FROM profiles").run();
    db.prepare("DELETE FROM users").run();

    insertRows("users", users);
    insertRows("profiles", profiles);
    insertRows("ai_plans", aiPlans);
  })();
}

function insertRows(table, rows) {
  if (!rows.length) return;

  const columns = Object.keys(rows[0]);
  const columnSql = columns.map(column => quoteIdentifier(column)).join(", ");
  const valueSql = columns.map(column => `@${column}`).join(", ");
  const statement = db.prepare(`INSERT INTO ${quoteIdentifier(table)} (${columnSql}) VALUES (${valueSql})`);

  for (const row of rows) {
    statement.run(row);
  }
}

function quoteIdentifier(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
}
