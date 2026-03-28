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
  },
} as const;

export type TranslationKey = keyof (typeof translations)["en"];
