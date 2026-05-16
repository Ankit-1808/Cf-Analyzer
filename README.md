# CF Analyzer: An AI-Powered Codeforces Submission Analysis Platform

<p align="center">
  A full-stack web application that transforms Codeforces submission history into actionable performance insights, visual analytics, and a personalized 30-day study plan.
</p>

<p align="center">
  <a href="https://cf-analyzer-xhmn.vercel.app"><img src="https://img.shields.io/badge/Live%20Demo-Open%20App-111111?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo"></a>
  <a href="https://cf-analyzer-v8l1.onrender.com/api/health"><img src="https://img.shields.io/badge/API-Render-46E3B7?style=for-the-badge&logo=render&logoColor=111111" alt="Backend API"></a>
  <img src="https://img.shields.io/badge/Stack-MERN%20%2B%20Claude-2563eb?style=for-the-badge" alt="Stack">
</p>

## Live Demo

try out=https://cf-analyzer-xhmn.vercel.app/

## Overview

CF Analyzer is a full-stack project built to help competitive programmers understand their Codeforces performance through data instead of guesswork.

The application fetches a user's public Codeforces profile, contest rating history, and submission records, then analyzes the data to reveal:

- acceptance rate by tag
- strongest and weakest problem topics
- recent contest rating momentum
- submission activity consistency
- wrong-answer-heavy patterns

It then uses Claude AI to convert those structured insights into a personalized 30-day study plan.

## Getting Started

1. Clone this repository.
2. Install dependencies in both `server/` and `client/`.
3. Configure environment variables for backend and frontend.
4. Set up MongoDB locally or through MongoDB Atlas.
5. Run the backend and frontend development servers.
6. Open the app and analyze any public Codeforces handle.

That is it. The project is ready to run.

## Key Features

### Codeforces Profile Analysis

- Search for any public Codeforces handle
- Fetch user profile, contest rating history, and submissions from the Codeforces public API
- Normalize raw API data into a consistent internal analytics format

### Performance Breakdown

- Compute distinct-problem AC percentage by tag
- Detect top 5 weakest and strongest tags
- Identify recent rating growth or decline from the last 5 contests
- Track wrong-answer-heavy patterns and common failure trends

### Visual Dashboard

- Profile card with rank, rating, and max rating
- Tag performance charts
- Rating progression chart
- GitHub-style 365-day submission heatmap
- Day-by-day 30-day study plan cards

### AI Study Plan Generation

- Send structured user performance metrics to Claude
- Generate a personalized 30-day improvement roadmap
- Return a deterministic fallback study plan if the AI API is unavailable

### Smart Caching

- Store analysis results in MongoDB
- Cache repeat lookups for 6 hours
- Support forced refresh for fresh analysis

## Tech Info

### Frontend

- React.js
- Vite
- Tailwind CSS
- Recharts
- Axios

### Backend

- Node.js
- Express.js
- Mongoose
- Morgan
- Axios

### Database

- MongoDB Atlas / MongoDB

### AI Integration

- Anthropic Claude API
- Model: `claude-sonnet-4-20250514`

### Testing

- Vitest
- Supertest
- React Testing Library

### Deployment

- Vercel for frontend
- Render for backend

## Project Structure

### Server

- `config/`: database configuration
- `models/`: Mongoose schemas
- `routes/`: API endpoints
- `services/`: Codeforces fetchers, analyzer logic, AI integration
- `utils/`: helper functions and fallback plan builders
- `tests/`: backend unit and route tests

### Client

- `src/components/`: reusable UI components
- `src/pages/`: page-level UI
- `src/services/`: API client setup
- `src/tests/`: frontend tests

## Folder Layout

```text
CF-Analyzer/
|-- client/
|   |-- src/
|   |   |-- components/
|   |   |-- pages/
|   |   |-- services/
|   |   `-- tests/
|   |-- package.json
|   `-- vite.config.js
|-- server/
|   |-- config/
|   |-- models/
|   |-- routes/
|   |-- services/
|   |-- tests/
|   |-- utils/
|   |-- index.js
|   `-- package.json
`-- README.md
```

## API Endpoints

### `GET /api/health`

Checks whether the backend is running.

### `GET /api/analyze/:handle`

Returns the full Codeforces analysis payload for a given handle.

Optional query:

- `refresh=true` to bypass cache and force recomputation

## Example Response Shape

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

### 3. Add environment variables

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

### 4. Run the application

Backend:

```bash
cd server
npm run dev
```

Frontend:

```bash
cd client
npm run dev
```

## Production Environment Variables

### Render Backend

```env
MONGODB_URI=your_mongodb_atlas_uri
CLIENT_ORIGIN=https://cf-analyzer-xhmn.vercel.app,http://localhost:5173
CACHE_TTL_HOURS=6
ANTHROPIC_MODEL=claude-sonnet-4-20250514
ANTHROPIC_API_KEY=your_real_anthropic_key
```

### Vercel Frontend

```env
VITE_API_BASE_URL=https://cf-analyzer-v8l1.onrender.com
```

## Deployment

### Backend Deployment

- Platform: Render
- Root Directory: `server`
- Build Command: `npm install`
- Start Command: `npm start`

### Frontend Deployment

- Platform: Vercel
- Root Directory: `client`
- Build Command: `npm run build`
- Output Directory: `dist`

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

## Project Goals

CF Analyzer was built to:

- turn raw competitive programming data into practical feedback
- showcase full-stack MERN development skills
- demonstrate external API integration
- demonstrate AI-powered feature integration in a real product workflow
- provide a polished portfolio project with meaningful analytics and UI

## Future Enhancements

- Add compare mode for multiple Codeforces users
- Add saved historical snapshots for progress tracking
- Add contest recommendations based on rating band
- Add difficulty filters to the study plan UI
- Improve frontend bundle size with code splitting
- Add screenshots or a demo GIF to the README

## Contributing

Contributions are welcome.

If you want to improve the project:

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Commit your work
5. Push to your fork
6. Open a pull request

Suggestions, issues, and feedback are always appreciated.

## Author

Built by [Ankit Singh](https://github.com/Ankit-1808)

If you found this project helpful, consider starring the repository.
