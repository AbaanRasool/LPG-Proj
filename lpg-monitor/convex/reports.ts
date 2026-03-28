import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/** Hardcoded hackathon demo articles (no scraping). */
export const DEMO_REPORTS = [
  {
    title: "LPG cylinder supply completely cut off in East Delhi",
    summary:
      "Dealers in East Delhi report zero stock for 3 days. Families unable to cook.",
    hindiSummary:
      "पूर्वी दिल्ली में 3 दिनों से एलपीजी की सप्लाई बंद है। परिवार खाना नहीं बना पा रहे।",
    status: "red",
    area: "East Delhi",
    source: "Times of India",
    sourceUrl: "https://timesofindia.indiatimes.com",
    publishedAt: "2024-03-28",
    plainLanguageLabel: "Treated as critical shortage in East Delhi.",
    createdAt: Date.UTC(2024, 2, 28, 12, 0, 0),
  },
  {
    title: "Panic buying of LPG cylinders reported in Lajpat Nagar",
    summary:
      "Long queues outside gas dealers. Stock expected to run out by evening.",
    hindiSummary:
      "लाजपत नगर में गैस डीलरों के बाहर लंबी कतारें। शाम तक स्टॉक खत्म होने की आशंका।",
    status: "red",
    area: "Lajpat Nagar",
    source: "Hindustan Times",
    sourceUrl: "https://hindustantimes.com",
    publishedAt: "2024-03-27",
    plainLanguageLabel: "Treated as critical shortage in Lajpat Nagar.",
    createdAt: Date.UTC(2024, 2, 27, 12, 0, 0),
  },
  {
    title: "LPG prices rise 15% in Noida this week",
    summary:
      "Moderate price hike reported. Supply still available but at higher cost.",
    hindiSummary:
      "नोएडा में इस हफ्ते एलपीजी की कीमतें 15% बढ़ी हैं। सप्लाई जारी है लेकिन महंगी है।",
    status: "yellow",
    area: "Noida",
    source: "NDTV",
    sourceUrl: "https://ndtv.com",
    publishedAt: "2024-03-27",
    plainLanguageLabel: "Treated as moderate concern in Noida.",
    createdAt: Date.UTC(2024, 2, 27, 10, 0, 0),
  },
  {
    title: "Limited LPG stock at dealers across Gurgaon",
    summary:
      "Dealers warning customers of delays. Government monitoring the situation.",
    hindiSummary:
      "गुरुग्राम में डीलर देरी की चेतावनी दे रहे हैं। सरकार स्थिति पर नज़र रख रही है।",
    status: "yellow",
    area: "Gurgaon",
    source: "Times of India",
    sourceUrl: "https://timesofindia.indiatimes.com",
    publishedAt: "2024-03-26",
    plainLanguageLabel: "Treated as moderate concern in Gurgaon.",
    createdAt: Date.UTC(2024, 2, 26, 12, 0, 0),
  },
  {
    title: "HP Gas restores full supply in Dwarka after 2-day disruption",
    summary:
      "Supply fully restored. Residents can book cylinders normally again.",
    hindiSummary:
      "द्वारका में 2 दिन की बाधा के बाद एचपी गैस की सप्लाई पूरी तरह बहाल हो गई है।",
    status: "green",
    area: "Dwarka",
    source: "Hindustan Times",
    sourceUrl: "https://hindustantimes.com",
    publishedAt: "2024-03-28",
    plainLanguageLabel: "Normal supply restored in Dwarka.",
    createdAt: Date.UTC(2024, 2, 28, 9, 0, 0),
  },
  {
    title: "LPG supply stable across South Delhi, no shortage reported",
    summary:
      "All dealers report normal stock levels. Prices unchanged this week.",
    hindiSummary:
      "दक्षिण दिल्ली में सभी डीलरों के पास सामान्य स्टॉक है। इस हफ्ते कीमतें नहीं बदलीं।",
    status: "green",
    area: "South Delhi",
    source: "NDTV",
    sourceUrl: "https://ndtv.com",
    publishedAt: "2024-03-26",
    plainLanguageLabel: "Normal supply in South Delhi.",
    createdAt: Date.UTC(2024, 2, 26, 8, 0, 0),
  },
] as const;

/** Returns every report, newest first (by createdAt). */
export const getAllReports = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("reports")
      .withIndex("by_created", (q) => q)
      .order("desc")
      .collect();
  },
});

/** Saves one report row. */
export const addReport = mutation({
  args: {
    title: v.string(),
    summary: v.string(),
    hindiSummary: v.string(),
    status: v.string(),
    area: v.string(),
    source: v.string(),
    sourceUrl: v.string(),
    publishedAt: v.string(),
    plainLanguageLabel: v.string(),
    createdAt: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("reports", args);
  },
});

/** Deletes every row in reports (for dev / resetting before fetch). */
export const clearAllReports = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("reports").collect();
    for (const doc of existing) {
      await ctx.db.delete(doc._id);
    }
    return { deleted: existing.length };
  },
});

/** Returns reports that match a status: red, yellow, or green. */
export const getReportsByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, { status }) => {
    const all = await ctx.db
      .query("reports")
      .withIndex("by_created", (q) => q)
      .order("desc")
      .collect();
    return all.filter((r) => r.status === status);
  },
});

/** Replaces table contents with the six demo reports (idempotent for hackathon). */
export const seedReports = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("reports").collect();
    for (const doc of existing) {
      await ctx.db.delete(doc._id);
    }
    for (const row of DEMO_REPORTS) {
      await ctx.db.insert("reports", { ...row });
    }
    return { inserted: DEMO_REPORTS.length };
  },
});
