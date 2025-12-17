import { GoogleGenAI, Type } from "@google/genai";
import { Source, FeedItem, Sentiment, Platform } from "../types";

// Initialize Gemini Client
// NOTE: In a production app, never expose API keys on the client. 
// For this prototype, we use process.env.API_KEY as per instructions.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Simulates the backend "Scrape -> Analyze" pipeline.
 * Since we can't scrape live data in the browser, we ask Gemini to generate
 * realistic hypothetical data based on the sources provided.
 */
export const fetchAndAnalyzeFeed = async (sources: Source[]): Promise<FeedItem[]> => {
  if (sources.length === 0) return [];

  const activeSources = sources.filter(s => s.active);
  if (activeSources.length === 0) return [];

  const sourcesDescription = activeSources
    .map(s => `${s.name} (${s.platform}, handle: ${s.handleOrUrl})`)
    .join(", ");

  const prompt = `
    I am building an information filter tool. 
    Act as a data simulation engine.
    
    Based on the following list of tracked sources:
    [${sourcesDescription}]

    Generate 5 to 8 hypothetical, realistic, and high-value feed items that these sources might have posted recently. 
    Vary the topics (Tech, Finance, Politics, Lifestyle, AI).
    Analyze each item to assign a sentiment and a relevance score (assuming the user is interested in Tech and Global Markets).
    
    Return the data strictly as a JSON array.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              sourceName: { type: Type.STRING },
              platform: { type: Type.STRING },
              content: { type: Type.STRING, description: "The simulated full post content" },
              summary: { type: Type.STRING, description: "A concise 1-sentence summary" },
              topic: { type: Type.STRING },
              sentiment: { type: Type.STRING, enum: ["Positive", "Neutral", "Negative"] },
              relevanceScore: { type: Type.INTEGER, description: "0 to 100" },
              timestamp: { type: Type.STRING, description: "Relative time, e.g., '2h ago'" }
            },
            required: ["sourceName", "platform", "content", "summary", "topic", "sentiment", "relevanceScore", "timestamp"]
          }
        }
      }
    });

    const rawData = JSON.parse(response.text || "[]");
    
    // Map raw data to our internal types ensuring enums match
    return rawData.map((item: any, index: number) => ({
      id: `gen-${index}-${Date.now()}`,
      sourceName: item.sourceName,
      platform: mapStringToPlatform(item.platform),
      content: item.content,
      summary: item.summary,
      topic: item.topic,
      sentiment: item.sentiment as Sentiment,
      relevanceScore: item.relevanceScore,
      timestamp: item.timestamp
    }));

  } catch (error) {
    console.error("Error generating feed:", error);
    return [];
  }
};

const mapStringToPlatform = (str: string): Platform => {
  // Simple heuristic mapper
  if (str.toLowerCase().includes("twitter") || str.toLowerCase().includes("x")) return Platform.X;
  if (str.toLowerCase().includes("zhihu")) return Platform.Zhihu;
  if (str.toLowerCase().includes("xiaohongshu")) return Platform.XiaoHongShu;
  if (str.toLowerCase().includes("news")) return Platform.News;
  return Platform.Blog;
};