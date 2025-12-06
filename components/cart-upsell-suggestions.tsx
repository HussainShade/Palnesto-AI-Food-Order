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
      return;
    }

    const fetchSuggestions = async () => {
      try {
        setLoading(true);
        const cartItemIds = items.map((item) => item.foodItemId);
        const upsells = await getCartUpsells(cartItemIds);
        setSuggestions(upsells);
      } catch (error) {
        console.error('Error fetching upsell suggestions:', error);
      } finally {
        setLoading(false);
      }
    };

    // Delay to avoid blocking cart display
    const timeoutId = setTimeout(fetchSuggestions, 500);
    return () => clearTimeout(timeoutId);
  }, [items]);

  if (items.length === 0 || loading || suggestions.length === 0) {
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

