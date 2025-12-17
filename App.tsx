import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { SourceManager } from './components/SourceManager';
import { Source, Platform } from './types';

// Default mock sources to help the user get started
const DEFAULT_SOURCES: Source[] = [
  { id: '1', name: '@elonmusk', handleOrUrl: '@elonmusk', platform: Platform.X, active: true },
  { id: '2', name: 'Y Combinator', handleOrUrl: '@ycombinator', platform: Platform.X, active: true },
  { id: '3', name: 'TechCrunch', handleOrUrl: 'https://techcrunch.com', platform: Platform.News, active: true },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'sources'>('dashboard');
  const [sources, setSources] = useState<Source[]>(DEFAULT_SOURCES);

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'dashboard' ? (
        <Dashboard sources={sources} />
      ) : (
        <SourceManager sources={sources} setSources={setSources} />
      )}
    </Layout>
  );
};

export default App;