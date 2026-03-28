# LPG Shortage Monitor

A Next.js app that aggregates LPG-related news, classifies each item as **Critical / Moderate / Normal**, and shows **English** and **Hindi** copy. Includes **city/state search**, **city-aware fetch** (with template articles when needed), and **precaution recommendations** based on the current list.

## Tech stack

- **Next.js 14** (App Router), **React 18**, **TypeScript**, **Tailwind CSS**
- **Convex** — report storage and real-time queries
- **Groq** (`GROQ_API_KEY`) — LLM classification + Hindi fields (`lib/classifyLpgText.ts`)
- **NewsAPI** (`NEWS_API_KEY`) — `/api/fetch-news` loads articles with query `LPG India`

## Local setup

1. `cd lpg-monitor`
2. `npm install`
3. Configure Convex and env:
   - Run `npx convex dev` and follow prompts; copy `NEXT_PUBLIC_CONVEX_URL` into `.env.local`
   - Add `GROQ_API_KEY` and `NEWS_API_KEY`
4. `npm run dev` — open **`http://localhost:3000`** (NewsAPI’s free developer tier is picky about origin; prefer `localhost` over `127.0.0.1` or LAN IPs when testing NewsAPI)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | ESLint |
| `npm run seed` | `npx convex run reports:seedReports` — seed demo reports |

## Project layout (high level)

- `app/page.tsx` — home (renders `Dashboard`)
- `components/Dashboard.tsx` — main UI: search, fetch, cards, recommendations
- `components/ReportCard.tsx`, `StatusSummary.tsx`, `Recommendations.tsx`, etc.
- `app/api/fetch-news/route.ts` — NewsAPI + optional `?city=` templates + Convex writes
- `convex/` — schema, queries, mutations

## Disclaimer

Labels and summaries are **AI-assisted**. Always confirm with your local gas dealer or official channels before acting.

## License

Private / as per your repository.
