import { GoogleGenAI, Type } from "@google/genai";
import { Source, FeedItem, Sentiment, Platform, AIProvider, AppSettings } from "../types";

// Initialize Gemini Client (System Default)
const geminiClient = new GoogleGenAI({ apiKey: process.env.API_KEY });

const mapStringToPlatform = (str: string): Platform => {
  if (str.toLowerCase().includes("twitter") || str.toLowerCase().includes("x")) return Platform.X;
  if (str.toLowerCase().includes("zhihu")) return Platform.Zhihu;
  if (str.toLowerCase().includes("xiaohongshu")) return Platform.XiaoHongShu;
  if (str.toLowerCase().includes("news")) return Platform.News;
  return Platform.Blog;
};

// Common Prompt Logic
const getSystemPrompt = () => `
  You are an advanced information filtering assistant.
  Act as a data simulation engine for a user interested in Tech, Global Markets, and AI.
  
  Your task:
  1. Analyze the provided list of tracked sources.
  2. Generate 5 to 8 hypothetical, high-quality feed items that these sources might have posted recently.
  3. Analyze each item to assign a sentiment and a relevance score (0-100).
  4. The 'summary' field MUST be in Chinese (summarize the content in Chinese).
  5. If the generated 'content' is not in Chinese, you MUST append the Chinese translation to the 'content' field (e.g., "Original Text... \n\n[Translation]: ...").
  6. Return the data strictly as a JSON array.
`;

const getUserPrompt = (sources: Source[]) => {
  const activeSources = sources.filter(s => s.active);
  const sourcesDescription = activeSources
    .map(s => `${s.name} (${s.platform}, handle: ${s.handleOrUrl})`)
    .join(", ");

  return `
    Sources to simulate:
    [${sourcesDescription}]

    Output Format JSON Array:
    [
      {
        "sourceName": "string",
        "platform": "string (X, Zhihu, XiaoHongShu, News, Blog)",
        "content": "string (full post text)",
        "summary": "string (1 sentence summary in Chinese)",
        "topic": "string (e.g. AI, Finance, Politics)",
        "sentiment": "string (Positive, Neutral, Negative)",
        "relevanceScore": number (0-100),
        "timestamp": "string (e.g. '2h ago')"
      }
    ]
  `;
};

// Provider: Google Gemini
const fetchGemini = async (sources: Source[]): Promise<FeedItem[]> => {
  try {
    const response = await geminiClient.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: getUserPrompt(sources),
      config: {
        systemInstruction: getSystemPrompt(),
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              sourceName: { type: Type.STRING },
              platform: { type: Type.STRING },
              content: { type: Type.STRING },
              summary: { type: Type.STRING },
              topic: { type: Type.STRING },
              sentiment: { type: Type.STRING, enum: ["Positive", "Neutral", "Negative"] },
              relevanceScore: { type: Type.INTEGER },
              timestamp: { type: Type.STRING }
            },
            required: ["sourceName", "platform", "content", "summary", "topic", "sentiment", "relevanceScore", "timestamp"]
          }
        }
      }
    });

    const rawData = JSON.parse(response.text || "[]");
    return rawData.map((item: any, index: number) => ({
      id: `gemini-${index}-${Date.now()}`,
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
    console.error("Gemini Error:", error);
    throw error;
  }
};

// Generic OpenAI Compatible Fetch (DeepSeek / Qwen)
const fetchOpenAICompatible = async (
  sources: Source[], 
  apiKey: string, 
  baseUrl: string, 
  model: string,
  providerId: string
): Promise<FeedItem[]> => {
  if (!apiKey) throw new Error(`Missing API Key for ${providerId}`);

  const prompt = `${getSystemPrompt()}\n\n${getUserPrompt(sources)}\n\nIMPORTANT: Return ONLY valid JSON.`;

  try {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: 'You are a helpful assistant that outputs JSON.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: "json_object" },
        stream: false
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`API Error ${response.status}: ${err}`);
    }

    const data = await response.json();
    const contentString = data.choices?.[0]?.message?.content || "[]";
    
    // Attempt to parse JSON (handling potential markdown code blocks)
    const cleanJson = contentString.replace(/```json/g, '').replace(/```/g, '').trim();
    let rawData;
    
    try {
        rawData = JSON.parse(cleanJson);
        // Handle if the model wraps it in a key like "items"
        if (!Array.isArray(rawData) && rawData.items) rawData = rawData.items;
        if (!Array.isArray(rawData)) rawData = [rawData]; // Fallback
    } catch (e) {
        console.error("Failed to parse JSON from provider", e);
        return [];
    }

    return rawData.map((item: any, index: number) => ({
      id: `${providerId}-${index}-${Date.now()}`,
      sourceName: item.sourceName,
      platform: mapStringToPlatform(item.platform || ''),
      content: item.content,
      summary: item.summary,
      topic: item.topic || 'General',
      sentiment: (item.sentiment as Sentiment) || Sentiment.Neutral,
      relevanceScore: item.relevanceScore || 50,
      timestamp: item.timestamp || 'Just now'
    }));

  } catch (error) {
    console.error(`${providerId} Error:`, error);
    throw error;
  }
};

export const fetchAndAnalyzeFeed = async (sources: Source[], settings: AppSettings): Promise<FeedItem[]> => {
  if (sources.length === 0 || sources.filter(s => s.active).length === 0) return [];

  switch (settings.provider) {
    case AIProvider.DeepSeek:
      return fetchOpenAICompatible(
        sources, 
        settings.keys[AIProvider.DeepSeek] || '', 
        'https://api.deepseek.com/chat/completions',
        'deepseek-reasoner',
        'deepseek'
      );
    case AIProvider.Qwen:
      // Using DashScope OpenAI compatible endpoint
      return fetchOpenAICompatible(
        sources, 
        settings.keys[AIProvider.Qwen] || '', 
        'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
        'qwen-plus',
        'qwen'
      );
    case AIProvider.Gemini:
    default:
      return fetchGemini(sources);
  }
};