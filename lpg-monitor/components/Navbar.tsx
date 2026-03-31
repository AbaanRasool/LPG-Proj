"use client";

import { Locale, translations } from "@/lib/translations";
import { LanguageToggle } from "@/components/LanguageToggle";

type Props = {
  locale: Locale;
  onLocaleChange: () => void;
};

export function Navbar({ locale, onLocaleChange }: Props) {
  const t = translations[locale];

  return (
    <header className="relative z-40 px-4 pt-4 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <nav
          className="glass flex flex-wrap items-center justify-between gap-3 rounded-full border border-white/10 px-4 py-3 pl-5 shadow-[0_12px_40px_rgba(0,0,0,0.55),0_8px_24px_rgba(99,102,241,0.12)] sm:px-6"
          aria-label="Primary"
        >
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse-dot" />
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-base font-bold text-white sm:text-lg">
                {t.appName}
              </h1>
              <p className="truncate text-xs text-[var(--text-secondary)]">
                {t.navSubtitle}
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-1 sm:flex">
            <a
              href="#top"
              className="rounded-full px-3 py-1.5 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              {t.navHome}
            </a>
            <a
              href="#city-search"
              className="rounded-full px-3 py-1.5 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              {t.navCities}
            </a>
            <a
              href="#reports"
              className="rounded-full px-3 py-1.5 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              {t.navAlerts}
            </a>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 sm:inline-flex"
              aria-hidden
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </span>
            <LanguageToggle locale={locale} onToggle={onLocaleChange} />
          </div>
        </nav>
        <div
          className="relative mt-4 h-[2px] w-full overflow-hidden rounded-full bg-white/10"
          aria-hidden
        >
          <div className="h-full w-0 animate-live-bar rounded-full bg-[#6366F1]" />
        </div>
      </div>
    </header>
  );
}
