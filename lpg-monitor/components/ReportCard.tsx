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
  const summary = locale === "hi" ? report.hindiSummary : report.summary;
  const shell = cardShellClass(report.status);

  return (
    <article
      className={`flex flex-col gap-3 rounded-xl border-2 p-4 shadow-sm ${shell}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span aria-hidden className="text-lg">
          {report.status === "red" ? "🔴" : report.status === "yellow" ? "🟡" : "🟢"}
        </span>
        <StatusBadge status={report.status} locale={locale} />
      </div>
      <h2 className="text-lg font-bold leading-snug">{report.title}</h2>
      <p className="text-sm font-medium opacity-90">{report.plainLanguageLabel}</p>
      <p className="text-base leading-relaxed">{summary}</p>
      <div className="flex flex-col gap-1 text-sm text-gray-600 sm:flex-row sm:flex-wrap sm:gap-x-4">
        <span>
          📍 <span className="font-medium text-gray-700">{t.area}:</span> {report.area}
        </span>
        <span>
          📰 <span className="font-medium text-gray-700">{t.source}:</span> {report.source}
        </span>
        <span>
          📅 <span className="font-medium text-gray-700">{t.date}:</span>{" "}
          {report.publishedAt}
        </span>
      </div>
      <a
        href={report.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 inline-flex min-h-[44px] items-center text-base font-semibold underline underline-offset-4"
      >
        {t.readOriginal}
      </a>
    </article>
  );
}
