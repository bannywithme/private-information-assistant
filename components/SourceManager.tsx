import React, { useState } from 'react';
import { Source, Platform } from '../types';
import { Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';

interface SourceManagerProps {
  sources: Source[];
  setSources: React.Dispatch<React.SetStateAction<Source[]>>;
}

export const SourceManager: React.FC<SourceManagerProps> = ({ sources, setSources }) => {
  const [newHandle, setNewHandle] = useState('');
  const [newPlatform, setNewPlatform] = useState<Platform>(Platform.X);

  const handleAdd = () => {
    if (!newHandle.trim()) return;
    const newSource: Source = {
      id: Date.now().toString(),
      name: newHandle.startsWith('@') ? newHandle : `@${newHandle}`,
      handleOrUrl: newHandle,
      platform: newPlatform,
      active: true,
    };
    setSources([...sources, newSource]);
    setNewHandle('');
  };

  const toggleActive = (id: string) => {
    setSources(sources.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  const removeSource = (id: string) => {
    setSources(sources.filter(s => s.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-white">Data Sources</h2>
        <p className="text-slate-400">Manage the information streams you want to monitor. Gemini will simulate scraping these targets.</p>
      </div>

      {/* Add New Source */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-slate-200 mb-4">Add Target</h3>
        <div className="flex flex-col md:flex-row gap-4">
          <select 
            value={newPlatform}
            onChange={(e) => setNewPlatform(e.target.value as Platform)}
            className="bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.values(Platform).map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="e.g. @elonmusk, TechCrunch, etc."
            value={newHandle}
            onChange={(e) => setNewHandle(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-600"
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <button 
            onClick={handleAdd}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 justify-center"
          >
            <Plus className="w-5 h-5" />
            <span>Track</span>
          </button>
        </div>
      </div>

      {/* Source List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sources.map(source => (
          <div 
            key={source.id}
            className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
              source.active 
                ? 'bg-slate-800 border-slate-700' 
                : 'bg-slate-900/50 border-slate-800 opacity-60'
            }`}
          >
            <div className="flex items-center gap-4">
              <button onClick={() => toggleActive(source.id)} className="text-slate-400 hover:text-blue-400 transition-colors">
                {source.active ? <CheckCircle2 className="w-6 h-6 text-blue-500" /> : <Circle className="w-6 h-6" />}
              </button>
              <div>
                <p className="font-semibold text-slate-200">{source.name}</p>
                <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">{source.platform}</span>
              </div>
            </div>
            <button 
              onClick={() => removeSource(source.id)}
              className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        
        {sources.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">
            No sources tracked yet. Add one above.
          </div>
        )}
      </div>
    </div>
  );
};