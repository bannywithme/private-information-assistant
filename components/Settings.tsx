import React from 'react';
import { AppSettings, AIProvider } from '../types';
import { Save, Key, Cpu } from 'lucide-react';

interface SettingsProps {
  settings: AppSettings;
  setSettings: (s: AppSettings) => void;
}

export const Settings: React.FC<SettingsProps> = ({ settings, setSettings }) => {
  
  const handleProviderChange = (provider: AIProvider) => {
    setSettings({ ...settings, provider });
  };

  const handleKeyChange = (provider: AIProvider, key: string) => {
    setSettings({
      ...settings,
      keys: {
        ...settings.keys,
        [provider]: key
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-white">System Settings</h2>
        <p className="text-slate-400">Configure your Intelligence Engine and API connections.</p>
      </div>

      {/* Model Selection */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Cpu className="w-6 h-6 text-blue-400" />
          </div>
          <div>
             <h3 className="text-lg font-semibold text-slate-200">AI Model Provider</h3>
             <p className="text-sm text-slate-500">Select the underlying intelligence model used for simulation and analysis.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[AIProvider.Gemini, AIProvider.DeepSeek, AIProvider.Qwen].map((provider) => (
            <button
              key={provider}
              onClick={() => handleProviderChange(provider)}
              className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                settings.provider === provider
                  ? 'bg-blue-600/10 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.15)]'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-600'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`font-bold ${settings.provider === provider ? 'text-blue-400' : 'text-slate-200'}`}>
                  {provider}
                </span>
                {settings.provider === provider && (
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                )}
              </div>
              <p className="text-xs text-slate-500">
                {provider === AIProvider.Gemini ? 'Google GenAI (Default)' : 
                 provider === AIProvider.DeepSeek ? 'DeepSeek V3' : 'Qwen 2.5 (Alibaba)'}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* API Configuration */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-6">
           <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <Key className="w-6 h-6 text-purple-400" />
          </div>
          <div>
             <h3 className="text-lg font-semibold text-slate-200">API Credentials</h3>
             <p className="text-sm text-slate-500">
               Configure access keys for third-party providers. 
               <br/>
               <span className="text-xs opacity-70 italic">Keys are stored locally in your browser and never sent to our servers.</span>
             </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Gemini Info */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-slate-800 opacity-60">
             <div className="flex flex-col">
                <label className="text-sm font-medium text-slate-400">Gemini API Key</label>
                <span className="text-xs text-slate-600">Managed by Environment (Pre-configured)</span>
             </div>
             <div className="text-slate-500 text-sm font-mono">••••••••••••••••</div>
          </div>

          {/* DeepSeek Key */}
          <div className={`transition-opacity ${settings.provider === AIProvider.DeepSeek ? 'opacity-100' : 'opacity-50'}`}>
             <label className="block text-sm font-medium text-slate-300 mb-2">DeepSeek API Key</label>
             <input 
                type="password"
                placeholder="sk-..."
                value={settings.keys[AIProvider.DeepSeek] || ''}
                onChange={(e) => handleKeyChange(AIProvider.DeepSeek, e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
             />
          </div>

          {/* Qwen Key */}
          <div className={`transition-opacity ${settings.provider === AIProvider.Qwen ? 'opacity-100' : 'opacity-50'}`}>
             <label className="block text-sm font-medium text-slate-300 mb-2">Qwen (DashScope) API Key</label>
             <input 
                type="password"
                placeholder="sk-..."
                value={settings.keys[AIProvider.Qwen] || ''}
                onChange={(e) => handleKeyChange(AIProvider.Qwen, e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
             />
          </div>
        </div>
      </div>
    </div>
  );
};