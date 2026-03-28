import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { runLpgClassify, type ClassifyFields } from "@/lib/classifyLpgText";

export const dynamic = "force-dynamic";

const QUERY = "LPG India";

type NewsArticle = Record<string, unknown> & {
  title?: string | null;
  description?: string | null;
  url?: string | null;
  publishedAt?: string | null;
  source?: { id?: string | null; name?: string | null } | null;
};

function normalizeTitle(title: string): string {
  return title.trim().toLowerCase();
}

function sourceName(article: NewsArticle): string {
  const s = article.source;
  if (s && typeof s.name === "string" && s.name.length > 0) {
    return s.name;
  }
  return "NewsAPI";
}

function publishedAtString(article: NewsArticle): string {
  const raw = article.publishedAt;
  if (typeof raw === "string" && raw.length >= 10) {
    return raw.slice(0, 10);
  }
  return new Date().toISOString().slice(0, 10);
}

function isClassifyComplete(c: ClassifyFields): boolean {
  return Boolean(
    !c.classifyError &&
      c.status &&
      c.summary &&
      c.hindiSummary &&
      c.area,
  );
}

export async function GET() {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing NEWS_API_KEY in environment" },
      { status: 500 },
    );
  }

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    return NextResponse.json(
      { error: "Missing NEXT_PUBLIC_CONVEX_URL in environment" },
      { status: 500 },
    );
  }

  const params = new URLSearchParams({
    q: QUERY,
    language: "en",
    pageSize: "20",
    apiKey,
  });

  const newsUrl = `https://newsapi.org/v2/everything?${params.toString()}`;
  console.log("NewsAPI request (query=%s pageSize=20)", QUERY);

  const res = await fetch(newsUrl, { cache: "no-store" });
  const data = (await res.json()) as {
    status?: string;
    totalResults?: number;
    articles?: NewsArticle[];
    message?: string;
    code?: string;
  };

  console.log("NewsAPI status:", data.status);
  console.log("Total results:", data.totalResults);
  console.log("Articles count:", data.articles?.length);

  if (!res.ok || data.status === "error") {
    return NextResponse.json(
      {
        error: data.message ?? res.statusText,
        code: data.code,
      },
      { status: res.ok ? 502 : res.status },
    );
  }

  const articles = data.articles ?? [];

  const convex = new ConvexHttpClient(convexUrl);
  const existing = await convex.query(api.reports.getAllReports, {});
  const seenTitles = new Set(
    existing.map((r) => normalizeTitle(r.title)).filter(Boolean),
  );

  let saved = 0;
  let skipped = 0;
  let skipEmptyTitle = 0;
  let skipDuplicate = 0;
  let skipClassify = 0;
  let firstClassifyError: string | undefined;

  for (const article of articles) {
    const rawTitle = typeof article.title === "string" ? article.title : "";
    const titleTrim = rawTitle.trim();
    if (!titleTrim) {
      skipped += 1;
      skipEmptyTitle += 1;
      continue;
    }

    const key = normalizeTitle(titleTrim);
    if (seenTitles.has(key)) {
      skipped += 1;
      skipDuplicate += 1;
      continue;
    }

    const description = typeof article.description === "string" ? article.description : "";
    const text = `${titleTrim}\n\n${description}`;
    const classified = await runLpgClassify(text);

    if (!isClassifyComplete(classified)) {
      skipped += 1;
      skipClassify += 1;
      if (classified.classifyError) {
        if (!firstClassifyError) {
          firstClassifyError = classified.classifyError;
        }
        console.warn(
          "classify skip:",
          titleTrim.slice(0, 60),
          classified.classifyError,
        );
      }
      continue;
    }

    const area = classified.area!;
    const plainLanguageLabel =
      classified.plainLanguageLabel ?? `Treated as news in ${area}.`;

    const sourceUrl =
      typeof article.url === "string" && article.url.length > 0
        ? article.url
        : "https://newsapi.org";

    await convex.mutation(api.reports.addReport, {
      title: titleTrim,
      summary: classified.summary!,
      hindiSummary: classified.hindiSummary!,
      status: classified.status!,
      area,
      source: sourceName(article),
      sourceUrl,
      publishedAt: publishedAtString(article),
      plainLanguageLabel,
      createdAt: Date.now(),
    });

    seenTitles.add(key);
    saved += 1;
  }

  return NextResponse.json({
    saved,
    skipped,
    skipEmptyTitle,
    skipDuplicate,
    skipClassify,
    groqKeyConfigured: Boolean(process.env.GROQ_API_KEY?.trim()),
    firstClassifyError,
  });
}
