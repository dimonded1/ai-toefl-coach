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
- 💾 Progress saved locally and synced to the account backend after sign-in

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
JWT_SECRET=replace_with_a_long_random_secret
GROQ_API_KEY=your_actual_key_here
GROQ_MODEL=llama-3.1-8b-instant
FRONTEND_ORIGINS=http://localhost:8080
DATABASE_PATH=/app/database/app.sqlite
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

## Server Deploy Notes

The app is deployed as two services:
- `backend`: Node/Express API with auth, profile sync, SQLite, and Groq calls.
- `frontend`: nginx static app that proxies `/api/` to the backend.

Backend environment variables:
```
NODE_ENV=production
PORT=3001
JWT_SECRET=replace_with_a_long_random_secret
ADMIN_SYNC_TOKEN=replace_with_a_long_random_sync_token
GROQ_API_KEY=your_actual_key_here
GROQ_MODEL=llama-3.1-8b-instant
AI_TIMEOUT_MS=15000
RATE_LIMIT_MAX_REQUESTS=20
FRONTEND_ORIGINS=https://ai-toefl-coach.onrender.com
DATABASE_PATH=/app/database/app.sqlite
```

Frontend environment variables:
```
PORT=80
BACKEND_ORIGIN=https://ai-toefl-backend.onrender.com
BACKEND_HOST=ai-toefl-backend.onrender.com
```

For Render, set these in each service's Environment panel. Do not commit real secrets.

### Pull deployed SQLite data into local DBeaver

The deployed backend writes to its own SQLite file on Render. To view those deployed users in DBeaver, sync the remote snapshot into the local SQLite file first.

1. Set the same secret value in Render backend and local `backend/.env`:
```bash
ADMIN_SYNC_TOKEN=your_long_secret_token
REMOTE_SYNC_TOKEN=your_long_secret_token
REMOTE_API_BASE=https://ai-toefl-backend.onrender.com/api
```

2. Pull the deployed tables into `backend/database/app.sqlite`:
```bash
cd backend
npm run sync:remote
```

3. In DBeaver, refresh the local SQLite connection/table view.

The sync command creates a local backup before replacing `users`, `profiles`, and `ai_plans`.

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
│   ├── routes/auth.js     # Registration/login API
│   ├── routes/profile.js  # Account profile sync API
│   ├── database/          # SQLite init and connection
│   ├── middleware/        # JWT auth middleware
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
│   ├── nginx.conf         # nginx template with BACKEND_ORIGIN/BACKEND_HOST
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
- **Backend:** Node.js, Express, SQLite, JWT auth
- **AI:** Groq chat completions API
- **Deploy:** Docker + nginx
