require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRouter = require("./routes/auth");
const geminiRouter = require("./routes/gemini");
const profileRouter = require("./routes/profile");
require("./database/db");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    "http://localhost:8080",
    "http://localhost:3000",
    "http://127.0.0.1:8080",
    "http://127.0.0.1:3000",
    "null"
  ],
  methods: ["GET", "POST", "PUT"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json({ limit: "1mb" }));

// Routes
app.use("/api/auth", authRouter);
app.use("/api/gemini", geminiRouter);
app.use("/api/profile", profileRouter);

// Health check
app.get("/health", (req, res) => {
  res.json({
    ok: true,
    status: "ok",
    service: "AI TOEFL Coach Backend",
    groqConfigured: !!process.env.GROQ_API_KEY,
    database: "sqlite"
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
  console.log(`   Groq API: ${process.env.GROQ_API_KEY ? "configured ✅" : "⚠️  NOT configured — add GROQ_API_KEY to .env"}`);
});
