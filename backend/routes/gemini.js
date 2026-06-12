// Backward-compatible alias. The app now uses /api/ai, but older local notes
// and cached frontends may still call /api/gemini.
module.exports = require("./ai");
