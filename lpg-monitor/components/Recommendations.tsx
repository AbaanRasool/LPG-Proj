"use client";

import { useEffect, useMemo, useState } from "react";
import { Doc } from "@/convex/_generated/dataModel";
import { Locale } from "@/lib/translations";

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
  { border: string; bg: string; text: string; check: string }
> = {
  red: {
    border: "border-red-400",
    bg: "bg-red-50",
    text: "text-red-800",
    check: "text-red-600",
  },
  yellow: {
    border: "border-yellow-400",
    bg: "bg-yellow-50",
    text: "text-yellow-800",
    check: "text-yellow-700",
  },
  green: {
    border: "border-green-400",
    bg: "bg-green-50",
    text: "text-green-800",
    check: "text-green-700",
  },
};

const INITIAL_VISIBLE = 3;

type Props = {
  status: RecommendationStatus;
  locale: Locale;
};

export function Recommendations({ status, locale }: Props) {
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    setExpanded(false);
  }, [status, locale]);

  const block = CONTENT[locale][status];
  const shell = SHELL[status];

  const { visibleTips, hiddenTips, hasHidden } = useMemo(() => {
    const tips = block.tips;
    return {
      visibleTips: tips.slice(0, INITIAL_VISIBLE),
      hiddenTips: tips.slice(INITIAL_VISIBLE),
      hasHidden: tips.length > INITIAL_VISIBLE,
    };
  }, [block.tips]);

  return (
    <aside
      lang={locale}
      className={`rounded-xl border-2 p-4 shadow-sm ${shell.border} ${shell.bg} ${shell.text}`}
      aria-labelledby="recommendations-title"
    >
      <h2
        id="recommendations-title"
        className="text-lg font-bold leading-snug sm:text-xl"
      >
        {block.title}
      </h2>
      <p className="mt-1 text-base font-semibold opacity-95">{block.subtitle}</p>

      <ul className="mt-4 flex flex-col gap-3 text-base leading-relaxed">
        {visibleTips.map((tip, i) => (
          <li key={`v-${i}`} className="flex gap-2">
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
            className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
              expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            }`}
          >
            <div className="overflow-hidden">
              <ul className="mt-3 flex flex-col gap-3 border-t border-black/10 pt-3 text-base leading-relaxed">
                {hiddenTips.map((tip, i) => (
                  <li key={`h-${i}`} className="flex gap-2">
                    <span
                      className={`shrink-0 font-bold ${shell.check}`}
                      aria-hidden
                    >
                      ✓
                    </span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="mt-4 w-full rounded-lg border border-black/15 bg-white/60 px-4 py-3 text-base font-semibold underline-offset-2 hover:bg-white/90 sm:text-lg"
          >
            {expanded ? block.showLess : block.showMore}
          </button>
        </>
      ) : null}
    </aside>
  );
}
