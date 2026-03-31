import { Locale, translations } from "@/lib/translations";

const styles: Record<string, string> = {
  red: "border-red-500/50 bg-red-500/15 text-red-200",
  yellow: "border-yellow-500/50 bg-yellow-500/15 text-yellow-200",
  green: "border-green-500/50 bg-green-500/15 text-green-200",
};

function badgeLabel(status: string, locale: Locale): string {
  const t = translations[locale];
  if (status === "red") return t.critical;
  if (status === "yellow") return t.moderate;
  return t.normal;
}

type Props = {
  status: string;
  locale: Locale;
};

export function StatusBadge({ status, locale }: Props) {
  const key = status === "red" || status === "yellow" || status === "green" ? status : "green";
  const className = styles[key] ?? styles.green;

  return (
    <span
      className={`inline-block rounded border px-2 py-1 text-xs font-bold uppercase tracking-wide ${className}`}
    >
      {badgeLabel(status, locale)}
    </span>
  );
}
