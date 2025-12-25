import React, { useState, useEffect } from 'react';
import { Source, FeedItem, Sentiment, Platform, AppSettings, AIProvider } from '../types';
import { fetchAndAnalyzeFeed } from '../services/aiService';
import { RefreshCw, Filter, TrendingUp, AlertCircle, ExternalLink, Cpu, ChevronDown } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip } from 'recharts';

interface DashboardProps {
  sources: Source[];
  settings: AppSettings;
  setSettings: (settings: AppSettings) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ sources, settings, setSettings }) => {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterTopic, setFilterTopic] = useState<string>('All');
  const [error, setError] = useState<string | null>(null);

  const generateBriefing = async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await fetchAndAnalyzeFeed(sources, settings);
      setItems(results);
    } catch (err: any) {
      setError(err.message || "Failed to generate briefing. Check your API settings.");
    } finally {
      setLoading(false);
    }
  };

  // Initial load if items are empty and sources exist
  useEffect(() => {
    if (sources.length > 0 && items.length === 0) {
      // Don't auto-fetch to save API calls
    }
  }, [sources]);

  // Analytics Data Preparation
  const topicCounts = items.reduce((acc, item) => {
    acc[item.topic] = (acc[item.topic] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const topicData = Object.keys(topicCounts).map(key => ({ name: key, value: topicCounts[key] }));

  const sentimentCounts = items.reduce((acc, item) => {
    acc[item.sentiment] = (acc[item.sentiment] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sentimentData = [
    { name: 'Positive', value: sentimentCounts[Sentiment.Positive] || 0, color: '#10b981' }, 
    { name: 'Neutral', value: sentimentCounts[Sentiment.Neutral] || 0, color: '#64748b' }, 
    { name: 'Negative', value: sentimentCounts[Sentiment.Negative] || 0, color: '#ef4444' }, 
  ].filter(d => d.value > 0);

  const filteredItems = filterTopic === 'All' 
    ? items 
    : items.filter(i => i.topic === filterTopic);

  // Platform icon helper
  const getPlatformStyle = (p: Platform) => {
    switch (p) {
      case Platform.X: return 'bg-slate-800 text-sky-400 border-slate-700';
      case Platform.Zhihu: return 'bg-blue-900/30 text-blue-400 border-blue-800';
      case Platform.XiaoHongShu: return 'bg-red-900/30 text-red-400 border-red-800';
      default: return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  if (sources.length === 0) {
     return (
       <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400">
         <AlertCircle className="w-16 h-16 mb-4 opacity-50" />
         <h2 className="text-2xl font-bold text-slate-200 mb-2">No Sources Configured</h2>
         <p>Go to the Sources tab to add accounts you want to track.</p>
       </div>
     )
  }

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <h1 className="text-3xl font-bold text-white">Daily Intelligence Brief</h1>
          </div>
          <p className="text-slate-400 text-sm">
             AI-Synthesized feed from {sources.filter(s => s.active).length} active sources
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {/* Model Selector */}
          <div className="relative group min-w-[160px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Cpu className="h-4 w-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
            </div>
            <select
              value={settings.provider}
              onChange={(e) => setSettings({ ...settings, provider: e.target.value as AIProvider })}
              disabled={loading}
              className="appearance-none pl-10 pr-10 py-3 bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all cursor-pointer w-full font-medium"
            >
              {Object.values(AIProvider).map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <ChevronDown className="h-4 w-4 text-slate-500" />
            </div>
          </div>

          <button
            onClick={generateBriefing}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg shadow-blue-900/20 whitespace-nowrap"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Analyzing...' : 'Generate New Briefing'}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-900/20 border border-red-500/50 text-red-200 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          {error}
        </div>
      )}

      {items.length > 0 && (
        <>
          {/* Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-1 md:col-span-2 bg-slate-800/50 border border-slate-700 rounded-2xl p-6 backdrop-blur-sm">
              <h3 className="text-slate-200 font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                Topic Distribution
              </h3>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topicData} layout="vertical" margin={{ left: 20 }}>
                     <XAxis type="number" hide />
                     <YAxis dataKey="name" type="category" width={80} stroke="#94a3b8" fontSize={12} />
                     <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                        itemStyle={{ color: '#60a5fa' }}
                        cursor={{fill: 'transparent'}}
                     />
                     <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 backdrop-blur-sm">
              <h3 className="text-slate-200 font-semibold mb-4">Sentiment Analysis</h3>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sentimentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {sentimentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f1f5f9' }}
                      itemStyle={{ color: '#f1f5f9' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Feed Filter */}
          <div className="flex items-center gap-4 overflow-x-auto pb-2">
            <Filter className="w-5 h-5 text-slate-500 flex-shrink-0" />
            <button 
              onClick={() => setFilterTopic('All')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filterTopic === 'All' ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
            >
              All Topics
            </button>
            {topicData.map(topic => (
              <button 
                key={topic.name}
                onClick={() => setFilterTopic(topic.name)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filterTopic === topic.name ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
              >
                {topic.name}
              </button>
            ))}
          </div>

          {/* Feed List */}
          <div className="space-y-4">
            {filteredItems.map(item => (
              <div key={item.id} className="group bg-slate-900 border border-slate-800 hover:border-slate-700 p-6 rounded-2xl transition-all hover:shadow-lg hover:shadow-black/20">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold border ${getPlatformStyle(item.platform)}`}>
                      {item.platform}
                    </span>
                    <span className="font-semibold text-slate-200">{item.sourceName}</span>
                    <span className="text-slate-500 text-sm">{item.timestamp}</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="flex items-center gap-1 px-2 py-0.5 bg-slate-800 rounded text-xs text-slate-400 border border-slate-700">
                        <span>Relevance</span>
                        <span className={item.relevanceScore > 80 ? 'text-green-400' : 'text-yellow-400'}>
                          {item.relevanceScore}%
                        </span>
                     </div>
                  </div>
                </div>

                <p className="text-slate-300 leading-relaxed mb-4 whitespace-pre-wrap">
                  {item.summary}
                </p>

                <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800/50 mb-4">
                   <p className="text-xs text-slate-500 font-mono mb-1 uppercase">Simulated Raw Content</p>
                   <p className="text-sm text-slate-400 italic whitespace-pre-wrap">"{item.content}"</p>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800/50">
                  <div className="flex gap-2">
                    <span className="text-xs px-2 py-1 bg-slate-800 text-slate-400 rounded-md">#{item.topic}</span>
                    <span className={`text-xs px-2 py-1 rounded-md bg-opacity-20 ${
                      item.sentiment === Sentiment.Positive ? 'bg-green-500 text-green-400' :
                      item.sentiment === Sentiment.Negative ? 'bg-red-500 text-red-400' :
                      'bg-slate-500 text-slate-400'
                    }`}>
                      {item.sentiment}
                    </span>
                  </div>
                  <button className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    View Source <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {!loading && items.length === 0 && sources.length > 0 && (
         <div className="text-center py-20 text-slate-500">
            <p>Ready to analyze. Click "Generate New Briefing" to start the simulation.</p>
         </div>
      )}
    </div>
  );
};