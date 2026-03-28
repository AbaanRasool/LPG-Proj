import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const SYSTEM_PROMPT = `You are an LPG supply analyst for India.
Classify the given news article and respond ONLY
in valid JSON with no extra text.

Rules:
RED = shortage, unavailable, supply cut, price spike
      over 20%, protests, panic buying, crisis
YELLOW = delay, limited stock, price rise under 20%,
         warnings, monitoring situation
GREEN = normal supply, stable prices, stock available,
        new connections issued

Return exactly this JSON object shape with double-quoted keys and string values:
{
  "status": "red" or "yellow" or "green" (pick one),
  "summary": "one sentence in English",
  "hindiSummary": "same sentence in Hindi",
  "area": "specific area name, or Delhi-NCR if unclear",
  "plainLanguageLabel": "Treated as [X] in [area]."
}`;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { text?: string };
    const text = typeof body.text === "string" ? body.text.trim() : "";
    if (!text) {
      return NextResponse.json({ error: "Missing text field" }, { status: 400 });
    }

    const key = process.env.OPENAI_API_KEY;
    if (!key || key === "your_openai_key_here") {
      return NextResponse.json(
        {
          error:
            "Set OPENAI_API_KEY in .env.local (see https://platform.openai.com/api-keys)",
        },
        { status: 500 },
      );
    }

    const openai = new OpenAI({ apiKey: key });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: text },
      ],
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      return NextResponse.json({ error: "Empty model response" }, { status: 502 });
    }

    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return NextResponse.json(parsed);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
