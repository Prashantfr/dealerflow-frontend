# DealerFlow Frontend

React + Vite + Tailwind CSS (v4) frontend for the DealerFlow dealer onboarding and approval backend.

## Run locally

```bash
npm install
cp .env.example .env      # set VITE_API_URL to your backend URL
npm run dev               # http://localhost:5173
```

Start the backend first (`npm run seed` once, then `npm run dev`) and set `CLIENT_URL=http://localhost:5173` in the backend `.env` so CORS allows this app.

Demo logins (created by the backend seed script, password `Demo@1234`):
`sales@`, `finance@`, `legal@`, `head@` + `dealerflow.demo`

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |

## Structure

```
src/
  api/          axios client (JWT header, 401 handling) + endpoint functions
  context/      AuthContext (login, logout, session expiry)
  hooks/        useApplications (loading / error / reload)
  utils/        workflow rules (FLOW, permissions, date formatting)
  components/   Layout, ProtectedRoute, StatusBadge, WorkflowStepper,
                HistoryTimeline, ConfirmDialog, ApplicationRow, Feedback states
  pages/        Login, Dashboard, Queue, ApplicationDetail, ApplicationForm
```

## API used

| Screen | Request |
|---|---|
| Login | `POST /api/auth/login` |
| Dashboard, Queue | `GET /appointments` |
| Detail | `GET /appointment/:id` |
| Approve / Reject / Return | `PUT /appointment/:id/status` with `{ action, remarks }` |
| New application | `POST /appointment` (sales only) |
| Edit application | `PUT /appointment/:id` (sales only) |

## Deploy (Vercel)

1. Import the repo, framework preset: Vite.
2. Add the environment variable `VITE_API_URL` = your deployed backend URL.
3. `vercel.json` already rewrites all routes to `index.html` so page refreshes work.
4. On the backend, set `CLIENT_URL` to your Vercel URL.
