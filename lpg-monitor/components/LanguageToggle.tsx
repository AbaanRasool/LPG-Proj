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
      className="min-h-[44px] min-w-[44px] rounded-lg border-2 border-gray-800 bg-white px-4 py-2 text-base font-semibold text-gray-900 shadow-sm active:scale-[0.98]"
    >
      {label}
    </button>
  );
}
