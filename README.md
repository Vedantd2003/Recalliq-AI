# RecallIQ AI

MERN app for AI-powered meeting analysis (Gemini) with a Node/Express + MongoDB backend and a Vite/React frontend.

## Repo layout

- `recalliq-ai/backend`: API server
- `recalliq-ai/frontend`: React app

## Local dev (manual)

```bash
cd recalliq-ai/backend
cp .env.example .env
npm install
npm run dev
```

```bash
cd recalliq-ai/frontend
cp .env.example .env
npm install
npm run dev
```

## Local dev (Docker)

```bash
docker compose up --build
```

Frontend: `http://localhost:5173`  
API health: `http://localhost:5000/health`

## Deploy (Render.com)

This repo includes `render.yaml` (blueprint) that creates:

- **Web service** `recalliq-api` (Node backend)
- **Static site** `recalliq-frontend` (Vite build output)

On Render, set these env vars on the backend service:

- `MONGODB_URI`
- `GEMINI_API_KEY`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`

Then set `VITE_API_URL` on the frontend service to the backend URL + `/api`.
