import * as cron from 'node-cron';
import { storage } from '../storage';
import { webScraper } from './scraper';
import { classifyUpdate, generateWeeklyDigest, cleanAndDeduplicateContent } from './openai';
import { sendWeeklyDigest, sendHighImpactAlert, sendSystemNotification } from './slack';

export class SchedulerService {
  private scrapingJob: cron.ScheduledTask | null = null;
  private digestJob: cron.ScheduledTask | null = null;
  
  /**
   * Initialize all scheduled jobs
   */
  async initialize() {
    console.log('Initializing scheduler service...');
    
    // Schedule scraping every 6 hours
    this.scrapingJob = cron.schedule('0 */6 * * *', async () => {
      await this.runScheduledScraping();
    }, {
      timezone: "America/New_York"
    });

    // Schedule weekly digest generation (Mondays at 9 AM)
    this.digestJob = cron.schedule('0 9 * * 1', async () => {
      await this.generateAndSendWeeklyDigest();
    }, {
      timezone: "America/New_York"
    });

    // Jobs start automatically with current cron library

    console.log('Scheduler service initialized');
    
    // Send startup notification - but don't fail if Slack isn't working
    try {
      await sendSystemNotification('🚀 Competitor Tracker started and monitoring sources');
    } catch (error) {
      console.warn('Could not send startup notification to Slack:', error);
    }
  }

  /**
   * Stop all scheduled jobs
   */
  stop() {
    if (this.scrapingJob) {
      this.scrapingJob.destroy();
      this.scrapingJob = null;
    }
    
    if (this.digestJob) {
      this.digestJob.destroy();
      this.digestJob = null;
    }
    
    console.log('Scheduler service stopped');
  }

  /**
   * Manually trigger scraping of all active sources
   */
  async runManualScraping(): Promise<{ success: number; failed: number; total: number }> {
    console.log('Starting manual scraping...');
    
    try {
      const sources = await storage.getActiveSources();
      let successCount = 0;
      let failedCount = 0;

      for (const sourceWithCompetitor of sources) {
        try {
          await this.scrapeSource(sourceWithCompetitor);
          successCount++;
          await storage.updateSourceStatus(sourceWithCompetitor.id, 'success');
        } catch (error) {
          failedCount++;
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          await storage.updateSourceStatus(sourceWithCompetitor.id, 'failed', errorMsg);
          console.error(`Failed to scrape source ${sourceWithCompetitor.id}:`, error);
        }
      }

      const result = {
        success: successCount,
        failed: failedCount,
        total: sources.length
      };

      console.log(`Manual scraping completed: ${successCount} success, ${failedCount} failed, ${sources.length} total`);
      
      // Send notification if there were failures
      if (failedCount > 0) {
        await sendSystemNotification(
          `Manual scraping completed with ${failedCount} failures out of ${sources.length} sources`,
          'warning'
        );
      }

      return result;
    } catch (error) {
      console.error('Error in manual scraping:', error);
      await sendSystemNotification(
        `Manual scraping failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error'
      );
      throw error;
    }
  }

  /**
   * Run scheduled scraping based on source frequency settings
   */
  private async runScheduledScraping() {
    console.log('Running scheduled scraping...');
    
    try {
      const sources = await storage.getActiveSources();
      const now = new Date();
      let processedCount = 0;

      for (const sourceWithCompetitor of sources) {
        // Check if source should be scraped based on frequency
        if (this.shouldScrapeSource(sourceWithCompetitor, now)) {
          try {
            await this.scrapeSource(sourceWithCompetitor);
            await storage.updateSourceStatus(sourceWithCompetitor.id, 'success');
            processedCount++;
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            await storage.updateSourceStatus(sourceWithCompetitor.id, 'failed', errorMsg);
            console.error(`Failed to scrape source ${sourceWithCompetitor.id}:`, error);
          }
        }
      }

      console.log(`Scheduled scraping completed: processed ${processedCount} sources`);
    } catch (error) {
      console.error('Error in scheduled scraping:', error);
      await sendSystemNotification(
        `Scheduled scraping failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error'
      );
    }
  }

  /**
   * Check if a source should be scraped based on its frequency and last check time
   */
  private shouldScrapeSource(source: any, now: Date): boolean {
    if (!source.lastChecked) {
      return true; // Never been scraped
    }

    const lastCheck = new Date(source.lastChecked);
    const hoursSinceLastCheck = (now.getTime() - lastCheck.getTime()) / (1000 * 60 * 60);

    switch (source.checkFrequency) {
      case '6hours':
        return hoursSinceLastCheck >= 6;
      case '12hours':
        return hoursSinceLastCheck >= 12;
      case 'daily':
        return hoursSinceLastCheck >= 24;
      case 'weekly':
        return hoursSinceLastCheck >= 168; // 24 * 7
      default:
        return hoursSinceLastCheck >= 24; // Default to daily
    }
  }

  /**
   * Scrape a single source and process the results
   */
  private async scrapeSource(sourceWithCompetitor: any) {
    console.log(`Scraping source: ${sourceWithCompetitor.name} (${sourceWithCompetitor.url})`);
    
    const result = await webScraper.scrapeWebsite(sourceWithCompetitor.url, sourceWithCompetitor.type);
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Scraping failed');
    }

    // Process each scraped item
    for (const item of result.data) {
      try {
        // Clean and deduplicate content
        const { cleanedContent, contentHash } = await cleanAndDeduplicateContent(item.content);
        
        // Check for duplicates
        const existingUpdate = await storage.getUpdateByContentHash(contentHash);
        if (existingUpdate) {
          console.log(`Skipping duplicate content: ${item.title.substring(0, 50)}...`);
          continue;
        }

        // Create update record
        const update = await storage.createUpdate({
          sourceId: sourceWithCompetitor.id,
          competitorId: sourceWithCompetitor.competitorId,
          title: item.title,
          content: cleanedContent,
          url: item.url,
          publishedAt: item.publishedAt || new Date(),
          rawContent: item.rawHtml,
          contentHash
        });

        // Classify the update using AI
        const classification = await classifyUpdate(item.title, cleanedContent, item.url);
        
        await storage.createClassification({
          updateId: update.id,
          category: classification.category,
          impact: classification.impact,
          confidence: classification.confidence.toString(),
          summary: classification.summary,
          aiResponse: classification
        });

        console.log(`Processed update: ${item.title} (${classification.category}, ${classification.impact})`);

        // Send high-impact alerts
        if (classification.impact === 'High') {
          await sendHighImpactAlert({
            competitor: sourceWithCompetitor.competitor.name,
            title: item.title,
            category: classification.category,
            impact: classification.impact,
            summary: classification.summary,
            url: item.url
          });
        }
      } catch (error) {
        console.error(`Error processing update "${item.title}":`, error);
        // Continue with other items even if one fails
      }
    }
  }

  /**
   * Generate and send weekly digest
   */
  async generateAndSendWeeklyDigest(): Promise<void> {
    console.log('Generating weekly digest...');
    
    try {
      // Get updates from the past week
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date();
      weekEnd.setHours(23, 59, 59, 999);
      
      const updates = await storage.getUpdatesByDateRange(weekStart, weekEnd);
      
      if (updates.length === 0) {
        console.log('No updates found for weekly digest');
        await sendSystemNotification('Weekly digest skipped - no updates found for the past week', 'info');
        return;
      }

      // Prepare data for AI digest generation
      const digestData = updates.map(update => ({
        title: update.title,
        content: update.content,
        competitor: update.competitor.name,
        category: update.classification?.category || 'Uncategorized',
        impact: update.classification?.impact || 'Unknown',
        publishedAt: update.publishedAt || undefined
      }));

      // Generate digest content using AI
      const digestContent = await generateWeeklyDigest(digestData);
      
      // Create digest record
      const title = `Competitor Intelligence Digest - Week of ${weekStart.toLocaleDateString()}`;
      const highImpactCount = updates.filter(u => u.classification?.impact === 'High').length;
      
      const digest = await storage.createDigest({
        title,
        content: digestContent,
        weekStart,
        weekEnd,
        totalUpdates: updates.length,
        highImpactCount,
        slackSent: false
      });

      // Send to Slack
      const slackTimestamp = await sendWeeklyDigest({
        title,
        content: digestContent,
        totalUpdates: updates.length,
        highImpactCount,
        weekPeriod: `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`
      });

      // Update digest with Slack delivery status
      if (slackTimestamp) {
        await storage.updateDigestSlackStatus(digest.id, slackTimestamp);
      }

      console.log(`Weekly digest generated and sent: ${updates.length} updates, ${highImpactCount} high impact`);
    } catch (error) {
      console.error('Error generating weekly digest:', error);
      await sendSystemNotification(
        `Weekly digest generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error'
      );
      throw error;
    }
  }
}

// Singleton instance
export const schedulerService = new SchedulerService();

// Graceful shutdown
process.on('SIGINT', () => {
  schedulerService.stop();
});

process.on('SIGTERM', () => {
  schedulerService.stop();
});
