// ─────────────────────────────────────────────────────────────────────────────
//  AI routes (provider-neutral). Thin HTTP layer:
//    validate input → call aiService → shape response → delegate errors.
//  No prompt building, no provider/transport logic here.
//
//  POST /analyze
//    Body: { action, userProfile, studyReference?, extraContext? }
//    200:  { result: string, data: object, meta: { action } }
//    4xx/5xx: { error: string, code: string, details? }
// ─────────────────────────────────────────────────────────────────────────────
const express = require("express");
const router = express.Router();

const { validateAnalyzeRequest } = require("../validators/analyze");
const { runAnalysis } = require("../services/aiService");

router.post("/analyze", async (req, res, next) => {
  try {
    const request = validateAnalyzeRequest(req.body);
    const { result, data } = await runAnalysis(request);
    res.json({ result, data, meta: { action: request.action } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
