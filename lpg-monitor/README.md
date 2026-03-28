# LPG Shortage Monitor 🔴🟡🟢

> Helping families and kirana shop owners in Delhi-NCR know if LPG is available — in Hindi and English.

## Who is this for?

A mother in Dwarka checking if her cylinder will arrive.
A chai stall owner in Lajpat Nagar watching for price spikes.

## What it does

- Shows LPG shortage status for Delhi-NCR areas
- AI classifies each report as Critical / Moderate / Normal
- Available in Hindi and English
- Mobile-friendly, works on any phone

## Tech Stack

- Next.js 14 (App Router)
- Convex (real-time database)
- OpenAI GPT-4o-mini (classification + Hindi translation)
- Tailwind CSS

## How to run locally

1. Clone this repo
2. npm install
3. Add your API keys to .env.local
4. npx convex dev
5. npm run dev

## Roadmap

- v2: Live news scraping via Apify
- v3: WhatsApp/SMS alerts for areas marked red
- v4: Add Hindi regional news sources (Dainik Bhaskar)

## Ethics

Labels are AI-assisted. Always verify with your local gas dealer or official government channels.
