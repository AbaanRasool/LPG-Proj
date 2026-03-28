import Groq from "groq-sdk";

const SYSTEM_PROMPT = `You are an LPG (cooking gas) supply analyst for India.

Read the news text. Decide if the situation is CRITICAL shortage (red), MODERATE concern (yellow), or NORMAL supply (green).

Rules:
- red = shortage, no stock, supply cut, big price spike, panic, crisis
- yellow = delays, limited stock, small price rise, warnings
- green = normal supply, stable prices, things OK

You MUST reply with ONE raw JSON object only. No markdown. No code fences. No text before or after the JSON.

Use exactly these keys (camelCase):
"status" must be lowercase string only: "red" OR "yellow" OR "green"
"summary" = one clear sentence in English explaining what residents should know
"hindiSummary" = the same meaning in Hindi (Devanagari script)
"area" = place name like "East Delhi" or "Delhi-NCR" if unclear
"plainLanguageLabel" = short label like "Treated as critical shortage in East Delhi."

Example (structure only):
{"status":"red","summary":"Dealers in East Delhi report no LPG stock for days; families cannot cook.","hindiSummary":"पूर्वी दिल्ली में डीलरों के पास दिनों से एलपीजी स्टॉक नहीं है।","area":"East Delhi","plainLanguageLabel":"Treated as critical shortage in East Delhi."}`;

export type ClassifyFields = {
  status: string | null;
  summary: string | null;
  hindiSummary: string | null;
  area: string | null;
  plainLanguageLabel: string | null;
  classifyError?: string;
};

/** Strip \`\`\`json fences and leading/trailing noise so JSON.parse works. */
function extractJsonString(raw: string): string {
  let s = raw.trim();
  const fence = /^```(?:json)?\s*\r?\n?([\s\S]*?)\r?\n?```$/im;
  const m = s.match(fence);
  if (m?.[1]) {
    s = m[1].trim();
  } else if (s.startsWith("```")) {
    s = s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  }
  const first = s.indexOf("{");
  const last = s.lastIndexOf("}");
  if (first !== -1 && last !== -1 && last > first) {
    s = s.slice(first, last + 1);
  }
  return s;
}

function getStringLoose(
  obj: Record<string, unknown>,
  ...keys: string[]
): string | null {
  const lowerMap = new Map<string, unknown>();
  for (const [k, v] of Object.entries(obj)) {
    lowerMap.set(k.toLowerCase().replace(/[-_\s]/g, ""), v);
  }
  for (const key of keys) {
    const normalized = key.toLowerCase().replace(/[-_\s]/g, "");
    const v = lowerMap.get(normalized);
    if (typeof v === "string" && v.trim().length > 0) {
      return v.trim();
    }
  }
  return null;
}

/** Map common model wording to red | yellow | green. */
function normalizeStatusToken(raw: string): "red" | "yellow" | "green" | null {
  const s = raw.trim().toLowerCase();
  if (
    s === "red" ||
    s === "critical" ||
    s === "danger" ||
    s === "severe" ||
    s.includes("critical")
  ) {
    return "red";
  }
  if (
    s === "yellow" ||
    s === "amber" ||
    s === "moderate" ||
    s === "warning" ||
    s.includes("moderate")
  ) {
    return "yellow";
  }
  if (
    s === "green" ||
    s === "normal" ||
    s === "ok" ||
    s === "stable" ||
    s.includes("normal")
  ) {
    return "green";
  }
  if (s === "r" || s === "y" || s === "g") {
    return s === "r" ? "red" : s === "y" ? "yellow" : "green";
  }
  return null;
}

function parseClassifyBody(body: Record<string, unknown>): Omit<
  ClassifyFields,
  "classifyError"
> {
  const statusStr =
    getStringLoose(body, "status", "risk", "level", "severity") ?? "";
  const status = normalizeStatusToken(statusStr);

  const summary = getStringLoose(
    body,
    "summary",
    "englishSummary",
    "english",
    "description",
  );
  const hindiSummary = getStringLoose(
    body,
    "hindiSummary",
    "hindi_summary",
    "hindi",
    "summaryHi",
  );
  const area = getStringLoose(
    body,
    "area",
    "region",
    "location",
    "city",
  );
  const plainLanguageLabel = getStringLoose(
    body,
    "plainLanguageLabel",
    "plain_language_label",
    "label",
  );

  return {
    status,
    summary: summary && summary.length > 0 ? summary : null,
    hindiSummary: hindiSummary && hindiSummary.length > 0 ? hindiSummary : null,
    area: area && area.length > 0 ? area : null,
    plainLanguageLabel:
      plainLanguageLabel && plainLanguageLabel.length > 0
        ? plainLanguageLabel
        : null,
  };
}

/**
 * Calls Groq (default model: llama-3.1-8b-instant, override with GROQ_MODEL).
 * Used by /api/classify and /api/fetch-news.
 */
export async function runLpgClassify(text: string): Promise<ClassifyFields> {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      status: null,
      summary: null,
      hindiSummary: null,
      area: null,
      plainLanguageLabel: null,
      classifyError: "Missing text",
    };
  }

  const key = process.env.GROQ_API_KEY?.trim();
  if (!key || key === "your_groq_key_here") {
    return {
      status: null,
      summary: null,
      hindiSummary: null,
      area: null,
      plainLanguageLabel: null,
      classifyError:
        "Set GROQ_API_KEY in .env.local (see https://console.groq.com/keys)",
    };
  }

  if (!key.startsWith("gsk_")) {
    return {
      status: null,
      summary: null,
      hindiSummary: null,
      area: null,
      plainLanguageLabel: null,
      classifyError:
        "GROQ_API_KEY should start with gsk_ — check for typos or extra quotes in .env.local",
    };
  }

  const model =
    process.env.GROQ_MODEL?.trim() || "llama-3.1-8b-instant";

  try {
    const groq = new Groq({
      apiKey: key,
    });

    // Prefer plain completion (no response_format): some models reject json_mode and return 400.
    const completion = await groq.chat.completions.create({
      model,
      temperature: 0.2,
      max_tokens: 1024,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: trimmed },
      ],
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      return {
        status: null,
        summary: null,
        hindiSummary: null,
        area: null,
        plainLanguageLabel: null,
        classifyError: "Empty model response",
      };
    }

    let parsed: Record<string, unknown>;
    try {
      const jsonStr = extractJsonString(raw);
      parsed = JSON.parse(jsonStr) as Record<string, unknown>;
    } catch (parseErr) {
      const hint = parseErr instanceof Error ? parseErr.message : "parse error";
      return {
        status: null,
        summary: null,
        hindiSummary: null,
        area: null,
        plainLanguageLabel: null,
        classifyError: `Invalid JSON from model: ${hint}. Raw (first 200 chars): ${raw.slice(0, 200)}`,
      };
    }

    const fields = { ...parseClassifyBody(parsed) };

    if (!fields.plainLanguageLabel && fields.area && fields.status) {
      fields.plainLanguageLabel = `Treated as ${fields.status} concern in ${fields.area}.`;
    }

    if (
      !fields.status ||
      !fields.summary ||
      !fields.hindiSummary ||
      !fields.area
    ) {
      return {
        ...fields,
        classifyError: `Model returned incomplete JSON fields. Got keys: ${Object.keys(parsed).join(", ")}`,
      };
    }

    return {
      status: fields.status,
      summary: fields.summary,
      hindiSummary: fields.hindiSummary,
      area: fields.area,
      plainLanguageLabel:
        fields.plainLanguageLabel ?? `Treated as news in ${fields.area}.`,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return {
      status: null,
      summary: null,
      hindiSummary: null,
      area: null,
      plainLanguageLabel: null,
      classifyError: message,
    };
  }
}
