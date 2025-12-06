'use client';

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

interface AIInsightsProps {
  getInsight: () => Promise<{ insight: string; type: 'success' | 'warning' | 'info' | 'error' } | null>;
}

export function AIInsights({ getInsight }: AIInsightsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [insight, setInsight] = useState<{ insight: string; type: string } | null>(null);
  const [hasTriggered, setHasTriggered] = useState(false);

  const handleAnalyze = async () => {
    setHasTriggered(true);

    const fetchInsight = async () => {
      try {
        setIsLoading(true);
        const result = await getInsight();
        if (result) {
          setInsight(result);
        }
      } catch (error) {
        console.error('Error fetching AI insight:', error);
      } finally {
        setIsLoading(false);
      }
    };

    await fetchInsight();
  };

  // Show trigger button if not yet triggered
  if (!hasTriggered) {
    return (
      <button
        onClick={handleAnalyze}
        className="mb-4 flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl cursor-pointer"
      >
        <Sparkles className="w-5 h-5" />
        🔍 AI Analysis
      </button>
    );
  }

  if (isLoading) {
    return (
      <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
        <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
        <p className="text-sm text-blue-800">AI is analyzing data...</p>
      </div>
    );
  }

  if (!insight) {
    return (
      <div className="mb-4">
        <button
          onClick={handleAnalyze}
          className="mb-2 flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl cursor-pointer"
        >
          <Sparkles className="w-5 h-5" />
          🔍 AI Analysis
        </button>
        <div className="text-sm text-gray-500">No insights available at this time.</div>
      </div>
    );
  }

  const bgColors = {
    success: 'bg-green-50 border-green-200',
    warning: 'bg-yellow-50 border-yellow-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
  };

  const textColors = {
    success: 'text-green-800',
    warning: 'text-yellow-800',
    error: 'text-red-800',
    info: 'text-blue-800',
  };

  return (
    <div className={`mb-4 ${bgColors[insight.type as keyof typeof bgColors]} border rounded-xl p-4`}>
      <div className="flex items-start gap-3">
        <Sparkles className={`w-5 h-5 ${textColors[insight.type as keyof typeof textColors]} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <p className={`text-sm font-semibold mb-2 ${textColors[insight.type as keyof typeof textColors]}`}>
            AI Insight
          </p>
          <div className={`text-sm ${textColors[insight.type as keyof typeof textColors]} space-y-1`}>
            {insight.insight.split('\n').map((line, index) => {
              const trimmedLine = line.trim();
              if (!trimmedLine) return null;
              // Remove leading bullet if present (AI might add it)
              const cleanLine = trimmedLine.replace(/^[•\-\*]\s*/, '');
              return (
                <div key={index} className="flex items-start gap-2">
                  <span className="flex-shrink-0">•</span>
                  <span>{cleanLine}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

