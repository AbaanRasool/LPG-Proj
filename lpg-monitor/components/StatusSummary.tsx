"use client";

import { Doc } from "@/convex/_generated/dataModel";
import { Locale, translations } from "@/lib/translations";

type Props = {
  reports: Doc<"reports">[] | undefined;
  locale: Locale;
};

export function StatusSummary({ reports, locale }: Props) {
  const t = translations[locale];

  if (reports === undefined) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-[52px] animate-pulse rounded-lg border-2 border-gray-200 bg-gray-100"
          />
        ))}
      </div>
    );
  }

  const red = reports.filter((r) => r.status === "red").length;
  const yellow = reports.filter((r) => r.status === "yellow").length;
  const green = reports.filter((r) => r.status === "green").length;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div className="flex min-h-[52px] items-center justify-center gap-2 rounded-lg border-2 border-red-200 bg-red-50 px-3 py-3 text-center text-red-900">
        <span className="text-xl" aria-hidden>
          🔴
        </span>
        <span className="text-base font-bold">
          {red} {t.critical}
        </span>
      </div>
      <div className="flex min-h-[52px] items-center justify-center gap-2 rounded-lg border-2 border-yellow-200 bg-yellow-50 px-3 py-3 text-center text-yellow-900">
        <span className="text-xl" aria-hidden>
          🟡
        </span>
        <span className="text-base font-bold">
          {yellow} {t.moderate}
        </span>
      </div>
      <div className="flex min-h-[52px] items-center justify-center gap-2 rounded-lg border-2 border-green-200 bg-green-50 px-3 py-3 text-center text-green-900">
        <span className="text-xl" aria-hidden>
          🟢
        </span>
        <span className="text-base font-bold">
          {green} {t.normal}
        </span>
      </div>
    </div>
  );
}
