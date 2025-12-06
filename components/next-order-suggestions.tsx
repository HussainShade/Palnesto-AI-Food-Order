'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { getNextOrderRecs } from '@/app/actions/ai-actions';
import { useCartStore } from '@/lib/store/cart-store';
import type { AISuggestion } from '@/lib/types';

interface NextOrderSuggestionsProps {
  orderId: string | null;
}

export function NextOrderSuggestions({ orderId }: NextOrderSuggestionsProps) {
  const router = useRouter();
  const { addItem } = useCartStore();
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        setLoading(true);
        const recs = await getNextOrderRecs(orderId);
        setSuggestions(recs);
      } catch (error) {
        console.error('Error fetching next order suggestions:', error);
      } finally {
        setLoading(false);
      }
    };

    // Delay to avoid blocking success page
    const timeoutId = setTimeout(fetchSuggestions, 500);
    return () => clearTimeout(timeoutId);
  }, [orderId]);

  if (!orderId || loading || suggestions.length === 0) {
    return null;
  }

  const handleAddToCart = (suggestion: AISuggestion) => {
    addItem({
      foodItemId: suggestion.foodId,
      name: suggestion.name,
      price: suggestion.price,
      image: suggestion.image,
    });
    router.push('/');
  };

  return (
    <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl shadow-lg p-6 border border-green-200">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-green-600" />
        <h3 className="text-lg font-bold text-gray-900">Try These Next Time</h3>
      </div>
      <p className="text-sm text-gray-600 mb-4">You might enjoy these items on your next order:</p>
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
                className="bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
              >
                Order Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

