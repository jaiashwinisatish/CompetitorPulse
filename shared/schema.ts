import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const competitors = pgTable("competitors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  website: text("website"),
  logo: text("logo"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sources = pgTable("sources", {
  id: serial("id").primaryKey(),
  competitorId: integer("competitor_id").references(() => competitors.id),
  name: text("name").notNull(),
  url: text("url").notNull(),
  type: text("type").notNull(), // 'website', 'twitter', 'linkedin', 'appstore', 'rss'
  checkFrequency: text("check_frequency").default("daily"), // 'daily', '6hours', '12hours', 'weekly'
  isActive: boolean("is_active").default(true),
  lastChecked: timestamp("last_checked"),
  lastStatus: text("last_status").default("pending"), // 'success', 'failed', 'pending'
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const updates = pgTable("updates", {
  id: serial("id").primaryKey(),
  sourceId: integer("source_id").references(() => sources.id),
  competitorId: integer("competitor_id").references(() => competitors.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  url: text("url"),
  publishedAt: timestamp("published_at"),
  scrapedAt: timestamp("scraped_at").defaultNow(),
  rawContent: text("raw_content"),
  contentHash: text("content_hash"), // for deduplication
});

export const classifications = pgTable("classifications", {
  id: serial("id").primaryKey(),
  updateId: integer("update_id").references(() => updates.id),
  category: text("category").notNull(), // 'Feature', 'Bug Fix', 'UI Update', 'Pricing', 'Integration'
  impact: text("impact").notNull(), // 'High', 'Medium', 'Low'
  confidence: decimal("confidence", { precision: 3, scale: 2 }), // 0.00 to 1.00
  summary: text("summary"),
  aiResponse: jsonb("ai_response"), // full AI response for debugging
  createdAt: timestamp("created_at").defaultNow(),
});

export const digests = pgTable("digests", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  weekStart: timestamp("week_start").notNull(),
  weekEnd: timestamp("week_end").notNull(),
  totalUpdates: integer("total_updates").default(0),
  highImpactCount: integer("high_impact_count").default(0),
  slackSent: boolean("slack_sent").default(false),
  slackTimestamp: text("slack_timestamp"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const competitorsRelations = relations(competitors, ({ many }) => ({
  sources: many(sources),
  updates: many(updates),
}));

export const sourcesRelations = relations(sources, ({ one, many }) => ({
  competitor: one(competitors, {
    fields: [sources.competitorId],
    references: [competitors.id],
  }),
  updates: many(updates),
}));

export const updatesRelations = relations(updates, ({ one, many }) => ({
  source: one(sources, {
    fields: [updates.sourceId],
    references: [sources.id],
  }),
  competitor: one(competitors, {
    fields: [updates.competitorId],
    references: [competitors.id],
  }),
  classification: many(classifications),
}));

export const classificationsRelations = relations(classifications, ({ one }) => ({
  update: one(updates, {
    fields: [classifications.updateId],
    references: [updates.id],
  }),
}));

// Zod schemas
export const insertCompetitorSchema = createInsertSchema(competitors).omit({
  id: true,
  createdAt: true,
});

export const insertSourceSchema = createInsertSchema(sources).omit({
  id: true,
  createdAt: true,
  lastChecked: true,
  lastStatus: true,
  errorMessage: true,
});

export const insertUpdateSchema = createInsertSchema(updates).omit({
  id: true,
  scrapedAt: true,
});

export const insertClassificationSchema = createInsertSchema(classifications).omit({
  id: true,
  createdAt: true,
});

export const insertDigestSchema = createInsertSchema(digests).omit({
  id: true,
  createdAt: true,
});

// Types
export type Competitor = typeof competitors.$inferSelect;
export type InsertCompetitor = z.infer<typeof insertCompetitorSchema>;

export type Source = typeof sources.$inferSelect;
export type InsertSource = z.infer<typeof insertSourceSchema>;

export type Update = typeof updates.$inferSelect;
export type InsertUpdate = z.infer<typeof insertUpdateSchema>;

export type Classification = typeof classifications.$inferSelect;
export type InsertClassification = z.infer<typeof insertClassificationSchema>;

export type Digest = typeof digests.$inferSelect;
export type InsertDigest = z.infer<typeof insertDigestSchema>;

// Combined types for UI
export type UpdateWithDetails = Update & {
  competitor: Competitor;
  source: Source;
  classification: Classification | null;
};

export type SourceWithDetails = Source & {
  competitor: Competitor;
};
