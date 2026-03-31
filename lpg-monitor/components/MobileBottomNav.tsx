"use client";

import { Locale, translations } from "@/lib/translations";

type Props = {
  locale: Locale;
};

export function MobileBottomNav({ locale }: Props) {
  const t = translations[locale];

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function focusSearch() {
    document.getElementById("city-search")?.focus();
  }

  function scrollToReports() {
    document.getElementById("reports")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <nav
      className="glass fixed bottom-0 left-0 right-0 z-50 rounded-t-[20px] border border-b-0 border-white/10 px-4 pb-safe pt-3 lg:hidden"
      aria-label={t.mobileNavHome}
    >
      <div className="mx-auto flex max-w-lg items-center justify-around gap-2">
        <button
          type="button"
          onClick={scrollToTop}
          className="flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-xs text-white/80 transition hover:bg-white/10 hover:text-white"
        >
          <span className="text-lg" aria-hidden>
            ⌂
          </span>
          {t.mobileNavHome}
        </button>
        <button
          type="button"
          onClick={focusSearch}
          className="flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-xs text-white/80 transition hover:bg-white/10 hover:text-white"
        >
          <span className="text-lg" aria-hidden>
            🔍
          </span>
          {t.mobileNavSearch}
        </button>
        <button
          type="button"
          onClick={scrollToReports}
          className="flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-xs text-white/80 transition hover:bg-white/10 hover:text-white"
        >
          <span className="text-lg" aria-hidden>
            ⚠
          </span>
          {t.mobileNavAlerts}
        </button>
      </div>
    </nav>
  );
}
