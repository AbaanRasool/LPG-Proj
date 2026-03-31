"use client";

import { Locale, translations } from "@/lib/translations";

type Props = {
  locale: Locale;
  onToggle: () => void;
};

export function LanguageToggle({ locale, onToggle }: Props) {
  const label = translations[locale].switchLang;

  return (
    <button
      type="button"
      onClick={onToggle}
      className="min-h-[44px] min-w-[44px] rounded-full border border-indigo-400/40 bg-indigo-500/20 px-4 py-2 text-sm font-semibold text-indigo-200 shadow-inner transition hover:bg-indigo-500/35 active:scale-[0.98]"
    >
      {label}
    </button>
  );
}
