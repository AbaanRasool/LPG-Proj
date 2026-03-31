"use client";

import { useEffect, useMemo, useState } from "react";
import { Doc } from "@/convex/_generated/dataModel";
import { Locale, translations } from "@/lib/translations";

export type RecommendationStatus = "red" | "yellow" | "green";

/** Uses current filtered report list: any red → red; else if yellow > green → yellow; else green. */
export function overallRecommendationStatus(
  reports: Doc<"reports">[],
): RecommendationStatus {
  if (reports.length === 0) return "green";
  const red = reports.filter((r) => r.status === "red").length;
  const yellow = reports.filter((r) => r.status === "yellow").length;
  const green = reports.filter((r) => r.status === "green").length;
  if (red > 0) return "red";
  if (yellow > green) return "yellow";
  return "green";
}

type Block = {
  title: string;
  subtitle: string;
  tips: string[];
  showMore: string;
  showLess: string;
};

const CONTENT: Record<Locale, Record<RecommendationStatus, Block>> = {
  en: {
    red: {
      title: "🚨 Critical Shortage Alert!",
      subtitle: "Immediate actions to take:",
      tips: [
        "🍳 Switch to electric induction cooktop temporarily — available at Rs 500-1500",
        "🌿 Use pressure cooker to save 30% gas per meal",
        "📱 Book cylinder immediately on HP Gas / Indane / Bharat Gas app before stock runs out",
        "🪵 For emergencies — use community kitchen or neighbors",
        "☀️ Try solar cooker if available in your area",
        "🛒 Buy pre-cooked or ready-to-eat meals for 2-3 days as backup",
        "🔥 Cook multiple meals at once to save remaining gas",
      ],
      showMore: "Show More Tips ▼",
      showLess: "Show Less ▲",
    },
    yellow: {
      title: "⚠️ Moderate Concern — Be Prepared",
      subtitle: "Precautions to take now:",
      tips: [
        "📱 Book your next cylinder NOW before shortage gets worse",
        "🍳 Avoid wasting gas — turn off flame immediately after cooking",
        "🫙 Keep 1 extra cylinder booked as backup always",
        "♨️ Use microwave or electric kettle for small tasks like boiling water",
        "🥘 Cook in bulk — make dal/sabzi for 2 days at once to save gas",
        "📊 Monitor this app daily for status updates in your area",
      ],
      showMore: "Show More Tips ▼",
      showLess: "Show Less ▲",
    },
    green: {
      title: "✅ Supply Normal — Stay Smart",
      subtitle: "Good habits to maintain:",
      tips: [
        "📅 Book cylinder on time — don't wait for it to run out completely",
        "🔍 Check for gas leaks regularly — apply soap water on joints",
        "💰 Use PM Ujjwala Yojana if eligible for subsidised cylinders",
        "📱 Register on your gas provider app for instant updates",
        "🌱 Consider induction cooktop as backup for emergencies",
        "💡 Clean burners regularly for maximum gas efficiency",
      ],
      showMore: "Show More Tips ▼",
      showLess: "Show Less ▲",
    },
  },
  hi: {
    red: {
      title: "🚨 गंभीर कमी की चेतावनी!",
      subtitle: "तुरंत करें ये काम:",
      tips: [
        "🍳 अस्थायी रूप से इलेक्ट्रिक इंडक्शन चूल्हा इस्तेमाल करें — ₹500-1500 में उपलब्ध",
        "🌿 प्रेशर कुकर से खाना बनाएँ, प्रति भोजन लगभग 30% गैस बचेगी",
        "📱 HP Gas / Indane / Bharat Gas ऐप से तुरंत सिलेंडर बुक करें, स्टॉक खत्म होने से पहले",
        "🪵 आपातकाल में सामुदायिक रसोई या पड़ोसियों का सहारा लें",
        "☀️ यदि उपलब्ध हो तो सोलर कुकर आज़माएँ",
        "🛒 2-3 दिन के लिए तैयार भोजन खरीदकर बैकअप के रूप में रखें",
        "🔥 बची गैस बचाने के लिए एक साथ कई भोजन पकाएँ",
      ],
      showMore: "और सुझाव दिखाएँ ▼",
      showLess: "कम सुझाव दिखाएँ ▲",
    },
    yellow: {
      title: "⚠️ सतर्क रहें — तैयारी करें",
      subtitle: "अभी करें ये काम:",
      tips: [
        "📱 कमी बढ़ने से पहले अगला सिलेंडर अभी बुक करें",
        "🍳 गैस बर्बाद न करें — पकाने के बाद तुरंत आँच बंद करें",
        "🫙 हमेशा एक अतिरिक्त सिलेंडर बैकअप के लिए बुक रखें",
        "♨️ पानी उबालने जैसे छोटे कामों के लिए माइक्रोवेव या इलेक्ट्रिक केटल इस्तेमाल करें",
        "🥘 एक साथ ज़्यादा खाना बनाएँ — दो दिन के लिए दाल-सब्ज़ी एक साथ पकाएँ",
        "📊 अपने क्षेत्र के अपडेट के लिए रोज़ यह ऐप देखें",
      ],
      showMore: "और सुझाव दिखाएँ ▼",
      showLess: "कम सुझाव दिखाएँ ▲",
    },
    green: {
      title: "✅ सप्लाई सामान्य — स्मार्ट रहें",
      subtitle: "अच्छी आदतें बनाए रखें:",
      tips: [
        "📅 समय पर सिलेंडर बुक करें — पूरी तरह खत्म होने तक इंतज़ार न करें",
        "🔍 नियमित रूप से गैस लीक जाँचें — जोड़ों पर साबुन वाला पानी लगाएँ",
        "💰 योग्यता हो तो PM उज्ज्वला योजना से सब्सिडी वाला सिलेंडर लें",
        "📱 तुरंत अपडेट के लिए अपने गैस कंपनी के ऐप पर रजिस्टर करें",
        "🌱 आपातकाल के लिए इंडक्शन चूल्हा बैकअप के तौर पर सोचें",
        "💡 अधिकतम दक्षता के लिए बर्नर नियमित साफ़ रखें",
      ],
      showMore: "और सुझाव दिखाएँ ▼",
      showLess: "कम सुझाव दिखाएँ ▲",
    },
  },
};

const SHELL: Record<
  RecommendationStatus,
  { left: string; accent: string; check: string }
> = {
  red: {
    left: "border-l-red-500",
    accent: "border-t-red-500",
    check: "text-red-300",
  },
  yellow: {
    left: "border-l-yellow-500",
    accent: "border-t-yellow-500",
    check: "text-yellow-200",
  },
  green: {
    left: "border-l-green-500",
    accent: "border-t-green-500",
    check: "text-green-300",
  },
};

type TabId = "immediate" | "alternative" | "tips";

function splitTipsByTab(tips: string[]): Record<TabId, string[]> {
  const chunk = Math.ceil(tips.length / 3);
  return {
    immediate: tips.slice(0, chunk),
    alternative: tips.slice(chunk, chunk * 2),
    tips: tips.slice(chunk * 2),
  };
}

const INITIAL_VISIBLE = 3;

type Props = {
  status: RecommendationStatus;
  locale: Locale;
};

export function Recommendations({ status, locale }: Props) {
  const t = translations[locale];
  const [tab, setTab] = useState<TabId>("immediate");
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setExpanded(false);
    setTab("immediate");
  }, [status, locale]);

  const block = CONTENT[locale][status];
  const shell = SHELL[status];

  const byTab = useMemo(() => splitTipsByTab(block.tips), [block.tips]);
  const activeTips = byTab[tab];

  const { visibleTips, hiddenTips, hasHidden } = useMemo(() => {
    return {
      visibleTips: activeTips.slice(0, INITIAL_VISIBLE),
      hiddenTips: activeTips.slice(INITIAL_VISIBLE),
      hasHidden: activeTips.length > INITIAL_VISIBLE,
    };
  }, [activeTips]);

  const tabs: { id: TabId; label: string }[] = [
    { id: "immediate", label: t.recTabImmediate },
    { id: "alternative", label: t.recTabAlternative },
    { id: "tips", label: t.recTabTips },
  ];

  return (
    <aside
      lang={locale}
      className={`glass overflow-hidden rounded-2xl border border-white/10 border-t-[3px] ${shell.accent} border-l-4 ${shell.left} p-6 shadow-lg`}
      aria-labelledby="recommendations-title"
    >
      <h2
        id="recommendations-title"
        className="text-lg font-bold leading-snug text-white sm:text-xl"
      >
        {block.title}
      </h2>
      <p className="mt-1 text-base font-semibold text-indigo-300/90">{block.subtitle}</p>

      <div
        className="mt-4 flex flex-wrap gap-2 border-b border-white/10 pb-3"
        role="tablist"
        aria-label={t.recommendationsTitle}
      >
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => {
              setTab(item.id);
              setExpanded(false);
            }}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              tab === item.id
                ? "bg-indigo-500/30 text-indigo-100 ring-1 ring-indigo-400/40"
                : "text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <ul className="mt-4 flex flex-col gap-6 text-base leading-relaxed text-gray-300">
        {visibleTips.map((tip, i) => (
          <li key={`v-${tab}-${i}`} className="flex gap-3">
            <span className={`shrink-0 font-bold ${shell.check}`} aria-hidden>
              ✓
            </span>
            <span>{tip}</span>
          </li>
        ))}
      </ul>

      {hasHidden ? (
        <>
          <div
            className={`overflow-hidden transition-[max-height] duration-[400ms] ease-in-out ${
              expanded ? "max-h-[600px]" : "max-h-0"
            }`}
          >
            <ul className="mt-6 flex flex-col gap-6 border-t border-white/10 pt-6 text-base leading-relaxed text-gray-300">
              {hiddenTips.map((tip, i) => (
                <li key={`h-${tab}-${i}`} className="flex gap-3">
                  <span className={`shrink-0 font-bold ${shell.check}`} aria-hidden>
                    ✓
                  </span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="mt-6 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-base font-semibold text-indigo-200 transition hover:bg-white/10"
          >
            {expanded ? block.showLess : block.showMore}
          </button>
        </>
      ) : null}
    </aside>
  );
}
