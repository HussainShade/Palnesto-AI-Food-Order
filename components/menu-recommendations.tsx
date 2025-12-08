'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { getMenuRecs } from '@/app/actions/ai-actions';
import { useCartStore } from '@/lib/store/cart-store';
import type { AISuggestion } from '@/lib/types';

export function MenuRecommendations() {
  const { addItem } = useCartStore();
  const router = useRouter();
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const recs = await getMenuRecs();
        setSuggestions(recs);
      } catch (error: unknown) {
        // Suppress quota error logs - fallback logic handles it gracefully
        const apiError = error as { status?: number; error?: { code?: number } };
        if (apiError?.status !== 429 && apiError?.error?.code !== 429) {
          console.error('Error fetching menu recommendations:', error);
        }
        // Fallback recommendations are already returned from server
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    // Delay to avoid blocking page load
    const timeoutId = setTimeout(fetchRecommendations, 800);
    return () => clearTimeout(timeoutId);
  }, []);

  if (loading) {
    return (
      <div className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl shadow-lg p-6 border border-blue-200">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" />
          <h3 className="text-lg font-bold text-gray-900">Recommended for You</h3>
        </div>
        <p className="text-sm text-gray-600">Loading recommendations...</p>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  const handleAddToCart = (suggestion: AISuggestion) => {
    addItem({
      foodItemId: suggestion.foodId,
      name: suggestion.name,
      price: suggestion.price,
      image: suggestion.image,
    });
  };

  return (
    <div className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl shadow-lg p-6 border border-blue-200">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-bold text-gray-900">Recommended for You</h3>
      </div>
      <p className="text-sm text-gray-600 mb-4">Perfect choices for right now:</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.foodId}
            className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => router.push(`/?highlight=${suggestion.foodId}`)}
          >
            <div className="relative w-full h-32 bg-gray-200 rounded-lg overflow-hidden mb-3">
              <Image
                src={suggestion.image}
                alt={suggestion.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 20vw"
              />
            </div>
            <h4 className="font-semibold text-gray-900 mb-1 truncate text-sm">{suggestion.name}</h4>
            <p className="text-xs text-gray-600 mb-2 line-clamp-2">{suggestion.reason}</p>
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-orange-600">₹{suggestion.price.toFixed(2)}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart(suggestion);
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

