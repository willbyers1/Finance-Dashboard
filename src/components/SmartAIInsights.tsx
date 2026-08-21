import React, { useState, useEffect } from 'react';
import { Sparkles, Send, Bot, RefreshCw, AlertCircle, Lightbulb } from 'lucide-react';

export const SmartAIInsights: React.FC = () => {
  const [insight, setInsight] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [question, setQuestion] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async (customQuestion?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: customQuestion }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch insights');
      setInsight(data.insight);
    } catch (err: any) {
      setError(err.message || 'AI Insight generation failed');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const handleSendQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    fetchInsights(question);
    setQuestion('');
  };

  return (
    <div id="ai-insights-card" className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-600/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Gemini AI Financial Advisor</h3>
            <p className="text-[11px] text-slate-500">Server-side intelligent spending analysis</p>
          </div>
        </div>
        <button
          onClick={() => fetchInsights()}
          disabled={isLoading}
          className="p-1.5 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          title="Refresh Analysis"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* AI Analysis Box */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed font-sans min-h-32">
        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-slate-500 gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
            <span>Analyzing transactions and generating spending advice...</span>
          </div>
        ) : insight ? (
          <div className="prose prose-xs max-w-none space-y-2 text-slate-800 whitespace-pre-line">
            {insight}
          </div>
        ) : (
          <div className="text-slate-500 text-center py-6">
            Click refresh to generate AI financial checkup.
          </div>
        )}
      </div>

      {/* Question Form */}
      <form onSubmit={handleSendQuestion} className="flex gap-2">
        <input
          type="text"
          placeholder="Ask AI e.g. 'How can I cut my food & dining expenses?'"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
        />
        <button
          type="submit"
          disabled={isLoading || !question.trim()}
          className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-all disabled:opacity-50 flex items-center gap-1.5"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Ask</span>
        </button>
      </form>
    </div>
  );
};
