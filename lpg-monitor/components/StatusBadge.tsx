import { Locale, translations } from "@/lib/translations";

const styles: Record<string, string> = {
  red: "bg-red-100 text-red-800 border-red-400",
  yellow: "bg-yellow-100 text-yellow-800 border-yellow-400",
  green: "bg-green-100 text-green-800 border-green-400",
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
