import puppeteer, { Browser, Page } from 'puppeteer';
import * as cheerio from 'cheerio';
import { RateLimiterMemory } from 'rate-limiter-flexible';

// Rate limiter: max 5 requests per minute per domain
const rateLimiter = new RateLimiterMemory({
  points: 5,
  duration: 60, // 60 seconds
});

export interface ScrapedContent {
  title: string;
  content: string;
  url: string;
  publishedAt?: Date;
  rawHtml?: string;
}

export interface ScrapingResult {
  success: boolean;
  data?: ScrapedContent[];
  error?: string;
}

export class WebScraper {
  private browser: Browser | null = null;

  async initialize() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ]
      });
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async scrapeWebsite(url: string, type: string = 'website'): Promise<ScrapingResult> {
    try {
      // Apply rate limiting
      const hostname = new URL(url).hostname;
      await rateLimiter.consume(hostname);

      await this.initialize();
      const page = await this.browser!.newPage();
      
      // Set user agent and other headers to avoid detection
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
      });

      // Navigate to the page
      await page.goto(url, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });

      // Wait a bit for dynamic content to load
      await page.waitForSelector('body', { timeout: 2000 }).catch(() => {});

      // Get page content
      const html = await page.content();
      await page.close();

      // Parse based on type
      switch (type) {
        case 'website':
        case 'changelog':
          return this.parseChangelog(html, url);
        case 'twitter':
          return this.parseTwitter(html, url);
        case 'linkedin':
          return this.parseLinkedIn(html, url);
        case 'appstore':
          return this.parseAppStore(html, url);
        default:
          return this.parseGeneric(html, url);
      }
    } catch (error) {
      console.error(`Error scraping ${url}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown scraping error'
      };
    }
  }

  private parseChangelog(html: string, url: string): ScrapingResult {
    try {
      const $ = cheerio.load(html);
      const updates: ScrapedContent[] = [];

      // Common changelog selectors
      const selectors = [
        'article',
        '.changelog-item',
        '.release-item', 
        '.update-item',
        '.post',
        '[class*="changelog"]',
        '[class*="release"]',
        '[class*="update"]'
      ];

      let found = false;
      for (const selector of selectors) {
        const items = $(selector);
        if (items.length > 0) {
          items.each((i, element) => {
            if (i >= 10) return false; // Limit to 10 most recent items
            
            const $el = $(element);
            const title = $el.find('h1, h2, h3, h4, .title, [class*="title"]').first().text().trim();
            const content = $el.text().trim();
            
            if (title && content && content.length > 50) {
              // Try to extract date
              let publishedAt: Date | undefined;
              const dateText = $el.find('time, .date, [class*="date"]').first().attr('datetime') || 
                               $el.find('time, .date, [class*="date"]').first().text();
              if (dateText) {
                const date = new Date(dateText);
                if (!isNaN(date.getTime())) {
                  publishedAt = date;
                }
              }

              updates.push({
                title: title.substring(0, 200),
                content: content.substring(0, 2000),
                url,
                publishedAt,
                rawHtml: $el.html()?.substring(0, 1000)
              });
              found = true;
            }
          });
          
          if (found) break;
        }
      }

      // Fallback: look for any structured content
      if (!found) {
        const fallbackSelectors = ['h1, h2, h3', 'p'];
        const headings = $(fallbackSelectors[0]);
        const paragraphs = $(fallbackSelectors[1]);
        
        if (headings.length > 0 && paragraphs.length > 0) {
          headings.each((i, element) => {
            if (i >= 5) return false;
            
            const $heading = $(element);
            const title = $heading.text().trim();
            
            // Get following paragraphs
            const content = $heading.nextAll('p').first().text().trim();
            
            if (title && content && content.length > 30) {
              updates.push({
                title: title.substring(0, 200),
                content: content.substring(0, 2000),
                url
              });
            }
          });
        }
      }

      return {
        success: true,
        data: updates
      };
    } catch (error) {
      return {
        success: false,
        error: `Error parsing changelog: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private parseTwitter(html: string, url: string): ScrapingResult {
    try {
      const $ = cheerio.load(html);
      const updates: ScrapedContent[] = [];

      // Twitter/X specific selectors for tweets
      const tweetSelectors = [
        '[data-testid="tweet"]',
        '.tweet',
        '[role="article"]'
      ];

      for (const selector of tweetSelectors) {
        const tweets = $(selector);
        if (tweets.length > 0) {
          tweets.each((i, element) => {
            if (i >= 5) return false; // Limit to 5 recent tweets
            
            const $tweet = $(element);
            const content = $tweet.find('[data-testid="tweetText"], .tweet-text').text().trim();
            
            if (content && content.length > 10) {
              // Try to extract timestamp
              let publishedAt: Date | undefined;
              const timeEl = $tweet.find('time');
              if (timeEl.length > 0) {
                const datetime = timeEl.attr('datetime');
                if (datetime) {
                  publishedAt = new Date(datetime);
                }
              }

              updates.push({
                title: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
                content: content.substring(0, 1000),
                url,
                publishedAt
              });
            }
          });
          break;
        }
      }

      return {
        success: updates.length > 0,
        data: updates,
        error: updates.length === 0 ? 'No tweets found' : undefined
      };
    } catch (error) {
      return {
        success: false,
        error: `Error parsing Twitter: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private parseLinkedIn(html: string, url: string): ScrapingResult {
    try {
      const $ = cheerio.load(html);
      const updates: ScrapedContent[] = [];

      // LinkedIn post selectors
      const postSelectors = [
        '.feed-shared-update-v2',
        '.occludable-update', 
        '[data-id*="activity"]'
      ];

      for (const selector of postSelectors) {
        const posts = $(selector);
        if (posts.length > 0) {
          posts.each((i, element) => {
            if (i >= 5) return false;
            
            const $post = $(element);
            const content = $post.find('.feed-shared-text, .share-update-card__update-text').text().trim();
            
            if (content && content.length > 10) {
              updates.push({
                title: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
                content: content.substring(0, 1000),
                url
              });
            }
          });
          break;
        }
      }

      return {
        success: updates.length > 0,
        data: updates,
        error: updates.length === 0 ? 'No LinkedIn posts found' : undefined
      };
    } catch (error) {
      return {
        success: false,
        error: `Error parsing LinkedIn: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private parseAppStore(html: string, url: string): ScrapingResult {
    try {
      const $ = cheerio.load(html);
      const updates: ScrapedContent[] = [];

      // App Store update selectors
      const updateSelectors = [
        '.whats-new__content',
        '.version-history',
        '.release-notes'
      ];

      for (const selector of updateSelectors) {
        const items = $(selector);
        if (items.length > 0) {
          items.each((i, element) => {
            if (i >= 3) return false;
            
            const $item = $(element);
            const version = $item.find('.whats-new__latest__version, .version').text().trim();
            const content = $item.text().trim();
            
            if (content && content.length > 20) {
              updates.push({
                title: version ? `Version ${version}` : 'App Update',
                content: content.substring(0, 1000),
                url
              });
            }
          });
          break;
        }
      }

      return {
        success: updates.length > 0,
        data: updates,
        error: updates.length === 0 ? 'No app updates found' : undefined
      };
    } catch (error) {
      return {
        success: false,
        error: `Error parsing App Store: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private parseGeneric(html: string, url: string): ScrapingResult {
    try {
      const $ = cheerio.load(html);
      
      // Extract title
      const title = $('title').text().trim() || 
                   $('h1').first().text().trim() || 
                   'Untitled';
      
      // Extract main content
      const content = $('main').text().trim() || 
                     $('article').text().trim() ||
                     $('body').text().trim();

      if (!content || content.length < 50) {
        return {
          success: false,
          error: 'No substantial content found'
        };
      }

      return {
        success: true,
        data: [{
          title: title.substring(0, 200),
          content: content.substring(0, 2000),
          url
        }]
      };
    } catch (error) {
      return {
        success: false,
        error: `Error parsing generic content: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

// Singleton instance
export const webScraper = new WebScraper();

// Graceful shutdown
process.on('SIGINT', async () => {
  await webScraper.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await webScraper.close();
  process.exit(0);
});
