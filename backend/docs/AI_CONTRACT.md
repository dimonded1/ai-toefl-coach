# Backend AI / API Contract

Provider-neutral AI endpoint. Default provider: Groq (OpenAI-compatible).

## Endpoint

```
POST /api/ai/analyze        # primary
POST /api/gemini/analyze    # deprecated alias (same handler)
```

Headers: `Content-Type: application/json`. Rate limited per IP (default 20 req / 60s).

### Request body

```jsonc
{
  "action": "study_plan | score_gap | feedback | recommendations",
  "userProfile": {
    "targetScore": 95,            // required, 0–120
    "currentPrediction": 72,      // number
    "preparationDays": 60,
    "mistakes":   { "reading": 2, "listening": 4, ... },
    "totalTasks": { "reading": 10, ... },
    "scores":     { "reading": 18, "listening": 15, ... }
  },
  "studyReference": { /* optional reference DB summary */ },
  "extraContext":   { /* required for "feedback" */
    "skill": "Speaking",
    "userAnswer": "…",            // required, 1–5000 chars
    "taskType": "Independent"
  }
}
```

### Success response — `200`

Every response carries the raw model text (`result`, backward-compatible) **and**
a backend-validated structured object (`data`). New clients should use `data`.

```jsonc
{
  "result": "{…raw model JSON…}",
  "data":   { /* normalized, validated — shape depends on action (below) */ },
  "meta":   { "action": "study_plan" }
}
```

### Error response — `4xx` / `5xx`

```jsonc
{ "error": "Human-readable message.", "code": "ERROR_CODE", "details": { /* optional */ } }
```

| code                      | status | when                                            |
|---------------------------|--------|-------------------------------------------------|
| `VALIDATION_ERROR`        | 400    | bad/missing input (`details.fields` pinpoints)  |
| `UNKNOWN_ACTION`          | 400    | unsupported `action`                            |
| `RATE_LIMITED`            | 429    | per-IP limit exceeded (also from upstream 429)  |
| `PROVIDER_NOT_CONFIGURED` | 503    | no API key configured                           |
| `UPSTREAM_TIMEOUT`        | 504    | provider exceeded `AI_TIMEOUT_MS`               |
| `UPSTREAM_ERROR`          | 502    | provider/transport failure                      |
| `INVALID_AI_RESPONSE`     | 502    | model output failed backend validation          |
| `INTERNAL`                | 500    | unexpected                                      |

Upstream provider error bodies are logged server-side only and never forwarded.

## `data` shapes per action

**study_plan**
```jsonc
{ "summary": "…", "motivation": "…",
  "tasks": [ { "skill": "reading", "title": "…", "reason": "…", "minutes": 10, "type": "drill" } ] }
```

**score_gap**
```jsonc
{ "overall": "…", "weakestSkill": "listening",
  "breakdown": [ { "skill": "reading", "current": 18, "target": 24, "gap": 6, "action": "…" } ],
  "topActions": [ "…", "…", "…" ] }
```

**feedback**
```jsonc
{ "good": "…", "improve": "…", "score": "Weak|Developing|Proficient|Strong", "idealAnswer": "…" }
```

**recommendations** (dashboard "recommended focus" widget)
```jsonc
{ "headline": "…",
  "recommendations": [ { "skill": "speaking", "title": "…", "reason": "…", "priority": "high|medium|low", "minutes": 10 } ] }
```

Every `tasks[]` / `recommendations[]` entry is guaranteed to include a non-null
`reason`, so the dashboard can render *why* each item was suggested.

## Health / readiness

```
GET /health   → 200 { "status": "ok", "service": "…" }          # liveness, no config details
GET /ready    → 200 { "status": "ready",   "aiProvider": true }  # provider configured
              → 503 { "status": "degraded", "aiProvider": false } # not configured
```
