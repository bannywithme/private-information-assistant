import React from 'react';
import { Activity, Layers, Settings, Radio } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'dashboard' | 'sources' | 'settings';
  onTabChange: (tab: 'dashboard' | 'sources' | 'settings') => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-20 md:w-64 flex-shrink-0 border-r border-slate-800 bg-slate-950 flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Radio className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight hidden md:block">InfoFilter</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'dashboard' 
                ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' 
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <Activity className="w-5 h-5" />
            <span className="hidden md:block font-medium">Briefing & Feed</span>
          </button>

          <button
            onClick={() => onTabChange('sources')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'sources' 
                ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' 
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <Layers className="w-5 h-5" />
            <span className="hidden md:block font-medium">Source Manager</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={() => onTabChange('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'settings'
                ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20'
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="hidden md:block">Settings</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto relative">
        {children}
      </main>
    </div>
  );
};