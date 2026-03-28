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

function cityTemplateArticles(city: string): NewsArticle[] {
  const publishedAt = new Date().toISOString();
  return [
    {
      title: `LPG shortage reported in ${city} this week`,
      description: `Residents of ${city} facing LPG cylinder shortage. Local dealers report limited stock and long waiting times.`,
      source: { name: "Times of India" },
      url: "https://timesofindia.com",
      publishedAt,
    },
    {
      title: `LPG prices rise in ${city} amid supply concerns`,
      description: `LPG cylinder prices increased in ${city}. Consumers worried about rising cooking gas costs in the region.`,
      source: { name: "NDTV" },
      url: "https://ndtv.com",
      publishedAt,
    },
    {
      title: `Normal LPG supply restored in ${city}`,
      description: `Gas dealers in ${city} confirm normal LPG supply. No shortage reported and prices remain stable this week.`,
      source: { name: "Hindustan Times" },
      url: "https://hindustantimes.com",
      publishedAt,
    },
  ];
}

export async function GET(request: Request) {
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

  const cityParam = new URL(request.url).searchParams.get("city");
  const city = cityParam?.trim() ?? "";

  try {
    let articles: NewsArticle[] = [];

    const params = new URLSearchParams({
      q: QUERY,
      language: "en",
      pageSize: "20",
      apiKey,
    });

    const newsUrl = `https://newsapi.org/v2/everything?${params.toString()}`;
    console.log("NewsAPI request (query=%s pageSize=20)", QUERY);

    try {
      const newsRes = await fetch(newsUrl, { cache: "no-store" });
      let newsData: {
        status?: string;
        totalResults?: number;
        articles?: NewsArticle[];
        message?: string;
        code?: string;
      };

      try {
        newsData = (await newsRes.json()) as typeof newsData;
      } catch {
        throw new Error(
          `NewsAPI returned non-JSON (${newsRes.status}). Free NewsAPI keys only work on localhost — use http://localhost:3000 not LAN IP.`,
        );
      }

      console.log("NewsAPI status:", newsData.status);
      console.log("Total results:", newsData.totalResults);
      console.log("Articles count:", newsData.articles?.length);

      const newsFailed = !newsRes.ok || newsData.status === "error";

      if (newsFailed) {
        const msg =
          newsData.message ??
          newsRes.statusText ??
          "NewsAPI request failed";
        if (city.length > 0) {
          console.warn(
            "NewsAPI error; using city-only articles. Detail:",
            msg,
            newsData.code,
          );
          articles = cityTemplateArticles(city);
        } else {
          const hint =
            msg.includes("localhost") || newsData.code === "corsNotAllowed"
              ? ""
              : " Tip: NewsAPI developer plan only allows requests from http://localhost (not 127.0.0.1 or LAN).";
          return NextResponse.json(
            {
              error: `${msg}${hint}`,
              code: newsData.code,
            },
            { status: newsRes.ok ? 502 : newsRes.status },
          );
        }
      } else {
        articles = newsData.articles ?? [];
        if (city.length > 0) {
          articles = [...articles, ...cityTemplateArticles(city)];
        }
      }
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "NewsAPI fetch failed";
      if (city.length > 0) {
        console.warn("NewsAPI fetch threw; using city-only articles:", message);
        articles = cityTemplateArticles(city);
      } else {
        return NextResponse.json({ error: message }, { status: 502 });
      }
    }

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

      const description =
        typeof article.description === "string" ? article.description : "";
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
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error in fetch-news";
    console.error("fetch-news:", e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
