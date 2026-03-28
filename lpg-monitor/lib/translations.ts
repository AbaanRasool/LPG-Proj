export type Locale = "en" | "hi";

export const translations = {
  en: {
    appName: "LPG Shortage Monitor",
    critical: "Critical",
    moderate: "Moderate",
    normal: "Normal",
    area: "Area",
    source: "Source",
    date: "Date",
    readOriginal: "Read Original →",
    switchLang: "हिंदी में देखें",
    disclaimer:
      "Labels are AI-assisted. Always verify with your local gas dealer or official government channels before making decisions.",
    lastUpdated: "Last Updated",
    fetchLiveNews: "LPG CRISIS",
    fetchLiveNewsLoading: "Loading live news…",
    fetchLiveNewsError: "Could not fetch news. Try again.",
    reportsAdded: "{count} reports added",
    clearAll: "Clear All",
    clearAllLoading: "Clearing…",
    fetchSkipDetail:
      "Skipped {skipped} (duplicates: {dup}, classify: {cls}, empty titles: {empty}).",
    emptyReports: "No reports yet.",
    emptyReportsHint: "Run",
    emptyReportsHintEnd: "to load demo data.",
    groqKeyMissing:
      "GROQ_API_KEY is missing. Add it to .env.local in the lpg-monitor folder, save, then restart npm run dev.",
    searchPlaceholder:
      "🔍 Search your city or state… e.g. Delhi, Mumbai, Noida",
    searchAndFetchNews: "LPG CRISIS",
    searchShowAll: "Show All",
    searchSearching: "Searching…",
    showingResultsFor: "Showing {count} results for {city}",
    noSearchMatches: "No reports match your search.",
  },
  hi: {
    appName: "एलपीजी कमी मॉनिटर",
    critical: "गंभीर",
    moderate: "सामान्य चिंता",
    normal: "सामान्य",
    area: "क्षेत्र",
    source: "स्रोत",
    date: "तारीख",
    readOriginal: "मूल पढ़ें →",
    switchLang: "English में देखें",
    disclaimer:
      "लेबल AI द्वारा सहायता प्राप्त हैं। निर्णय लेने से पहले अपने स्थानीय गैस डीलर या सरकारी चैनल से सत्यापित करें।",
    lastUpdated: "अंतिम अपडेट",
    fetchLiveNews: "LPG CRISIS",
    fetchLiveNewsLoading: "लाइव न्यूज़ लोड हो रही है…",
    fetchLiveNewsError: "न्यूज़ नहीं मिली। दोबारा कोशिश करें।",
    reportsAdded: "{count} रिपोर्ट जोड़ी गईं",
    clearAll: "सब हटाएँ",
    clearAllLoading: "हट रहा है…",
    fetchSkipDetail:
      "{skipped} छोड़े (डुप्लिकेट: {dup}, क्लासिफाई: {cls}, खाली शीर्षक: {empty})।",
    emptyReports: "अभी कोई रिपोर्ट नहीं।",
    emptyReportsHint: "डेमो डेटा के लिए चलाएँ",
    emptyReportsHintEnd: "।",
    groqKeyMissing:
      "GROQ_API_KEY मौजूद नहीं। lpg-monitor फ़ोल्डर में .env.local में जोड़ें, सेव करें, फिर npm run dev दोबारा चलाएँ।",
    searchPlaceholder: "🔍 अपना शहर या राज्य खोजें…",
    searchAndFetchNews: "LPG CRISIS",
    searchShowAll: "सब दिखाएँ",
    searchSearching: "खोज हो रही है…",
    showingResultsFor: "{city} के लिए {count} परिणाम",
    noSearchMatches: "आपकी खोज से कोई रिपोर्ट मेल नहीं खाती।",
  },
} as const;

export type TranslationKey = keyof (typeof translations)["en"];
