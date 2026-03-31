"use client";

import { Locale, translations } from "@/lib/translations";

type Props = {
  locale: Locale;
};

export function SiteFooter({ locale }: Props) {
  const t = translations[locale];

  return (
    <footer
      className="glass mt-12 border-t border-indigo-500/30 bg-[#0A0A0F] px-4 py-8 pb-28 text-sm text-gray-500 sm:px-6 lg:pb-8"
      lang={locale}
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-semibold text-gray-400">{t.footerBrand}</p>
          <p className="mt-1 max-w-md leading-relaxed">{t.footerTagline}</p>
        </div>
        <p className="max-w-md text-right leading-relaxed sm:text-left">
          ⚠️ {t.disclaimer}
        </p>
      </div>
    </footer>
  );
}
