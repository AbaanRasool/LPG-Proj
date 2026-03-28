"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useMemo, useState } from "react";
import { Locale, translations } from "@/lib/translations";
import { LanguageToggle } from "@/components/LanguageToggle";
import { StatusSummary } from "@/components/StatusSummary";
import { ReportCard } from "@/components/ReportCard";
import {
  Recommendations,
  overallRecommendationStatus,
} from "@/components/Recommendations";

const POPULAR_CITIES = [
  "Delhi",
  "Mumbai",
  "Bangalore",
  "Kolkata",
  "Chennai",
  "Hyderabad",
  "Noida",
  "Pune",
] as const;

type FetchNewsJson = {
  saved?: number;
  skipped?: number;
  skipDuplicate?: number;
  skipClassify?: number;
  skipEmptyTitle?: number;
  groqKeyConfigured?: boolean;
  firstClassifyError?: string;
  error?: string;
};

function parseFetchNewsBody(
  bodyText: string,
  httpStatus: number,
  genericError: string,
): { ok: true; data: FetchNewsJson } | { ok: false; message: string } {
  try {
    const data = (bodyText ? JSON.parse(bodyText) : {}) as FetchNewsJson;
    return { ok: true, data };
  } catch {
    return {
      ok: false,
      message: `${genericError} (HTTP ${httpStatus})`,
    };
  }
}

export function Dashboard() {
  const reports = useQuery(api.reports.getAllReports);
  const clearAllReports = useMutation(api.reports.clearAllReports);

  const [locale, setLocale] = useState<Locale>("en");
  const [searchQuery, setSearchQuery] = useState("");
  const [fetchLoading, setFetchLoading] = useState(false);
  const [citySearchLoading, setCitySearchLoading] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);
  const [fetchBanner, setFetchBanner] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);

  const t = translations[locale];

  const lastUpdated = useMemo(() => {
    if (!reports?.length) return null;
    const max = Math.max(...reports.map((r) => r.createdAt));
    return new Date(max).toLocaleString(locale === "hi" ? "hi-IN" : "en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }, [reports, locale]);

  const sorted = useMemo(() => {
    if (!reports) return undefined;
    return [...reports].sort((a, b) => {
      const order = (s: string) => (s === "red" ? 0 : s === "yellow" ? 1 : 2);
      const byStatus = order(a.status) - order(b.status);
      if (byStatus !== 0) return byStatus;
      return b.createdAt - a.createdAt;
    });
  }, [reports]);

  const filteredReports = useMemo(() => {
    if (!sorted) return undefined;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter((r) =>
      (r.area || "").toLowerCase().includes(q),
    );
  }, [sorted, searchQuery]);

  const activeFilter = searchQuery.trim();

  const recommendationStatus = useMemo(() => {
    if (filteredReports === undefined) return undefined;
    return overallRecommendationStatus(filteredReports);
  }, [filteredReports]);

  async function handleFetchLiveNews() {
    setFetchBanner(null);
    setFetchLoading(true);
    try {
      const res = await fetch("/api/fetch-news", { method: "GET" });
      const data = (await res.json()) as {
        saved?: number;
        skipped?: number;
        skipDuplicate?: number;
        skipClassify?: number;
        skipEmptyTitle?: number;
        groqKeyConfigured?: boolean;
        firstClassifyError?: string;
        error?: string;
      };

      if (!res.ok || typeof data.error === "string") {
        setFetchBanner({
          kind: "error",
          text: typeof data.error === "string" ? data.error : t.fetchLiveNewsError,
        });
        return;
      }

      if (data.groqKeyConfigured === false) {
        setFetchBanner({
          kind: "error",
          text: t.groqKeyMissing,
        });
        return;
      }

      const saved = typeof data.saved === "number" ? data.saved : 0;

      if (saved > 0) {
        setFetchBanner({
          kind: "success",
          text: t.reportsAdded.replace("{count}", String(saved)),
        });
        return;
      }

      const skipped = typeof data.skipped === "number" ? data.skipped : 0;
      const dup = typeof data.skipDuplicate === "number" ? data.skipDuplicate : 0;
      const cls = typeof data.skipClassify === "number" ? data.skipClassify : 0;
      const empty = typeof data.skipEmptyTitle === "number" ? data.skipEmptyTitle : 0;

      let text = t.reportsAdded.replace("{count}", String(saved));
      if (skipped > 0) {
        text += ` ${t.fetchSkipDetail.replace("{skipped}", String(skipped)).replace("{dup}", String(dup)).replace("{cls}", String(cls)).replace("{empty}", String(empty))}`;
      }
      if (data.firstClassifyError) {
        text += ` — ${data.firstClassifyError}`;
      }

      setFetchBanner({
        kind: data.firstClassifyError ? "error" : "success",
        text,
      });
    } catch {
      setFetchBanner({ kind: "error", text: t.fetchLiveNewsError });
    } finally {
      setFetchLoading(false);
    }
  }

  async function handleSearchAndFetch() {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    setFetchBanner(null);
    setCitySearchLoading(true);
    try {
      const res = await fetch(
        `/api/fetch-news?city=${encodeURIComponent(trimmed)}`,
        { method: "GET" },
      );
      const parsed = parseFetchNewsBody(
        await res.text(),
        res.status,
        t.fetchLiveNewsError,
      );
      if (!parsed.ok) {
        setFetchBanner({ kind: "error", text: parsed.message });
        return;
      }
      const { data } = parsed;

      if (!res.ok || typeof data.error === "string") {
        setFetchBanner({
          kind: "error",
          text: typeof data.error === "string" ? data.error : t.fetchLiveNewsError,
        });
        return;
      }

      if (data.groqKeyConfigured === false) {
        setFetchBanner({
          kind: "error",
          text: t.groqKeyMissing,
        });
        return;
      }

      setSearchQuery(trimmed);

      const saved = typeof data.saved === "number" ? data.saved : 0;

      if (saved > 0) {
        setFetchBanner({
          kind: "success",
          text: t.reportsAdded.replace("{count}", String(saved)),
        });
        return;
      }

      const skipped = typeof data.skipped === "number" ? data.skipped : 0;
      const dup = typeof data.skipDuplicate === "number" ? data.skipDuplicate : 0;
      const cls = typeof data.skipClassify === "number" ? data.skipClassify : 0;
      const empty = typeof data.skipEmptyTitle === "number" ? data.skipEmptyTitle : 0;

      let text = t.reportsAdded.replace("{count}", String(saved));
      if (skipped > 0) {
        text += ` ${t.fetchSkipDetail.replace("{skipped}", String(skipped)).replace("{dup}", String(dup)).replace("{cls}", String(cls)).replace("{empty}", String(empty))}`;
      }
      if (data.firstClassifyError) {
        text += ` — ${data.firstClassifyError}`;
      }

      setFetchBanner({
        kind: data.firstClassifyError ? "error" : "success",
        text,
      });
    } catch {
      setFetchBanner({ kind: "error", text: t.fetchLiveNewsError });
    } finally {
      setCitySearchLoading(false);
    }
  }

  function handleShowAll() {
    setSearchQuery("");
  }

  async function handleClearAll() {
    setFetchBanner(null);
    setClearLoading(true);
    try {
      await clearAllReports();
    } finally {
      setClearLoading(false);
    }
  }

  const busy = fetchLoading || clearLoading || citySearchLoading;

  const showingResultsLine =
    activeFilter && filteredReports !== undefined
      ? t.showingResultsFor
          .replace("{count}", String(filteredReports.length))
          .replace("{city}", activeFilter)
      : null;

  return (
    <div
      lang={locale}
      className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-4 py-6 pb-28 sm:px-6"
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden>
            🔴
          </span>
          <h1 className="text-xl font-bold leading-tight sm:text-2xl">{t.appName}</h1>
        </div>
        <LanguageToggle
          locale={locale}
          onToggle={() => setLocale((l) => (l === "en" ? "hi" : "en"))}
        />
      </header>

      <div className="flex flex-col gap-3">
        <label className="sr-only" htmlFor="city-search">
          {t.searchPlaceholder}
        </label>
        <input
          id="city-search"
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="w-full min-h-[48px] rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-lg text-gray-900 shadow-sm outline-none placeholder:text-gray-500 focus:border-blue-600"
          autoComplete="off"
        />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
          <button
            type="button"
            onClick={() => void handleSearchAndFetch()}
            disabled={busy || !searchQuery.trim()}
            className="min-h-[48px] flex-1 rounded-lg border-2 border-blue-700 bg-blue-600 px-4 py-3 text-base font-bold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60 sm:text-lg"
          >
            {citySearchLoading ? t.searchSearching : t.searchAndFetchNews}
          </button>
          <button
            type="button"
            onClick={handleShowAll}
            disabled={busy}
            className="min-h-[48px] shrink-0 rounded-lg border border-gray-400 bg-gray-200 px-4 py-3 text-base font-medium text-gray-800 shadow-sm disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-[120px]"
          >
            {t.searchShowAll}
          </button>
        </div>
        <div className="-mx-1 overflow-x-auto pb-1">
          <div className="flex min-w-0 gap-2 px-1">
            {POPULAR_CITIES.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => setSearchQuery(city)}
                className="shrink-0 rounded-full bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-800 shadow-sm"
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleFetchLiveNews}
            disabled={busy}
            className="min-h-[48px] flex-1 rounded-lg border-2 border-blue-700 bg-blue-600 px-3 py-3 text-base font-bold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60 sm:text-lg"
          >
            {fetchLoading ? t.fetchLiveNewsLoading : t.fetchLiveNews}
          </button>
          <button
            type="button"
            onClick={handleClearAll}
            disabled={busy}
            className="min-h-[48px] shrink-0 rounded-lg border border-gray-400 bg-gray-200 px-3 py-2 text-sm font-medium text-gray-800 shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            {clearLoading ? t.clearAllLoading : t.clearAll}
          </button>
        </div>
        {fetchBanner ? (
          <p
            role="status"
            className={
              fetchBanner.kind === "success"
                ? "text-base font-medium text-green-800"
                : "text-base font-medium text-red-700"
            }
          >
            {fetchBanner.text}
          </p>
        ) : null}
      </div>

      {lastUpdated ? (
        <p className="text-sm text-gray-600">
          {t.lastUpdated}: {lastUpdated}
        </p>
      ) : null}

      {showingResultsLine ? (
        <p className="text-base font-medium text-gray-800">{showingResultsLine}</p>
      ) : null}

      <StatusSummary reports={filteredReports} locale={locale} />

      {recommendationStatus !== undefined ? (
        <Recommendations status={recommendationStatus} locale={locale} />
      ) : null}

      <section className="flex flex-col gap-4" aria-label="Reports">
        {sorted === undefined || filteredReports === undefined ? (
          <LoadingSkeleton />
        ) : sorted.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-base text-gray-600">
            {t.emptyReports}{" "}
            {t.emptyReportsHint}{" "}
            <code className="rounded bg-gray-100 px-1">npm run seed</code>{" "}
            {t.emptyReportsHintEnd}
          </p>
        ) : filteredReports.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-base text-gray-600">
            {t.noSearchMatches}
          </p>
        ) : (
          filteredReports.map((report) => (
            <ReportCard key={report._id} report={report} locale={locale} />
          ))
        )}
      </section>

      <footer className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white/95 px-4 py-3 text-sm text-gray-700 backdrop-blur sm:text-base">
        <p className="mx-auto max-w-2xl text-center leading-snug" lang={locale}>
          ⚠️ {t.disclaimer}
        </p>
      </footer>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-40 animate-pulse rounded-xl border-2 border-gray-200 bg-gray-100"
        />
      ))}
    </>
  );
}
