import { useState } from 'react';

export default function AuthOverlay() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleAuth = async (provider: 'copilot' | 'gemini') => {
    setLoading(provider);
    try {
      // In a real scenario, this hits a backend endpoint that runs the CLI login
      // and returns the URL or just triggers the local browser open.
      const endpoint = provider === 'copilot' ? '/api/auth/copilot' : '/api/auth/gemini';
      await fetch(`http://localhost:8000${endpoint}`, { method: 'POST' });
      alert(`Check your browser to complete ${provider} authentication.`);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="border-b border-white/10 pb-4">
        <h2 className="text-xl font-bold text-cyan-400 tracking-wider">LLM AUTHENTICATION</h2>
        <p className="text-xs text-white/50 mt-1 uppercase tracking-tighter">Required for response generation</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* GitHub Copilot */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-3 group hover:border-cyan-500/50 transition-colors">
          <div className="flex justify-between items-center">
            <span className="font-bold text-sm">GITHUB COPILOT</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-green-500/20 text-green-400">FREE TIER</span>
          </div>
          <p className="text-[10px] text-white/60 leading-relaxed">
            Uses your GitHub account for high-quality coding assistance. No API key required.
          </p>
          <button 
            onClick={() => handleAuth('copilot')}
            disabled={loading !== null}
            className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-900 text-black font-bold text-[10px] rounded-lg transition-all uppercase"
          >
            {loading === 'copilot' ? 'Authenticating...' : 'Link GitHub Account'}
          </button>
        </div>

        {/* Google Gemini */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-3 group hover:border-green-500/50 transition-colors">
          <div className="flex justify-between items-center">
            <span className="font-bold text-sm">GOOGLE GEMINI</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-green-500/20 text-green-400">FREE TIER</span>
          </div>
          <p className="text-[10px] text-white/60 leading-relaxed">
            Uses your Google account for multi-modal reasoning. No API key required.
          </p>
          <button 
            onClick={() => handleAuth('gemini')}
            disabled={loading !== null}
            className="w-full py-2 bg-green-600 hover:bg-green-500 disabled:bg-green-900 text-black font-bold text-[10px] rounded-lg transition-all uppercase"
          >
            {loading === 'gemini' ? 'Authenticating...' : 'Link Google Account'}
          </button>
        </div>
      </div>

      <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
        <p className="text-[9px] text-red-400 leading-tight uppercase font-bold">
          Note: This will open a browser window on your machine.
        </p>
      </div>
    </div>
  );
}
