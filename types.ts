export enum Platform {
  X = 'X (Twitter)',
  Zhihu = 'Zhihu',
  XiaoHongShu = 'XiaoHongShu',
  News = 'News Media',
  Blog = 'Blog/RSS'
}

export interface Source {
  id: string;
  name: string;
  handleOrUrl: string; // e.g., @elonmusk or https://...
  platform: Platform;
  active: boolean;
}

export enum Sentiment {
  Positive = 'Positive',
  Neutral = 'Neutral',
  Negative = 'Negative'
}

export interface FeedItem {
  id: string;
  sourceName: string;
  platform: Platform;
  content: string; // The raw or summarized text
  summary: string; // AI generated summary
  topic: string; // e.g., "Tech", "Politics", "Finance"
  sentiment: Sentiment;
  timestamp: string;
  relevanceScore: number; // 0-100
}

export interface AnalysisSummary {
  totalItems: number;
  topTopics: { name: string; value: number }[];
  sentimentBreakdown: { name: string; value: number }[];
}

export enum AIProvider {
  Gemini = 'Gemini',
  DeepSeek = 'DeepSeek',
  Qwen = 'Qwen'
}

export interface AppSettings {
  provider: AIProvider;
  keys: {
    [AIProvider.DeepSeek]?: string;
    [AIProvider.Qwen]?: string;
  };
}