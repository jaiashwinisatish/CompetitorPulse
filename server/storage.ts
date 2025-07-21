import { competitors, sources, updates, classifications, digests, type Competitor, type Source, type Update, type Classification, type Digest, type InsertCompetitor, type InsertSource, type InsertUpdate, type InsertClassification, type InsertDigest, type UpdateWithDetails, type SourceWithDetails } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // Competitors
  getCompetitors(): Promise<Competitor[]>;
  getCompetitor(id: number): Promise<Competitor | undefined>;
  createCompetitor(competitor: InsertCompetitor): Promise<Competitor>;
  updateCompetitor(id: number, competitor: Partial<InsertCompetitor>): Promise<Competitor>;

  // Sources
  getSources(): Promise<SourceWithDetails[]>;
  getSource(id: number): Promise<Source | undefined>;
  getSourcesByCompetitor(competitorId: number): Promise<Source[]>;
  getActiveSources(): Promise<SourceWithDetails[]>;
  createSource(source: InsertSource): Promise<Source>;
  updateSource(id: number, source: Partial<InsertSource>): Promise<Source>;
  updateSourceStatus(id: number, status: string, errorMessage?: string): Promise<void>;

  // Updates
  getRecentUpdates(limit?: number): Promise<UpdateWithDetails[]>;
  getUpdatesBySource(sourceId: number): Promise<Update[]>;
  getUpdatesByDateRange(startDate: Date, endDate: Date): Promise<UpdateWithDetails[]>;
  createUpdate(update: InsertUpdate): Promise<Update>;
  getUpdateByContentHash(hash: string): Promise<Update | undefined>;

  // Classifications
  getClassification(updateId: number): Promise<Classification | undefined>;
  createClassification(classification: InsertClassification): Promise<Classification>;
  getHighImpactUpdates(limit?: number): Promise<UpdateWithDetails[]>;
  getClassificationStats(): Promise<{ category: string; count: number; impact: string }[]>;

  // Digests
  getLatestDigest(): Promise<Digest | undefined>;
  createDigest(digest: InsertDigest): Promise<Digest>;
  updateDigestSlackStatus(id: number, timestamp: string): Promise<void>;

  // Dashboard stats
  getDashboardStats(): Promise<{
    competitorCount: number;
    weeklyUpdatesCount: number;
    highImpactCount: number;
    successRate: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // Competitors
  async getCompetitors(): Promise<Competitor[]> {
    return await db.select().from(competitors).where(eq(competitors.isActive, true));
  }

  async getCompetitor(id: number): Promise<Competitor | undefined> {
    const [competitor] = await db.select().from(competitors).where(eq(competitors.id, id));
    return competitor || undefined;
  }

  async createCompetitor(competitor: InsertCompetitor): Promise<Competitor> {
    const [created] = await db.insert(competitors).values(competitor).returning();
    return created;
  }

  async updateCompetitor(id: number, competitor: Partial<InsertCompetitor>): Promise<Competitor> {
    const [updated] = await db.update(competitors).set(competitor).where(eq(competitors.id, id)).returning();
    return updated;
  }

  // Sources
  async getSources(): Promise<SourceWithDetails[]> {
    return await db
      .select()
      .from(sources)
      .leftJoin(competitors, eq(sources.competitorId, competitors.id))
      .where(eq(sources.isActive, true))
      .orderBy(desc(sources.createdAt))
      .then(rows => rows.map(row => ({
        ...row.sources,
        competitor: row.competitors!
      })));
  }

  async getSource(id: number): Promise<Source | undefined> {
    const [source] = await db.select().from(sources).where(eq(sources.id, id));
    return source || undefined;
  }

  async getSourcesByCompetitor(competitorId: number): Promise<Source[]> {
    return await db.select().from(sources).where(and(eq(sources.competitorId, competitorId), eq(sources.isActive, true)));
  }

  async getActiveSources(): Promise<SourceWithDetails[]> {
    return await db
      .select()
      .from(sources)
      .leftJoin(competitors, eq(sources.competitorId, competitors.id))
      .where(and(eq(sources.isActive, true), eq(competitors.isActive, true)))
      .then(rows => rows.map(row => ({
        ...row.sources,
        competitor: row.competitors!
      })));
  }

  async createSource(source: InsertSource): Promise<Source> {
    const [created] = await db.insert(sources).values(source).returning();
    return created;
  }

  async updateSource(id: number, source: Partial<InsertSource>): Promise<Source> {
    const [updated] = await db.update(sources).set(source).where(eq(sources.id, id)).returning();
    return updated;
  }

  async updateSourceStatus(id: number, status: string, errorMessage?: string): Promise<void> {
    await db.update(sources).set({
      lastStatus: status,
      lastChecked: new Date(),
      errorMessage: errorMessage || null
    }).where(eq(sources.id, id));
  }

  // Updates
  async getRecentUpdates(limit: number = 50): Promise<UpdateWithDetails[]> {
    return await db
      .select()
      .from(updates)
      .leftJoin(competitors, eq(updates.competitorId, competitors.id))
      .leftJoin(sources, eq(updates.sourceId, sources.id))
      .leftJoin(classifications, eq(updates.id, classifications.updateId))
      .orderBy(desc(updates.scrapedAt))
      .limit(limit)
      .then(rows => rows.map(row => ({
        ...row.updates,
        competitor: row.competitors!,
        source: row.sources!,
        classification: row.classifications
      })));
  }

  async getUpdatesBySource(sourceId: number): Promise<Update[]> {
    return await db.select().from(updates).where(eq(updates.sourceId, sourceId)).orderBy(desc(updates.scrapedAt));
  }

  async getUpdatesByDateRange(startDate: Date, endDate: Date): Promise<UpdateWithDetails[]> {
    return await db
      .select()
      .from(updates)
      .leftJoin(competitors, eq(updates.competitorId, competitors.id))
      .leftJoin(sources, eq(updates.sourceId, sources.id))
      .leftJoin(classifications, eq(updates.id, classifications.updateId))
      .where(and(gte(updates.scrapedAt, startDate), lte(updates.scrapedAt, endDate)))
      .orderBy(desc(updates.scrapedAt))
      .then(rows => rows.map(row => ({
        ...row.updates,
        competitor: row.competitors!,
        source: row.sources!,
        classification: row.classifications
      })));
  }

  async createUpdate(update: InsertUpdate): Promise<Update> {
    const [created] = await db.insert(updates).values(update).returning();
    return created;
  }

  async getUpdateByContentHash(hash: string): Promise<Update | undefined> {
    const [update] = await db.select().from(updates).where(eq(updates.contentHash, hash));
    return update || undefined;
  }

  // Classifications
  async getClassification(updateId: number): Promise<Classification | undefined> {
    const [classification] = await db.select().from(classifications).where(eq(classifications.updateId, updateId));
    return classification || undefined;
  }

  async createClassification(classification: InsertClassification): Promise<Classification> {
    const [created] = await db.insert(classifications).values(classification).returning();
    return created;
  }

  async getHighImpactUpdates(limit: number = 10): Promise<UpdateWithDetails[]> {
    return await db
      .select()
      .from(updates)
      .leftJoin(competitors, eq(updates.competitorId, competitors.id))
      .leftJoin(sources, eq(updates.sourceId, sources.id))
      .leftJoin(classifications, eq(updates.id, classifications.updateId))
      .where(eq(classifications.impact, "High"))
      .orderBy(desc(updates.scrapedAt))
      .limit(limit)
      .then(rows => rows.map(row => ({
        ...row.updates,
        competitor: row.competitors!,
        source: row.sources!,
        classification: row.classifications!
      })));
  }

  async getClassificationStats(): Promise<{ category: string; count: number; impact: string }[]> {
    return await db
      .select({
        category: classifications.category,
        impact: classifications.impact,
        count: sql<number>`count(*)`,
      })
      .from(classifications)
      .groupBy(classifications.category, classifications.impact)
      .orderBy(desc(sql`count(*)`));
  }

  // Digests
  async getLatestDigest(): Promise<Digest | undefined> {
    const [digest] = await db.select().from(digests).orderBy(desc(digests.createdAt)).limit(1);
    return digest || undefined;
  }

  async createDigest(digest: InsertDigest): Promise<Digest> {
    const [created] = await db.insert(digests).values(digest).returning();
    return created;
  }

  async updateDigestSlackStatus(id: number, timestamp: string): Promise<void> {
    await db.update(digests).set({
      slackSent: true,
      slackTimestamp: timestamp
    }).where(eq(digests.id, id));
  }

  // Dashboard stats
  async getDashboardStats(): Promise<{
    competitorCount: number;
    weeklyUpdatesCount: number;
    highImpactCount: number;
    successRate: number;
  }> {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [competitorCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(competitors)
      .where(eq(competitors.isActive, true));

    const [weeklyUpdates] = await db
      .select({ count: sql<number>`count(*)` })
      .from(updates)
      .where(gte(updates.scrapedAt, weekAgo));

    const [highImpactCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(classifications)
      .innerJoin(updates, eq(classifications.updateId, updates.id))
      .where(and(eq(classifications.impact, "High"), gte(updates.scrapedAt, weekAgo)));

    const [totalSources] = await db
      .select({ count: sql<number>`count(*)` })
      .from(sources)
      .where(eq(sources.isActive, true));

    const [successfulSources] = await db
      .select({ count: sql<number>`count(*)` })
      .from(sources)
      .where(and(eq(sources.isActive, true), eq(sources.lastStatus, "success")));

    const successRate = totalSources.count > 0 ? (successfulSources.count / totalSources.count) * 100 : 100;

    return {
      competitorCount: competitorCount.count,
      weeklyUpdatesCount: weeklyUpdates.count,
      highImpactCount: highImpactCount.count,
      successRate: Math.round(successRate),
    };
  }
}

export const storage = new DatabaseStorage();
