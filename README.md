# CF Analyzer

<p align="center">
  AI-powered Codeforces submission analysis with tag weakness breakdowns, rating trends, activity heatmaps, and a personalized 30-day study plan.
</p>

<p align="center">
  <a href="https://cf-analyzer-xhmn.vercel.app"><img src="https://img.shields.io/badge/Live%20Frontend-Vercel-111111?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Frontend"></a>
  <a href="https://cf-analyzer-v8l1.onrender.com/api/health"><img src="https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render&logoColor=111111" alt="Backend"></a>
  <img src="https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react&logoColor=111111" alt="React Vite">
  <img src="https://img.shields.io/badge/Backend-Node%20%2B%20Express-3C873A?style=for-the-badge&logo=node.js&logoColor=white" alt="Node Express">
  <img src="https://img.shields.io/badge/Database-MongoDB-13AA52?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB">
</p>

## Live Links

- Frontend: [https://cf-analyzer-xhmn.vercel.app](https://cf-analyzer-xhmn.vercel.app)
- Backend: [https://cf-analyzer-v8l1.onrender.com](https://cf-analyzer-v8l1.onrender.com)
- Health Check: [https://cf-analyzer-v8l1.onrender.com/api/health](https://cf-analyzer-v8l1.onrender.com/api/health)

## Overview

CF Analyzer helps competitive programmers turn raw Codeforces history into a practical training plan.

Instead of manually scanning hundreds of submissions, the app fetches a user's public Codeforces profile, contest history, and submissions, computes structured insights, and transforms them into a study dashboard with:

- weak and strong tags
- acceptance rate by tag
- contest rating progression
- submission activity heatmap
- WA-heavy patterns
- a 30-day study plan powered by Claude, with a deterministic fallback if AI is unavailable

## What Problem It Solves

Most Codeforces users know they are "not good at DP" or "inconsistent in contests," but they rarely have a clean way to prove it from data.

CF Analyzer turns that vague feeling into concrete signals:

- which tags are underperforming despite high attempt volume
- whether recent contests show upward or downward rating momentum
- when the user is most active
- whether wrong answers are concentrated around specific topics

## Core Features

- Codeforces handle search with cached analysis results
- Distinct-problem AC% calculation by tag, not submission spam
- Weakest and strongest tag ranking
- Contest rating timeline with recent delta trend
- GitHub-style 365-day activity heatmap
- WA-heavy pattern summary
- Claude-generated 30-day study plan
- Fallback plan generation when the Anthropic API is missing or fails

## How It Works

1. The user enters a Codeforces handle.
2. The backend fetches `user.info`, `user.rating`, and `user.status` from the public Codeforces API.
3. The analyzer computes solved counts, tag performance, heatmap data, rating trends, and failure patterns.
4. Claude receives the structured stats and returns a JSON study plan.
5. The result is cached in MongoDB for 6 hours to reduce repeat API calls and improve response speed.

## Product Preview

- Profile snapshot with rank and rating
- Weakness chart for low-performing tags
- Rating progression chart across contests
- Submission heatmap for the past 365 days
- Day-by-day study plan with Codeforces problemset links

## Tech Stack

| Layer | Tools |
| --- | --- |
| Frontend | React, Vite, Tailwind CSS, Recharts, Axios |
| Backend | Node.js, Express.js, Mongoose, Axios, Morgan |
| Database | MongoDB Atlas |
| AI | Anthropic Claude API (`claude-sonnet-4-20250514`) |
| Deployment | Vercel for frontend, Render for backend |
| Testing | Vitest, Supertest, React Testing Library |

## Architecture

```text
client/
  React dashboard
  Recharts visualizations
  Tailwind UI

server/
  Express API
  Codeforces fetch service
  analytics engine
  Claude prompt + fallback study plan
  MongoDB cache layer
```

## Project Structure

```text
CF-Analyzer/
├─ client/
│  ├─ src/
│  │  ├─ components/
│  │  ├─ pages/
│  │  ├─ services/
│  │  └─ tests/
│  ├─ package.json
│  └─ vite.config.js
├─ server/
│  ├─ config/
│  ├─ models/
│  ├─ routes/
│  ├─ services/
│  ├─ tests/
│  ├─ utils/
│  ├─ index.js
│  └─ package.json
└─ README.md
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

### Response Highlights

- `profile`: handle, rank, avatar, rating, max rating
- `stats.tagStats`: attempt and AC% distribution by tag
- `stats.recentRatingTrend`: last 5 contest deltas
- `stats.heatmap`: 365-day submission intensity data
- `studyPlan.daily_plan`: 30 daily practice items with Codeforces links

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/Ankit-1808/Cf-Analyzer.git
cd Cf-Analyzer
```

### 2. Install dependencies

```bash
cd server
npm install

cd ../client
npm install
```

### 3. Configure environment variables

Create `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/cf-analyzer
ANTHROPIC_API_KEY=your_anthropic_key
ANTHROPIC_MODEL=claude-sonnet-4-20250514
CLIENT_ORIGIN=http://localhost:5173
CACHE_TTL_HOURS=6
```

Create `client/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000
```

### 4. Run the app

Terminal 1:

```bash
cd server
npm run dev
```

Terminal 2:

```bash
cd client
npm run dev
```

Frontend will run on `http://localhost:5173` and backend on `http://localhost:5000`.

## Production Environment Variables

### Render

```env
MONGODB_URI=your_mongodb_atlas_uri
CLIENT_ORIGIN=https://cf-analyzer-xhmn.vercel.app,http://localhost:5173
CACHE_TTL_HOURS=6
ANTHROPIC_MODEL=claude-sonnet-4-20250514
ANTHROPIC_API_KEY=your_real_anthropic_key
```

### Vercel

```env
VITE_API_BASE_URL=https://cf-analyzer-v8l1.onrender.com
```

## Deployment

### Backend on Render

- Root Directory: `server`
- Build Command: `npm install`
- Start Command: `npm start`
- Set Render environment variables from the section above

### Frontend on Vercel

- Root Directory: `client`
- Build Command: `npm run build`
- Output Directory: `dist`
- Set `VITE_API_BASE_URL` to the Render backend URL

## Caching Strategy

- Each analysis result is cached by lowercase Codeforces handle
- Cache TTL is 6 hours
- `refresh=true` bypasses the cache and forces recomputation
- MongoDB TTL cleanup removes expired documents automatically

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

## Current Notes

- The backend listens only after MongoDB connects successfully
- The backend CORS policy allows only the exact origins set in `CLIENT_ORIGIN`
- If `ANTHROPIC_API_KEY` is missing, the app still works by returning the fallback study plan
- The current frontend build shows a large bundle warning, but deployment succeeds

## Future Improvements

- Add compare mode for two Codeforces handles
- Add saved analysis history for progress tracking
- Add contest recommendation filters by rating band
- Add screenshot gallery or demo GIF to the README
- Reduce bundle size with chart-level code splitting

## Author

Built by [Ankit Singh](https://github.com/Ankit-1808)

If you found this project useful, consider starring the repository.
