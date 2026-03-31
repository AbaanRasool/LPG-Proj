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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="glass h-36 rounded-2xl border border-white/10 shimmer"
          />
        ))}
      </div>
    );
  }

  const red = reports.filter((r) => r.status === "red").length;
  const yellow = reports.filter((r) => r.status === "yellow").length;
  const green = reports.filter((r) => r.status === "green").length;

  return (
    <div className="-mx-2 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0">
      <div className="glass card-hover relative min-w-[240px] shrink-0 snap-center overflow-hidden rounded-2xl border border-white/10 border-t-[3px] border-t-red-500 px-4 py-6 text-center shadow-[0_-4px_20px_rgba(239,68,68,0.35)] animate-glow-red sm:min-w-0 sm:shrink">
        <span className="text-5xl font-bold tabular-nums text-white animate-count-up">
          {red}
        </span>
        <span className="mt-2 block text-sm font-bold uppercase tracking-wider text-red-300">
          {t.statusSummaryCritical}
        </span>
        <span className="mt-1 block text-xs text-[var(--text-secondary)]">{t.areasLabel}</span>
        <span className="mt-2 block text-xs text-white/50">{t.trendCritical}</span>
      </div>
      <div className="glass card-hover relative min-w-[240px] shrink-0 snap-center overflow-hidden rounded-2xl border border-white/10 border-t-[3px] border-t-amber-500 px-4 py-6 text-center shadow-[0_-4px_20px_rgba(245,158,11,0.35)] animate-glow-yellow sm:min-w-0 sm:shrink">
        <span className="text-5xl font-bold tabular-nums text-white animate-count-up">
          {yellow}
        </span>
        <span className="mt-2 block text-sm font-bold uppercase tracking-wider text-amber-200">
          {t.statusSummaryModerate}
        </span>
        <span className="mt-1 block text-xs text-[var(--text-secondary)]">{t.areasLabel}</span>
        <span className="mt-2 block text-xs text-white/50">{t.trendModerate}</span>
      </div>
      <div className="glass card-hover relative min-w-[240px] shrink-0 snap-center overflow-hidden rounded-2xl border border-white/10 border-t-[3px] border-t-emerald-500 px-4 py-6 text-center shadow-[0_-4px_20px_rgba(16,185,129,0.35)] animate-glow-green sm:min-w-0 sm:shrink">
        <span className="text-5xl font-bold tabular-nums text-white animate-count-up">
          {green}
        </span>
        <span className="mt-2 block text-sm font-bold uppercase tracking-wider text-emerald-200">
          {t.statusSummaryNormal}
        </span>
        <span className="mt-1 block text-xs text-[var(--text-secondary)]">{t.areasLabel}</span>
        <span className="mt-2 block text-xs text-white/50">{t.trendNormal}</span>
      </div>
    </div>
  );
}
