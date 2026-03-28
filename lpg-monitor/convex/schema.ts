import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  reports: defineTable({
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
  }).index("by_created", ["createdAt"]),
});
