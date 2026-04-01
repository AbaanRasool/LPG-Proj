"use client";

import { Doc } from "@/convex/_generated/dataModel";
import { Locale, translations } from "@/lib/translations";

type MapStatus = "red" | "yellow" | "green";

const MAP_CITIES = [
  { name: "Delhi", x: "42%", y: "20%" },
  { name: "Noida", x: "47%", y: "22%" },
  { name: "Jaipur", x: "34%", y: "28%" },
  { name: "Kolkata", x: "70%", y: "38%" },
  { name: "Mumbai", x: "28%", y: "52%" },
  { name: "Hyderabad", x: "44%", y: "58%" },
  { name: "Pune", x: "32%", y: "56%" },
  { name: "Bangalore", x: "40%", y: "70%" },
  { name: "Chennai", x: "48%", y: "72%" },
] as const;

function statusForCity(reports: Doc<"reports">[], cityName: string): MapStatus {
  const q = cityName.toLowerCase();
  const matching = reports.filter((r) =>
    (r.area || "").toLowerCase().includes(q),
  );
  if (matching.length === 0) return "green";
  if (matching.some((r) => r.status === "red")) return "red";
  if (matching.some((r) => r.status === "yellow")) return "yellow";
  return "green";
}

type Props = {
  red: number;
  yellow: number;
  green: number;
  locale: Locale;
  reports: Doc<"reports">[];
  onCitySelect: (city: string) => void;
};

export function IndiaHeroMapPanel({
  red,
  yellow,
  green,
  locale,
  reports,
  onCitySelect,
}: Props) {
  const t = translations[locale];
  const total = red + yellow + green;
  const pct = total === 0 ? 0 : Math.round((red / total) * 100);
  const cityCount = MAP_CITIES.length;

  return (
    <div className="relative flex h-full min-h-[500px] w-full flex-col gap-4">
      <div
        style={{
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "16px",
          padding: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "12px",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#10B981",
              animation: "pulse-dot 2s infinite",
            }}
          />
          <span
            style={{
              color: "#10B981",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.1em",
            }}
          >
            {t.indiaLiveMonitoring}
          </span>
        </div>
        <div
          style={{
            fontSize: "28px",
            fontWeight: 800,
            color: "white",
            marginBottom: "8px",
          }}
        >
          {t.indiaCriticalPct.replace("{pct}", String(pct))}
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "16px",
            fontSize: "13px",
          }}
        >
          <span style={{ color: "#EF4444" }}>
            {red} {t.critical}
          </span>
          <span style={{ color: "#F59E0B" }}>
            {yellow} {t.moderate}
          </span>
          <span style={{ color: "#10B981" }}>
            {green} {t.normal}
          </span>
        </div>
      </div>

      <div
        style={{
          position: "relative",
          flex: 1,
          background: "rgba(255,255,255,0.03)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "16px",
          overflow: "hidden",
          minHeight: "280px",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `radial-gradient(
              circle,
              rgba(99,102,241,0.35) 1.5px,
              transparent 1.5px
            )`,
            backgroundSize: "24px 24px",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(
              ellipse 70% 80% at 48% 48%,
              rgba(99,102,241,0.06) 0%,
              transparent 70%
            )`,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "12px",
            left: "16px",
            fontSize: "11px",
            color: "rgba(255,255,255,0.4)",
            fontWeight: 600,
            letterSpacing: "0.1em",
            zIndex: 20,
          }}
        >
          {t.mapTitle}
        </div>

        {MAP_CITIES.map((city, i) => {
          const status = statusForCity(reports, city.name);
          return (
            <button
              key={city.name}
              type="button"
              onClick={() => {
                onCitySelect(city.name);
                document.getElementById("city-search")?.focus();
              }}
              style={{
                position: "absolute",
                left: city.x,
                top: city.y,
                transform: "translate(-50%, -50%)",
                zIndex: 10,
                padding: 0,
                border: "none",
                background: "transparent",
                cursor: "pointer",
                animationDelay: `${i * 0.2}s`,
              }}
              aria-label={`${city.name}, ${status}`}
            >
              <div
                style={{
                  position: "absolute",
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  background:
                    status === "red"
                      ? "rgba(239,68,68,0.15)"
                      : status === "yellow"
                        ? "rgba(245,158,11,0.15)"
                        : "rgba(16,185,129,0.15)",
                  animation: `pulse-dot ${2 + i * 0.3}s infinite`,
                }}
              />
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background:
                    status === "red"
                      ? "#EF4444"
                      : status === "yellow"
                        ? "#F59E0B"
                        : "#10B981",
                  boxShadow:
                    status === "red"
                      ? "0 0 12px rgba(239,68,68,1)"
                      : status === "yellow"
                        ? "0 0 12px rgba(245,158,11,1)"
                        : "0 0 12px rgba(16,185,129,1)",
                  position: "relative",
                  zIndex: 11,
                  transition: "transform 0.2s ease",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "14px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  fontSize: "9px",
                  color: "rgba(255,255,255,0.75)",
                  whiteSpace: "nowrap",
                  background: "rgba(0,0,0,0.7)",
                  padding: "2px 5px",
                  borderRadius: "4px",
                  fontWeight: 500,
                  zIndex: 12,
                  pointerEvents: "none",
                }}
              >
                {city.name}
              </div>
            </button>
          );
        })}
      </div>

      <div
        style={{
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "100px",
          padding: "10px 20px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <span
          style={{
            color: "#EF4444",
            fontSize: "12px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#EF4444",
              display: "inline-block",
              boxShadow: "0 0 6px #EF4444",
            }}
          />
          {t.mapMonitoringCities.replace("{count}", String(cityCount))}
        </span>
        <span style={{ color: "rgba(255,255,255,0.2)" }}>|</span>
        <span
          style={{
            color: "#10B981",
            fontSize: "12px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#10B981",
              display: "inline-block",
              animation: "pulse-dot 2s infinite",
              boxShadow: "0 0 6px #10B981",
            }}
          />
          {t.mapLiveUpdates}
        </span>
        <span style={{ color: "rgba(255,255,255,0.2)" }}>|</span>
        <span
          style={{
            color: "#6366F1",
            fontSize: "12px",
            fontWeight: 600,
          }}
        >
          {t.mapAllIndia}
        </span>
      </div>
    </div>
  );
}
