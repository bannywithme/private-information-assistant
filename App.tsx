import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { SourceManager } from './components/SourceManager';
import { Settings } from './components/Settings';
import { Source, Platform, AppSettings, AIProvider } from './types';

// Default mock sources to help the user get started
const DEFAULT_SOURCES: Source[] = [
  { id: '1', name: '@elonmusk', handleOrUrl: '@elonmusk', platform: Platform.X, active: true },
  { id: '2', name: 'Y Combinator', handleOrUrl: '@ycombinator', platform: Platform.X, active: true },
  { id: '3', name: 'TechCrunch', handleOrUrl: 'https://techcrunch.com', platform: Platform.News, active: true },
];

const DEFAULT_SETTINGS: AppSettings = {
  provider: AIProvider.Gemini,
  keys: {}
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'sources' | 'settings'>('dashboard');
  const [sources, setSources] = useState<Source[]>(DEFAULT_SOURCES);
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('infofilter_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem('infofilter_settings', JSON.stringify(settings));
  }, [settings]);

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'dashboard' ? (
        <Dashboard sources={sources} settings={settings} setSettings={setSettings} />
      ) : activeTab === 'sources' ? (
        <SourceManager sources={sources} setSources={setSources} />
      ) : (
        <Settings settings={settings} setSettings={setSettings} />
      )}
    </Layout>
  );
};

export default App;