"use client";

import { Locale, translations } from "@/lib/translations";

type Props = {
  red: number;
  yellow: number;
  green: number;
  locale: Locale;
};

export function IndiaOverviewWidget({ red, yellow, green, locale }: Props) {
  const t = translations[locale];
  const total = red + yellow + green;
  const pct =
    total === 0 ? 0 : Math.round((red / total) * 100);

  return (
    <div
      className="glass relative overflow-hidden rounded-2xl border border-white/10 p-5 shadow-xl animate-float"
      aria-label={t.indiaOverviewTitle}
    >
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        {t.indiaLiveMonitoring}
      </div>
      <p className="mt-3 text-2xl font-bold text-white">
        {t.indiaCriticalPct.replace("{pct}", String(pct))}
      </p>
      <div className="mt-4 flex gap-4 text-sm text-[var(--text-secondary)]">
        <span>
          <span className="font-semibold text-red-400">{red}</span> {t.critical}
        </span>
        <span>
          <span className="font-semibold text-yellow-400">{yellow}</span>{" "}
          {t.moderate}
        </span>
        <span>
          <span className="font-semibold text-green-400">{green}</span> {t.normal}
        </span>
      </div>
    </div>
  );
}
