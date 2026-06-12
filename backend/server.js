require("dotenv").config();
const express = require("express");
const cors = require("cors");
const aiRouter = require("./routes/ai");
const legacyGeminiRouter = require("./routes/gemini");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.disable("x-powered-by");
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Frame-Options", "DENY");
  next();
});
app.use(cors({
  origin: [
    "http://localhost:8080",
    "http://localhost:3000",
    "http://127.0.0.1:8080",
    "http://127.0.0.1:3000"
  ],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json({ limit: "10kb" }));

// Routes
app.use("/api/ai", aiRouter);
app.use("/api/gemini", legacyGeminiRouter);

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "AI TOEFL Coach Backend"
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("[ERROR]", err.message);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`✅ AI TOEFL Coach backend running on port ${PORT}`);
  console.log(`   Groq API: ${process.env.GROQ_API_KEY ? "configured" : "not configured — add GROQ_API_KEY to .env"}`);
});
