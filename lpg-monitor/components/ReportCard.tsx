"use client";

import { Doc } from "@/convex/_generated/dataModel";
import { Locale, translations } from "@/lib/translations";
import { StatusBadge } from "@/components/StatusBadge";

type Props = {
  report: Doc<"reports">;
  locale: Locale;
};

function cardShellClass(status: string): string {
  if (status === "red") {
    return "border-red-400 bg-red-50 text-red-800";
  }
  if (status === "yellow") {
    return "border-yellow-400 bg-yellow-50 text-yellow-800";
  }
  return "border-green-400 bg-green-50 text-green-800";
}

export function ReportCard({ report, locale }: Props) {
  const t = translations[locale];
  const shell = cardShellClass(report.status);
  const summaryText = locale === "hi" ? report.hindiSummary : report.summary;
  const sourceDisplay = report.source?.trim() || "—";
  const dateDisplay = report.publishedAt?.trim() || "—";
  const linkHref = report.sourceUrl?.trim() || "#";

  return (
    <article
      lang={locale}
      className={`flex flex-col gap-3 rounded-xl border-2 p-4 shadow-sm ${shell}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span aria-hidden className="text-lg">
          {report.status === "red" ? "🔴" : report.status === "yellow" ? "🟡" : "🟢"}
        </span>
        <StatusBadge status={report.status} locale={locale} />
      </div>
      <h2 className="text-lg font-bold leading-snug">{report.title}</h2>
      {locale === "en" ? (
        <>
          <p className="text-sm font-medium opacity-90">{report.plainLanguageLabel}</p>
          <p className="text-base leading-relaxed">{summaryText}</p>
        </>
      ) : (
        <p className="text-base leading-relaxed">{summaryText}</p>
      )}

      <div className="mt-auto flex flex-col gap-3 border-t border-black/10 pt-3">
        <div className="flex flex-col gap-1 text-sm text-gray-600 sm:flex-row sm:flex-wrap sm:gap-x-4">
          <span>
            📍 <span className="font-medium text-gray-700">{t.area}:</span> {report.area}
          </span>
          <span>
            📰 <span className="font-medium text-gray-700">{t.source}:</span> {sourceDisplay}
          </span>
          <span>
            📅 <span className="font-medium text-gray-700">{t.date}:</span> {dateDisplay}
          </span>
        </div>
        <a
          href={linkHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[44px] items-center text-base font-semibold underline underline-offset-4"
        >
          {t.readOriginal}
        </a>
      </div>
    </article>
  );
}
