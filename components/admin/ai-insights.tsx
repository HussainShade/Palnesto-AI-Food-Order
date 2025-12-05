'use client';

import { useEffect, useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

interface AIInsightsProps {
  getInsight: () => Promise<{ insight: string; type: 'success' | 'warning' | 'info' | 'error' } | null>;
}

export function AIInsights({ getInsight }: AIInsightsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [insight, setInsight] = useState<{ insight: string; type: string } | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchInsight = async () => {
      try {
        setIsLoading(true);
        const result = await getInsight();
        if (mounted && result) {
          setInsight(result);
          // Toast notifications removed - only show inline panel
        }
      } catch (error) {
        console.error('Error fetching AI insight:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Delay to avoid blocking page load
    const timeoutId = setTimeout(fetchInsight, 500);

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, [getInsight]);

  if (isLoading) {
    return (
      <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
        <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
        <p className="text-sm text-blue-800">AI is analyzing data...</p>
      </div>
    );
  }

  if (!insight) return null;

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
          <p className={`text-sm font-semibold mb-1 ${textColors[insight.type as keyof typeof textColors]}`}>
            AI Insight
          </p>
          <p className={`text-sm ${textColors[insight.type as keyof typeof textColors]}`}>
            {insight.insight}
          </p>
        </div>
      </div>
    </div>
  );
}

