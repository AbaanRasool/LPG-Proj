"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useMemo, useState } from "react";
import { Locale, translations } from "@/lib/translations";
import { LanguageToggle } from "@/components/LanguageToggle";
import { StatusSummary } from "@/components/StatusSummary";
import { ReportCard } from "@/components/ReportCard";

export function Dashboard() {
  const reports = useQuery(api.reports.getAllReports);
  const [locale, setLocale] = useState<Locale>("en");
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

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-4 py-6 pb-28 sm:px-6">
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

      {lastUpdated ? (
        <p className="text-sm text-gray-600">
          {t.lastUpdated}: {lastUpdated}
        </p>
      ) : null}

      <StatusSummary reports={reports} locale={locale} />

      <section className="flex flex-col gap-4" aria-label="Reports">
        {sorted === undefined ? (
          <LoadingSkeleton />
        ) : sorted.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-base text-gray-600">
            No reports yet. Run{" "}
            <code className="rounded bg-gray-100 px-1">npm run seed</code> to load demo
            data.
          </p>
        ) : (
          sorted.map((report) => (
            <ReportCard key={report._id} report={report} locale={locale} />
          ))
        )}
      </section>

      <footer className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white/95 px-4 py-3 text-sm text-gray-700 backdrop-blur sm:text-base">
        <p className="mx-auto max-w-2xl text-center leading-snug">⚠️ {t.disclaimer}</p>
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
