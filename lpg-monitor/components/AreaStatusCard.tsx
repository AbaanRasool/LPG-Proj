"use client";

import { Locale, translations } from "@/lib/translations";

export type AreaOverallLevel = "red" | "yellow" | "green";

/** red >= 2 → critical; red === 1 || yellow >= 3 → moderate; else normal. */
export function computeOverallAreaStatus(
  red: number,
  yellow: number,
  green: number,
): AreaOverallLevel {
  void green;
  if (red >= 2) return "red";
  if (red === 1 || yellow >= 3) return "yellow";
  return "green";
}

const BORDER: Record<AreaOverallLevel, string> = {
  red: "border-red-500/80",
  yellow: "border-yellow-500/80",
  green: "border-green-500/80",
};

const RING_BORDER: Record<AreaOverallLevel, string> = {
  red: "border-red-500/70",
  yellow: "border-amber-400/70",
  green: "border-emerald-500/70",
};

const GLOW: Record<AreaOverallLevel, string> = {
  red: "bg-red-500 shadow-[0_0_28px_rgba(239,68,68,0.55)]",
  yellow: "bg-amber-400 shadow-[0_0_28px_rgba(245,158,11,0.5)]",
  green: "bg-emerald-500 shadow-[0_0_28px_rgba(16,185,129,0.5)]",
};

const LABEL: Record<AreaOverallLevel, "critical" | "moderate" | "normal"> = {
  red: "critical",
  yellow: "moderate",
  green: "normal",
};

type Props = {
  cityLabel: string;
  red: number;
  yellow: number;
  green: number;
  locale: Locale;
};

export function AreaStatusCard({ cityLabel, red, yellow, green, locale }: Props) {
  const t = translations[locale];
  const level = computeOverallAreaStatus(red, yellow, green);
  const labelKey = LABEL[level];
  const ringClass = RING_BORDER[level];

  const desc =
    level === "red"
      ? t.areaStatusCriticalDesc
      : level === "yellow"
        ? t.areaStatusModerateDesc
        : t.areaStatusNormalDesc;

  return (
    <aside
      lang={locale}
      className={`glass card-hover sticky top-24 rounded-2xl border-2 ${BORDER[level]} p-8 pb-10 lg:max-w-md`}
      aria-labelledby="area-status-title"
    >
      <h2 id="area-status-title" className="text-lg font-bold uppercase tracking-wide text-white">
        📍 {t.areaStatusTitle}
      </h2>
      <p className="mt-2 border-b border-white/10 pb-3 text-base font-semibold text-indigo-200">
        {cityLabel}
      </p>

      <div className="relative mx-auto mt-10 flex h-64 w-full max-w-[280px] items-center justify-center">
        <span
          className={`pointer-events-none absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 ${ringClass} animate-radar`}
          style={{ animationDelay: "0s" }}
        />
        <span
          className={`pointer-events-none absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 ${ringClass} animate-radar`}
          style={{ animationDelay: "0.6s" }}
        />
        <span
          className={`pointer-events-none absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 ${ringClass} animate-radar`}
          style={{ animationDelay: "1.2s" }}
        />
        <span
          className={`relative z-10 h-16 w-16 rounded-full ${GLOW[level]}`}
          aria-hidden
        />
      </div>

      <p className="mt-8 text-center text-3xl font-bold uppercase tracking-[0.3em] text-white">
        {t[labelKey]}
      </p>
      <p className="mt-4 text-center text-sm leading-relaxed text-[var(--text-secondary)]">{desc}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm">
        <span className="glass rounded-xl border border-red-500/30 px-3 py-2 text-red-300">
          {red} 🔴
        </span>
        <span className="glass rounded-xl border border-amber-500/30 px-3 py-2 text-amber-200">
          {yellow} 🟡
        </span>
        <span className="glass rounded-xl border border-emerald-500/30 px-3 py-2 text-emerald-300">
          {green} 🟢
        </span>
      </div>
    </aside>
  );
}
