# 🎓 AI TOEFL Coach

An interactive TOEFL iBT preparation web app with a personalized AI study plan powered by Google Gemini.

## Features
- 📊 Dashboard with predicted TOEFL score
- 🎯 Goal setup (target score, prep time, level)
- 📚 Vocabulary, Reading, Listening, Speaking, Writing practice
- ⚡ Mini TOEFL Test (10 questions)
- 🤖 AI Score Gap Analyzer + Study Plan (via Gemini API)
- 📈 Results & Analytics
- 💾 Progress saved in localStorage

---

## Quick Start (Docker)

### 1. Get a free Gemini API key
Go to https://aistudio.google.com/app/apikey → Create API key (free tier)

### 2. Add your API key
Edit `backend/.env`:
```
GEMINI_API_KEY=your_actual_key_here
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
> ⚠️ Gemini API calls will fail from direct file open (CORS). Use a local server:
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
│   ├── routes/gemini.js   # Gemini API proxy
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── index.html
│   ├── css/style.css
│   ├── js/
│   │   ├── data.js        # Question bank
│   │   ├── profile.js     # User profile + scoring logic
│   │   ├── aiPlan.js      # Gemini API calls + gap visualizer
│   │   └── app.js         # Main app logic + UI
│   ├── nginx.conf
│   └── Dockerfile
├── docker-compose.yml
├── .gitignore
└── .env.example
```

---

## Tech Stack
- **Frontend:** HTML5, CSS3, Vanilla JS, localStorage
- **Backend:** Node.js, Express
- **AI:** Google Gemini 2.0 Flash Lite (free tier)
- **Deploy:** Docker + nginx
