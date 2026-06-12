# 🎓 AI TOEFL Coach

An interactive TOEFL iBT preparation web app with a personalized AI study plan powered by Groq.

## Features
- 📊 Dashboard with predicted TOEFL score
- 🎯 Goal setup (target score, prep time, level)
- 📚 Vocabulary, Reading, Listening, Speaking, Writing practice
- ⚡ Mini TOEFL Test (10 randomized questions)
- 🤖 AI Score Gap Analyzer + structured Study Plan
- 🗓️ Study Calendar with exam countdown and 8-week roadmap
- 🧠 Mistake Bank, XP, streaks, achievements, and weekly progress
- 📈 Results & Analytics
- 💾 Progress saved in localStorage

---

## Quick Start (Docker)

### 1. Get a Groq API key
Go to https://console.groq.com/keys → Create API key

### 2. Add your API key
Create `backend/.env` from the example:
```bash
cp backend/.env.example backend/.env
```

Then edit `backend/.env`:
```
GROQ_API_KEY=your_actual_key_here
GROQ_MODEL=llama-3.1-8b-instant
PORT=3001
```

### 3. Run with Docker
```bash
docker-compose up --build
```

### 4. Open in browser
```
http://localhost:8080
```

---

## Local Dev (without Docker)

**Backend:**
```bash
cd backend
npm install
npm run dev   # nodemon for hot-reload
```

**Frontend:**
Open `frontend/index.html` directly in a browser.
> For AI API calls, run the backend on `localhost:3001`. The frontend uses the nginx `/api/` proxy in Docker, and calls `localhost:3001/api/ai` directly when opened via `file://` or `localhost:3000`.
```bash
cd frontend
npx serve .
# then open http://localhost:3000
```

---

## Project Structure
```
ai-toefl-coach/
├── backend/
│   ├── server.js          # Express app
│   ├── routes/ai.js       # Groq-backed AI API proxy
│   ├── routes/gemini.js   # Legacy API alias
│   ├── package-lock.json
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── index.html
│   ├── src/
│   │   ├── styles/
│   │   │   └── main.css   # Dashboard theme and responsive layout
│   │   └── scripts/
│   │       ├── data.js    # TOEFL reference DB + question bank
│   │       ├── scoring.js # TOEFL scoring, confidence, readiness
│   │       ├── analyticsModel.js # Analytics data model
│   │       ├── profile.js # User profile + localStorage
│   │       ├── aiPlan.js  # AI API calls + gap visualizer
│   │       ├── calendar.js # Study calendar + roadmap
│   │       ├── app.js     # Main app logic + UI
│   │       └── scoring.examples.js # Scoring control examples
│   ├── nginx.conf
│   ├── .dockerignore
│   └── Dockerfile
├── scripts/
│   └── check-scoring.mjs
├── docker-compose.yml
├── .gitignore
└── .env.example
```

---

## Checks
```bash
node scripts/check-scoring.mjs
```

This verifies the scoring edge cases for zero tasks, small samples, all-correct/all-wrong answers, difficulty weighting, and recency weighting.

---

## Tech Stack
- **Frontend:** HTML5, CSS3, Vanilla JS, localStorage
- **Backend:** Node.js, Express
- **AI:** Groq chat completions API
- **Deploy:** Docker + nginx
