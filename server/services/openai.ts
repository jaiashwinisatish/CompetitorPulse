import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface ClassificationResult {
  category: "Feature" | "Bug Fix" | "UI Update" | "Pricing" | "Integration";
  impact: "High" | "Medium" | "Low";
  confidence: number; // 0.0 to 1.0
  summary: string;
  reasoning: string;
}

export async function classifyUpdate(title: string, content: string, url?: string): Promise<ClassificationResult> {
  try {
    const prompt = `
Analyze this competitor update and classify it. Return JSON in the exact format specified.

Title: ${title}
Content: ${content}
URL: ${url || "N/A"}

Classify this update into one of these categories:
- Feature: New product capabilities, tools, or functionality
- Bug Fix: Fixes, patches, or stability improvements  
- UI Update: Design changes, interface improvements, user experience updates
- Pricing: Changes to pricing, plans, or billing
- Integration: New integrations, API updates, or third-party connections

Determine impact level:
- High: Major features, significant UI overhauls, pricing changes, or strategic integrations
- Medium: Minor features, small UI improvements, or standard integrations
- Low: Bug fixes, maintenance updates, or minor tweaks

Provide a confidence score from 0.0 to 1.0 indicating how certain you are about the classification.

Return JSON in this exact format:
{
  "category": "Feature|Bug Fix|UI Update|Pricing|Integration",
  "impact": "High|Medium|Low", 
  "confidence": 0.95,
  "summary": "Brief 1-2 sentence summary of what this update is about",
  "reasoning": "Explanation of why you chose this category and impact level"
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert product analyst who specializes in competitive intelligence and product update classification. Respond only with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3
    });

    const result = JSON.parse(response.choices[0].message.content!);
    
    // Validate and normalize the response
    return {
      category: result.category as ClassificationResult["category"],
      impact: result.impact as ClassificationResult["impact"],
      confidence: Math.max(0, Math.min(1, result.confidence)),
      summary: result.summary || "No summary available",
      reasoning: result.reasoning || "No reasoning provided"
    };
  } catch (error) {
    console.error("Error classifying update:", error);
    throw new Error("Failed to classify update: " + (error as Error).message);
  }
}

export async function generateWeeklyDigest(updates: Array<{
  title: string;
  content: string;
  competitor: string;
  category: string;
  impact: string;
  publishedAt?: Date;
}>): Promise<string> {
  try {
    const prompt = `
Create a professional weekly competitor intelligence digest for product managers.

Updates this week:
${updates.map((update, i) => `
${i + 1}. ${update.competitor} - ${update.title}
   Category: ${update.category}
   Impact: ${update.impact}
   Content: ${update.content.substring(0, 200)}...
   Published: ${update.publishedAt?.toLocaleDateString() || "Unknown"}
`).join("\n")}

Create a well-structured digest with:
1. Executive Summary (2-3 sentences highlighting the most important developments)
2. High Impact Updates (detailed analysis of high-impact items)
3. Category Breakdown (group updates by category with brief insights)
4. Strategic Implications (what this means for our product strategy)
5. Recommended Actions (specific next steps for the product team)

Keep it professional, concise, and actionable for product managers. Focus on strategic insights rather than just listing features.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a senior product intelligence analyst creating weekly competitive intelligence reports for product management teams. Write in a professional, analytical tone with actionable insights."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.4,
      max_tokens: 2000
    });

    return response.choices[0].message.content!;
  } catch (error) {
    console.error("Error generating digest:", error);
    throw new Error("Failed to generate digest: " + (error as Error).message);
  }
}

export async function cleanAndDeduplicateContent(content: string): Promise<{
  cleanedContent: string;
  contentHash: string;
}> {
  try {
    const prompt = `
Clean and normalize this scraped content for analysis. Remove HTML artifacts, fix formatting issues, and extract the essential information.

Content to clean:
${content}

Return JSON with:
{
  "cleanedContent": "The cleaned and normalized content",
  "contentHash": "A short hash/fingerprint to identify duplicate content"
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a content processing specialist. Clean scraped content while preserving all important information. Generate consistent hashes for duplicate detection."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1
    });

    const result = JSON.parse(response.choices[0].message.content!);
    
    return {
      cleanedContent: result.cleanedContent || content,
      contentHash: result.contentHash || Buffer.from(content).toString('base64').substring(0, 32)
    };
  } catch (error) {
    console.error("Error cleaning content:", error);
    // Fallback to basic cleaning
    const cleanedContent = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    const contentHash = Buffer.from(cleanedContent).toString('base64').substring(0, 32);
    
    return { cleanedContent, contentHash };
  }
}
