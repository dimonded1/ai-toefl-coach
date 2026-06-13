const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");
const initDb = require("./initDb");

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, "app.sqlite");
const dbDir = path.dirname(dbPath);

fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(dbPath);

initDb(db);

module.exports = db;
