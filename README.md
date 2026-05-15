# CF Analyzer

CF Analyzer is a full-stack project that turns a public Codeforces profile into an actionable training dashboard. It fetches public user data, computes structured competitive-programming stats, and uses Claude to generate a personalized 30-day study plan.

## Features

- Codeforces handle lookup with cached analysis results
- Distinct-problem AC% by tag, weakest tags, and strongest tags
- Contest rating progression and last-5 delta trend
- 365-day submission heatmap
- WA-heavy pattern summary
- Claude-generated study plan with deterministic fallback when AI is unavailable

## Architecture

- `server/`: Express API, Codeforces fetchers, analytics pipeline, MongoDB cache, Claude integration
- `client/`: React + Vite dashboard, Tailwind styling, Recharts visualizations
- `MongoDB`: 6-hour TTL cache keyed by lowercase Codeforces handle

## Tech Stack

- Backend: Node.js, Express.js, Mongoose, MongoDB
- Frontend: React, Vite, Tailwind CSS, Recharts
- AI: Anthropic Claude API (`claude-sonnet-4-20250514`)
- Deployment: Render for the API, Vercel for the frontend

## Local Setup

### 1. Clone and install

```bash
cd server
npm install

cd ../client
npm install
```

### 2. Configure environment variables

Server `.env`:

```bash
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/cf-analyzer
ANTHROPIC_API_KEY=your_anthropic_key
ANTHROPIC_MODEL=claude-sonnet-4-20250514
CLIENT_ORIGIN=http://localhost:5173
CACHE_TTL_HOURS=6
```

Client `.env`:

```bash
VITE_API_BASE_URL=http://localhost:5000
```

### 3. Run the apps

```bash
cd server
npm run dev

cd ../client
npm run dev
```

## API Contract

### `GET /api/health`

```json
{
  "status": "ok",
  "uptime": 123.45,
  "timestamp": "2026-05-12T12:00:00.000Z"
}
```

### `GET /api/analyze/:handle?refresh=true|false`

```json
{
  "success": true,
  "cached": false,
  "generatedAt": "2026-05-12T12:00:00.000Z",
  "meta": {
    "fallbackUsed": false,
    "reason": null
  },
  "profile": {},
  "stats": {},
  "studyPlan": {}
}
```

## Caching Strategy

- Each handle is cached by lowercase name in MongoDB.
- `generatedAt` is written when analysis completes.
- `expiresAt` is set to `generatedAt + 6 hours`.
- A TTL index removes expired entries automatically.
- `refresh=true` bypasses cache and recomputes the full analysis.

## Testing

Backend:

```bash
cd server
npm test
```

Frontend:

```bash
cd client
npm test
```

## Deployment

### Render

- Root directory: `server`
- Build command: `npm install`
- Start command: `npm start`
- Set env vars from `server/.env.example`

### Vercel

- Root directory: `client`
- Build command: `npm run build`
- Output directory: `dist`
- Set `VITE_API_BASE_URL` to the Render backend URL

## Future Improvements

- Add contest recommendations based on rating band
- Support compare mode for two handles
- Add saved history snapshots for progress over time
- Add auth and per-user bookmarks for favorite study plans
