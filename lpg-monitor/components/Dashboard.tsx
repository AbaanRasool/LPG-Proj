"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useMemo, useState } from "react";
import { Locale, translations } from "@/lib/translations";
import { Navbar } from "@/components/Navbar";
import { StatusSummary } from "@/components/StatusSummary";
import { ReportCard } from "@/components/ReportCard";
import {
  Recommendations,
  overallRecommendationStatus,
} from "@/components/Recommendations";
import { IndiaHeroMapPanel } from "@/components/IndiaHeroMapPanel";
import { AreaStatusCard } from "@/components/AreaStatusCard";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { SiteFooter } from "@/components/SiteFooter";

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
    return sorted.filter((r) => (r.area || "").toLowerCase().includes(q));
  }, [sorted, searchQuery]);

  const activeFilter = searchQuery.trim();

  const indiaCounts = useMemo(() => {
    if (!sorted?.length) return { red: 0, yellow: 0, green: 0 };
    return {
      red: sorted.filter((r) => r.status === "red").length,
      yellow: sorted.filter((r) => r.status === "yellow").length,
      green: sorted.filter((r) => r.status === "green").length,
    };
  }, [sorted]);

  const areaCounts = useMemo(() => {
    if (!activeFilter || filteredReports === undefined) return null;
    if (filteredReports.length === 0) return null;
    return {
      red: filteredReports.filter((r) => r.status === "red").length,
      yellow: filteredReports.filter((r) => r.status === "yellow").length,
      green: filteredReports.filter((r) => r.status === "green").length,
    };
  }, [activeFilter, filteredReports]);

  const recommendationStatus = useMemo(() => {
    if (filteredReports === undefined) return undefined;
    return overallRecommendationStatus(filteredReports);
  }, [filteredReports]);

  async function handleFetchLiveNews() {
    setFetchBanner(null);
    setFetchLoading(true);
    try {
      const res = await fetch("/api/fetch-news", { method: "GET" });
      const data = (await res.json()) as FetchNewsJson;

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

  const showAreaColumn = Boolean(activeFilter);
  const showAreaEmpty =
    showAreaColumn &&
    filteredReports !== undefined &&
    filteredReports.length === 0;

  return (
    <div
      lang={locale}
      className="relative mx-auto flex min-h-screen max-w-5xl flex-col gap-10 px-4 pb-32 pt-2 sm:px-6 lg:pb-16"
    >
      <Navbar
        locale={locale}
        onLocaleChange={() => setLocale((l) => (l === "en" ? "hi" : "en"))}
      />

      <section className="rounded-3xl bg-gradient-to-b from-[#0A0A0F] to-[#12121A] px-4 py-10 sm:px-8 sm:py-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-stretch lg:gap-12">
          <div className="flex min-h-0 flex-1 flex-col gap-8">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-200">
              {t.heroTag}
            </span>
            <h2 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-white md:text-6xl">
              <span className="block text-white">{t.heroHeadlineLine1}</span>
              <span className="mt-1 block bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent md:mt-2">
                {t.heroHeadlineGradient}
              </span>
            </h2>
            <p className="text-lg text-[var(--text-secondary)]">{t.heroSubEn}</p>
            <p className="text-base text-white/60" lang="hi">
              {t.heroSubHi}
            </p>

            <label className="sr-only" htmlFor="city-search">
              {t.searchPlaceholder}
            </label>
            <input
              id="city-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="glass w-full min-h-[52px] rounded-xl border border-white/10 px-4 py-3 text-lg text-white outline-none ring-indigo-500/0 transition placeholder:text-white/40 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/40"
              autoComplete="off"
            />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
              <button
                type="button"
                onClick={() => void handleSearchAndFetch()}
                disabled={busy || !searchQuery.trim()}
                className="btn-primary flex-1 sm:text-lg"
              >
                {citySearchLoading ? t.searchSearching : t.checkStatus}
              </button>
              <button
                type="button"
                onClick={handleShowAll}
                disabled={busy}
                className="btn-secondary-glass shrink-0 sm:min-w-[120px]"
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
                    className="shrink-0 rounded-full border border-indigo-500/40 bg-[rgba(99,102,241,0.15)] px-3 py-1.5 text-sm font-medium text-indigo-300 shadow-sm transition hover:border-indigo-400 hover:bg-indigo-500 hover:text-white"
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            {sorted === undefined ? (
              <div className="glass min-h-[500px] w-full animate-pulse rounded-2xl border border-white/10" />
            ) : (
              <IndiaHeroMapPanel
                red={indiaCounts.red}
                yellow={indiaCounts.yellow}
                green={indiaCounts.green}
                locale={locale}
                reports={sorted}
                onCitySelect={(city) => setSearchQuery(city)}
              />
            )}
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-3 py-2 sm:flex-row sm:items-center sm:gap-4">
        <button
          type="button"
          onClick={handleFetchLiveNews}
          disabled={busy}
          className="btn-primary w-full sm:w-auto sm:min-w-[200px]"
        >
          {fetchLoading ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              {t.fetchLiveNewsLoading}
            </span>
          ) : (
            t.fetchLiveNews
          )}
        </button>
        <button
          type="button"
          onClick={handleClearAll}
          disabled={busy}
          className="btn-secondary-glass shrink-0"
        >
          {clearLoading ? t.clearAllLoading : t.clearAll}
        </button>
      </div>

      {fetchBanner ? (
        <p
          role="status"
          className={
            fetchBanner.kind === "success"
              ? "rounded-xl border border-green-500/30 bg-gradient-to-r from-green-900/40 to-emerald-900/30 px-4 py-3 text-base font-medium text-green-100"
              : "rounded-xl border border-red-500/40 bg-red-950/40 px-4 py-3 text-base font-medium text-red-200"
          }
        >
          {fetchBanner.kind === "success" ? `✅ ${fetchBanner.text}` : fetchBanner.text}
        </p>
      ) : null}

      {lastUpdated ? (
        <p className="text-sm text-[var(--text-secondary)]">
          {t.lastUpdated}: {lastUpdated}
        </p>
      ) : null}

      {showingResultsLine ? (
        <p className="text-base font-medium text-white/90">{showingResultsLine}</p>
      ) : null}

      <section className="py-2" aria-label="Status summary">
        <StatusSummary reports={filteredReports} locale={locale} />
      </section>

      {recommendationStatus !== undefined ? (
        <section className="py-2" aria-label="Recommendations">
          <Recommendations status={recommendationStatus} locale={locale} />
        </section>
      ) : null}

      <div className="grid gap-10 py-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,340px)]">
        <div className="order-2 flex min-w-0 flex-col gap-8 lg:order-1">
          <section
            id="reports"
            className="flex flex-col gap-8 scroll-mt-28"
            aria-label="Reports"
          >
            {sorted === undefined || filteredReports === undefined ? (
              <LoadingSkeleton />
            ) : sorted.length === 0 ? (
              <p className="glass rounded-2xl border border-white/10 p-6 text-center text-base text-[var(--text-secondary)]">
                {t.emptyReports}{" "}
                {t.emptyReportsHint}{" "}
                <code className="rounded bg-white/10 px-1 text-indigo-200">npm run seed</code>{" "}
                {t.emptyReportsHintEnd}
              </p>
            ) : filteredReports.length === 0 ? (
              <p className="glass rounded-2xl border border-white/10 p-6 text-center text-base text-[var(--text-secondary)]">
                {t.noSearchMatches}
              </p>
            ) : (
              filteredReports.map((report, i) => (
                <ReportCard
                  key={report._id}
                  report={report}
                  locale={locale}
                  index={i}
                />
              ))
            )}
          </section>
        </div>

        {showAreaColumn ? (
          <div className="order-1 lg:order-2">
            {filteredReports === undefined ? (
              <div className="glass h-64 animate-pulse rounded-2xl border border-white/10" />
            ) : showAreaEmpty ? (
              <div
                className="glass rounded-2xl border border-amber-500/30 p-6 text-center text-[var(--text-secondary)]"
                role="status"
              >
                {t.areaStatusNoData.replace("{city}", activeFilter)}
              </div>
            ) : areaCounts ? (
              <AreaStatusCard
                cityLabel={activeFilter}
                red={areaCounts.red}
                yellow={areaCounts.yellow}
                green={areaCounts.green}
                locale={locale}
              />
            ) : null}
          </div>
        ) : null}
      </div>

      <SiteFooter locale={locale} />
      <MobileBottomNav locale={locale} />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="glass h-40 rounded-2xl border border-white/10 shimmer"
        />
      ))}
    </div>
  );
}
