import { WebClient, type ChatPostMessageArguments } from "@slack/web-api";

if (!process.env.SLACK_BOT_TOKEN) {
  console.warn("SLACK_BOT_TOKEN environment variable not set - Slack functionality will be disabled");
}

if (!process.env.SLACK_CHANNEL_ID) {
  console.warn("SLACK_CHANNEL_ID environment variable not set - using fallback channel");
}

const slack = process.env.SLACK_BOT_TOKEN ? new WebClient(process.env.SLACK_BOT_TOKEN) : null;

export interface DigestMessage {
  title: string;
  content: string;
  totalUpdates: number;
  highImpactCount: number;
  weekPeriod: string;
}

/**
 * Sends a structured weekly digest message to Slack
 */
export async function sendWeeklyDigest(digest: DigestMessage): Promise<string | undefined> {
  if (!slack) {
    console.warn("Slack not configured - skipping digest send");
    return undefined;
  }

  try {
    const channel = process.env.SLACK_CHANNEL_ID || "#general";
    
    // Format the digest as Slack blocks for better presentation
    const blocks = [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "🔍 Weekly Competitor Intelligence Digest",
          emoji: true
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*${digest.title}*\n${digest.weekPeriod}`
        }
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*Total Updates:*\n${digest.totalUpdates}`
          },
          {
            type: "mrkdwn",
            text: `*High Impact:*\n${digest.highImpactCount} 🔥`
          }
        ]
      },
      {
        type: "divider"
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: digest.content.substring(0, 3000) // Slack has message limits
        }
      }
    ];

    // Add footer with timestamp
    blocks.push({
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `Generated on ${new Date().toLocaleDateString()} | AI-Powered Competitor Tracker`
        }
      ]
    } as any);

    const response = await slack.chat.postMessage({
      channel,
      blocks,
      text: `Weekly Competitor Digest: ${digest.title}`, // Fallback text
      unfurl_links: false,
      unfurl_media: false
    });

    console.log(`Digest sent to Slack channel ${channel}:`, response.ts);
    return response.ts;
  } catch (error) {
    console.error('Error sending digest to Slack:', error);
    throw error;
  }
}

/**
 * Sends a notification about a high-impact competitor update
 */
export async function sendHighImpactAlert(update: {
  competitor: string;
  title: string;
  category: string;
  impact: string;
  summary: string;
  url?: string;
}): Promise<string | undefined> {
  if (!slack) {
    console.warn("Slack not configured - skipping high impact alert");
    return undefined;
  }

  try {
    const channel = process.env.SLACK_CHANNEL_ID || "#general";
    
    const blocks = [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `🚨 *High Impact Update Detected*`
        }
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*Competitor:*\n${update.competitor}`
          },
          {
            type: "mrkdwn",
            text: `*Category:*\n${update.category}`
          },
          {
            type: "mrkdwn",
            text: `*Impact Level:*\n${update.impact} 🔥`
          }
        ]
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*${update.title}*\n\n${update.summary}`
        }
      }
    ];

    if (update.url) {
      blocks.push({
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "View Update"
            },
            url: update.url,
            action_id: "view_update"
          }
        ]
      } as any);
    }

    const response = await slack.chat.postMessage({
      channel,
      blocks,
      text: `High Impact Update: ${update.competitor} - ${update.title}`,
      unfurl_links: false,
      unfurl_media: false
    });

    console.log(`High impact alert sent to Slack:`, response.ts);
    return response.ts;
  } catch (error) {
    console.error('Error sending high impact alert to Slack:', error);
    throw error;
  }
}

/**
 * Sends a system notification (errors, status updates, etc.)
 */
export async function sendSystemNotification(message: string, type: 'info' | 'warning' | 'error' = 'info'): Promise<string | undefined> {
  if (!slack) {
    console.warn("Slack not configured - skipping system notification");
    return undefined;
  }

  try {
    const channel = process.env.SLACK_CHANNEL_ID || "#general";
    
    const emoji = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
    
    const response = await slack.chat.postMessage({
      channel,
      text: `${emoji} *System Notification*\n${message}`,
      unfurl_links: false,
      unfurl_media: false
    });

    return response.ts;
  } catch (error) {
    console.error('Error sending system notification to Slack:', error);
    throw error;
  }
}

/**
 * Tests the Slack connection
 */
export async function testSlackConnection(): Promise<boolean> {
  if (!slack) {
    return false;
  }

  try {
    const response = await slack.auth.test();
    console.log('Slack connection test successful:', response.user);
    return true;
  } catch (error) {
    console.error('Slack connection test failed:', error);
    return false;
  }
}
