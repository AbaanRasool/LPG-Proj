"use client";

import { Doc } from "@/convex/_generated/dataModel";
import { Locale, translations } from "@/lib/translations";
import { StatusBadge } from "@/components/StatusBadge";

type Props = {
  report: Doc<"reports">;
  locale: Locale;
  index: number;
};

function leftBorderClass(status: string): string {
  if (status === "red") return "border-l-red-500";
  if (status === "yellow") return "border-l-amber-500";
  return "border-l-emerald-500";
}

function leftGlowClass(status: string): string {
  if (status === "red") {
    return "shadow-[-4px_0_15px_rgba(239,68,68,0.4)]";
  }
  if (status === "yellow") {
    return "shadow-[-4px_0_15px_rgba(245,158,11,0.4)]";
  }
  return "shadow-[-4px_0_15px_rgba(16,185,129,0.35)]";
}

function staggerDelay(index: number): string {
  const ms = Math.min(index, 5) * 50;
  return `${ms}ms`;
}

export function ReportCard({ report, locale, index }: Props) {
  const t = translations[locale];
  const summaryText = locale === "hi" ? report.hindiSummary : report.summary;
  const sourceDisplay = report.source?.trim() || "—";
  const dateDisplay = report.publishedAt?.trim() || "—";
  const sourceUrl = report.sourceUrl?.trim();
  const borderAccent = leftBorderClass(report.status);
  const leftGlow = leftGlowClass(report.status);

  return (
    <article
      lang={locale}
      style={{ animationDelay: staggerDelay(index) }}
      className={`glass card-hover flex animate-slide-up flex-col gap-4 rounded-[20px] border border-white/10 border-l-4 opacity-0 [animation-fill-mode:forwards] ${borderAccent} ${leftGlow} p-6 shadow-lg`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span aria-hidden className="text-lg">
          {report.status === "red" ? "🔴" : report.status === "yellow" ? "🟡" : "🟢"}
        </span>
        <StatusBadge status={report.status} locale={locale} />
      </div>
      <h2 className="text-xl font-bold leading-snug text-white">{report.title}</h2>
      {locale === "en" ? (
        <>
          <p className="text-sm font-medium italic text-indigo-300">
            {report.plainLanguageLabel}
          </p>
          <p className="text-base leading-relaxed text-gray-300">{summaryText}</p>
        </>
      ) : (
        <p className="text-base leading-relaxed text-gray-300">{summaryText}</p>
      )}

      <div className="mt-auto flex flex-col gap-3 border-t border-white/10 pt-4">
        <div className="flex flex-col gap-1 text-sm text-[var(--text-secondary)] sm:flex-row sm:flex-wrap sm:gap-x-4">
          <span>
            📍 <span className="font-medium text-white/80">{t.area}:</span> {report.area}
          </span>
          <span>
            📰 <span className="font-medium text-white/80">{t.source}:</span>{" "}
            {sourceDisplay}
          </span>
          <span>
            📅 <span className="font-medium text-white/80">{t.date}:</span> {dateDisplay}
          </span>
        </div>
        {sourceUrl ? (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center text-base font-semibold text-[#A5B4FC] underline-offset-4 transition-all duration-200 ease-in-out hover:text-white hover:underline"
          >
            {t.readOriginal}
          </a>
        ) : null}
      </div>
    </article>
  );
}
