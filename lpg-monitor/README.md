# LPG Shortage Monitor

> Helping families and shop owners see LPG supply signals — in **Hindi** and **English**.

## What it does

- Fetches LPG-related news, classifies each report as **Critical / Moderate / Normal**
- **City/state search**, optional **city-aware fetch** (template articles when NewsAPI is unavailable)
- **Precaution recommendations** based on the current list
- Mobile-friendly UI

## Tech stack

- **Next.js 14** (App Router), **React 18**, **TypeScript**, **Tailwind CSS**
- **Convex** — database and real-time queries
- **Groq** — classification + Hindi fields (`lib/classifyLpgText.ts`)
- **NewsAPI** — `/api/fetch-news` (query: `LPG India`)

## Local development

1. `cd lpg-monitor`
2. `npm install`
3. Create **`.env.local`** (see [Environment variables](#environment-variables))
4. `npx convex dev` — keep running; copy `NEXT_PUBLIC_CONVEX_URL` into `.env.local`
5. `npm run dev` — open **http://localhost:3000**  
   - NewsAPI’s free developer tier works best with **`localhost`** (not `127.0.0.1` or a LAN IP).

### Scripts

| Command        | Description                                      |
|----------------|--------------------------------------------------|
| `npm run dev`  | Next.js dev server                               |
| `npm run build`| Production build                                 |
| `npm run start`| Production server (after `build`)              |
| `npm run lint` | ESLint                                           |
| `npm run seed` | Seed demo reports (`convex run reports:seedReports`) |

## Environment variables

Create **`lpg-monitor/.env.local`** (never commit real keys):

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_CONVEX_URL` | Yes | Convex deployment URL (`npx convex dev` / dashboard) |
| `GROQ_API_KEY` | Yes | Groq API key (`gsk_…`) from [Groq Console](https://console.groq.com/keys) |
| `NEWS_API_KEY` | Yes | [NewsAPI](https://newsapi.org) key |
| `GROQ_MODEL` | No | Override model (default: `llama-3.1-8b-instant`) |

---

## Deploy on Vercel

### 1. Push the app to GitHub (or GitLab / Bitbucket)

If this folder lives inside a monorepo (e.g. `LPG-Project/lpg-monitor`), you can still deploy only the app folder.

### 2. Create a Vercel project

1. Go to [vercel.com](https://vercel.com) → **Add New** → **Project** → import the repo.
2. If the repo root is **not** `lpg-monitor`, set **Root Directory** to `lpg-monitor` in **Settings → General**.
3. Framework: **Next.js** (auto-detected). Build: `npm run build`, Output: default.

### 3. Deploy Convex to production

The site needs a **production** Convex backend (not only `dev`).

```bash
cd lpg-monitor
npx convex deploy
```

Follow the prompts. After deploy, copy the **production** deployment URL (same shape as `https://YOUR_DEPLOYMENT.convex.cloud`).

### 4. Set environment variables on Vercel

In the Vercel project: **Settings → Environment Variables**, add for **Production** (and Preview if you want):

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_CONVEX_URL` | Production URL from `npx convex deploy` |
| `GROQ_API_KEY` | Your Groq secret (`gsk_…`) |
| `NEWS_API_KEY` | Your NewsAPI key |

Redeploy after saving (**Deployments → … → Redeploy**).

**Note:** NewsAPI’s **free developer** plan often allows only **localhost**. On a public Vercel URL, “Fetch live news” may fail until you use a **paid** NewsAPI plan or rely on **city search + template articles** (your app already falls back when `?city=` is used).

### 5. Deploy from the CLI (optional)

```bash
npm i -g vercel
cd lpg-monitor
vercel login
vercel        # preview
vercel --prod # production
```

Paste the same env vars when prompted or add them in the dashboard.

---

## Project layout

| Path | Role |
|------|------|
| `app/page.tsx` | Home → `Dashboard` |
| `components/Dashboard.tsx` | Main UI |
| `app/api/fetch-news/route.ts` | NewsAPI + optional `?city=` + Convex writes |
| `convex/` | Schema, queries, mutations |

## Ethics

Labels are **AI-assisted**. Always verify with your local gas dealer or official government channels before acting.
