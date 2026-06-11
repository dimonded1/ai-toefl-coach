# AI TOEFL Coach — Backend

Express proxy for the AI study-plan / score-gap / feedback / recommendations calls.

---

## 🔑 Where to put the API key  (read this first)

The backend needs **one** secret: the AI provider key. Put it here:

```
backend/.env   →   GROQ_API_KEY=your_real_key_here
```

Steps:

```bash
cd backend
cp .env.example .env          # create your local env file
# then open backend/.env and replace the placeholder:
#   GROQ_API_KEY=your_groq_api_key_here   ->   GROQ_API_KEY=gsk_...your real key...
```

- Get a key at: https://console.groq.com/keys
- `backend/.env` is **gitignored** — never commit the real key.
- That single value is all that's required. The server reads it via
  [`config/env.js`](config/env.js); Docker injects it through `env_file: ./backend/.env`
  in `docker-compose.yml`.
- No code changes are needed to "turn on" AI — once the key is present,
  `GET /ready` returns `{ "aiProvider": true }` and `POST /api/ai/analyze` works.

Optional overrides (also in `backend/.env`, defaults shown):

```
GROQ_MODEL=llama-3.1-8b-instant
AI_TIMEOUT_MS=20000
RATE_LIMIT_MAX=20
```

---

## Run

```bash
cd backend
npm install
npm run dev      # nodemon hot-reload  (or: npm start)
```

Server listens on `http://localhost:3001`.

## Check it's up

```bash
curl http://localhost:3001/health   # { "status": "ok" } — process is alive
curl http://localhost:3001/ready    # { "aiProvider": true } once the key is set
```

## API

See [`docs/AI_CONTRACT.md`](docs/AI_CONTRACT.md) for the full request/response
contract, actions, and error codes.
