const path = require("path");
const Database = require("better-sqlite3");
const initDb = require("./initDb");

const dbPath = path.join(__dirname, "app.sqlite");
const db = new Database(dbPath);

initDb(db);

module.exports = db;
