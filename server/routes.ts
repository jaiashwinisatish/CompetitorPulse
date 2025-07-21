import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { schedulerService } from "./services/scheduler";
import { testSlackConnection } from "./services/slack";
import { insertSourceSchema, insertCompetitorSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Recent updates
  app.get("/api/updates/recent", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const updates = await storage.getRecentUpdates(limit);
      res.json(updates);
    } catch (error) {
      console.error("Error fetching recent updates:", error);
      res.status(500).json({ message: "Failed to fetch recent updates" });
    }
  });

  // High impact updates
  app.get("/api/updates/high-impact", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const updates = await storage.getHighImpactUpdates(limit);
      res.json(updates);
    } catch (error) {
      console.error("Error fetching high impact updates:", error);
      res.status(500).json({ message: "Failed to fetch high impact updates" });
    }
  });

  // Competitors
  app.get("/api/competitors", async (req, res) => {
    try {
      const competitors = await storage.getCompetitors();
      res.json(competitors);
    } catch (error) {
      console.error("Error fetching competitors:", error);
      res.status(500).json({ message: "Failed to fetch competitors" });
    }
  });

  app.post("/api/competitors", async (req, res) => {
    try {
      const competitorData = insertCompetitorSchema.parse(req.body);
      const competitor = await storage.createCompetitor(competitorData);
      res.status(201).json(competitor);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid competitor data", errors: error.errors });
      } else {
        console.error("Error creating competitor:", error);
        res.status(500).json({ message: "Failed to create competitor" });
      }
    }
  });

  // Sources
  app.get("/api/sources", async (req, res) => {
    try {
      const sources = await storage.getSources();
      res.json(sources);
    } catch (error) {
      console.error("Error fetching sources:", error);
      res.status(500).json({ message: "Failed to fetch sources" });
    }
  });

  app.post("/api/sources", async (req, res) => {
    try {
      const sourceData = insertSourceSchema.parse(req.body);
      const source = await storage.createSource(sourceData);
      res.status(201).json(source);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid source data", errors: error.errors });
      } else {
        console.error("Error creating source:", error);
        res.status(500).json({ message: "Failed to create source" });
      }
    }
  });

  app.patch("/api/sources/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      
      // Validate that the source exists
      const existingSource = await storage.getSource(id);
      if (!existingSource) {
        res.status(404).json({ message: "Source not found" });
        return;
      }

      const source = await storage.updateSource(id, updateData);
      res.json(source);
    } catch (error) {
      console.error("Error updating source:", error);
      res.status(500).json({ message: "Failed to update source" });
    }
  });

  // Classifications
  app.get("/api/classifications/stats", async (req, res) => {
    try {
      const stats = await storage.getClassificationStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching classification stats:", error);
      res.status(500).json({ message: "Failed to fetch classification stats" });
    }
  });

  // Digests
  app.get("/api/digests/latest", async (req, res) => {
    try {
      const digest = await storage.getLatestDigest();
      res.json(digest);
    } catch (error) {
      console.error("Error fetching latest digest:", error);
      res.status(500).json({ message: "Failed to fetch latest digest" });
    }
  });

  // Manual scraping trigger
  app.post("/api/scraping/run", async (req, res) => {
    try {
      const result = await schedulerService.runManualScraping();
      res.json({
        message: "Scraping completed",
        ...result
      });
    } catch (error) {
      console.error("Error running manual scraping:", error);
      res.status(500).json({ message: "Failed to run scraping" });
    }
  });

  // Generate digest manually
  app.post("/api/digests/generate", async (req, res) => {
    try {
      await schedulerService.generateAndSendWeeklyDigest();
      res.json({ message: "Digest generated and sent successfully" });
    } catch (error) {
      console.error("Error generating digest:", error);
      res.status(500).json({ message: "Failed to generate digest" });
    }
  });

  // System status
  app.get("/api/system/status", async (req, res) => {
    try {
      const slackConnected = await testSlackConnection();
      const stats = await storage.getDashboardStats();
      
      res.json({
        status: "active",
        slackConnected,
        database: "connected",
        lastUpdate: new Date().toISOString(),
        ...stats
      });
    } catch (error) {
      console.error("Error getting system status:", error);
      res.status(500).json({ 
        status: "error",
        message: "Failed to get system status"
      });
    }
  });

  // Initialize scheduler
  await schedulerService.initialize();

  const httpServer = createServer(app);
  return httpServer;
}
