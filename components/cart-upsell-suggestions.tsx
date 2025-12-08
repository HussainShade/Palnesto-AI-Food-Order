'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Sparkles } from 'lucide-react';
import { getCartUpsells } from '@/app/actions/ai-actions';
import { useCartStore } from '@/lib/store/cart-store';
import type { AISuggestion } from '@/lib/types';

export function CartUpsellSuggestions() {
  const { items, addItem } = useCartStore();
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (items.length === 0) {
      setLoading(false);
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        setLoading(true);
        const cartItemIds = items.map((item) => item.foodItemId);
        const upsells = await getCartUpsells(cartItemIds);
        setSuggestions(upsells);
      } catch (error: any) {
        // Suppress quota error logs - fallback logic handles it gracefully
        if (error?.status !== 429 && error?.error?.code !== 429) {
          console.error('Error fetching upsell suggestions:', error);
        }
        // Fallback suggestions are already returned from server
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    // Delay to avoid blocking cart display
    const timeoutId = setTimeout(fetchSuggestions, 500);
    return () => clearTimeout(timeoutId);
  }, [items]);

  const handleAddToCart = (suggestion: AISuggestion) => {
    // Set loading immediately when item is added
    setLoading(true);
    addItem({
      foodItemId: suggestion.foodId,
      name: suggestion.name,
      price: suggestion.price,
      image: suggestion.image,
    });
    // The useEffect will trigger automatically when items change
  };

  // Don't show anything if cart is empty
  if (items.length === 0) {
    return null;
  }

  // Show loading state with AI loader
  if (loading) {
    return (
      <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl shadow-lg p-6 border border-blue-200">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" />
          <h3 className="text-lg font-bold text-gray-900">Complete Your Meal</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <Sparkles className="w-6 h-6 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <p className="text-sm text-gray-600 font-medium">AI is finding perfect suggestions for your cart...</p>
          </div>
        </div>
      </div>
    );
  }

  // Don't show if no suggestions
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl shadow-lg p-6 border border-blue-200">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-bold text-gray-900">Complete Your Meal</h3>
      </div>
      <p className="text-sm text-gray-600 mb-4">Add these items to make your order perfect:</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.foodId}
            className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="relative w-full h-32 bg-gray-200 rounded-lg overflow-hidden mb-3">
              <Image
                src={suggestion.image}
                alt={suggestion.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
            <h4 className="font-semibold text-gray-900 mb-1 truncate">{suggestion.name}</h4>
            <p className="text-xs text-gray-600 mb-2 line-clamp-2">{suggestion.reason}</p>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-orange-600">₹{suggestion.price.toFixed(2)}</span>
              <button
                onClick={() => handleAddToCart(suggestion)}
                className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
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

