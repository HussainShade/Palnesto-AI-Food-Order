'use client';

import Image from 'next/image';
import { useCartStore } from '@/lib/store/cart-store';
import { useState, useEffect } from 'react';
import { getPairingSuggestion } from '@/app/actions/ai-actions';
import toast from 'react-hot-toast';
import type { FoodItemWithIngredients } from '@/lib/types';
import type { AISuggestion } from '@/lib/types';

interface FoodCardProps {
  foodItem: FoodItemWithIngredients;
}

export function FoodCard({ foodItem }: FoodCardProps) {
  const { addItem, items, updateQuantity } = useCartStore();
  const [suggestion, setSuggestion] = useState<AISuggestion | null>(null);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);

  const cartItem = items.find((item) => item.foodItemId === foodItem.id);
  const quantity = cartItem?.quantity || 0;

  useEffect(() => {
    if (quantity > 0 && !suggestion && !loadingSuggestion) {
      let cancelled = false;
      
      // Use setTimeout to defer state update
      const timeoutId = setTimeout(() => {
        if (!cancelled) {
          setLoadingSuggestion(true);
        }
      }, 0);
      
      getPairingSuggestion(foodItem.id)
        .then((sug) => {
          if (!cancelled && sug) {
            setSuggestion(sug);
            toast.success(`💡 Try ${sug.name} with this!`, {
              duration: 5000,
            });
          }
        })
        .catch(() => {})
        .finally(() => {
          if (!cancelled) {
            setLoadingSuggestion(false);
          }
        });

      return () => {
        cancelled = true;
        clearTimeout(timeoutId);
      };
    }
  }, [quantity, foodItem.id, suggestion, loadingSuggestion]);

  const handleAdd = () => {
    addItem({
      foodItemId: foodItem.id,
      name: foodItem.name,
      price: foodItem.price,
      image: foodItem.image,
    });
  };

  const handleIncrement = () => {
    updateQuantity(foodItem.id, quantity + 1);
  };

  const handleDecrement = () => {
    updateQuantity(foodItem.id, quantity - 1);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div className="relative w-full h-48 bg-gray-200">
        <Image
          src={foodItem.image}
          alt={foodItem.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="p-4">
        <h3 className="text-xl font-bold mb-1">{foodItem.name}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{foodItem.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-orange-600">₹{foodItem.price.toFixed(2)}</span>
          <div className="flex items-center gap-2">
            {quantity === 0 ? (
              <button
                onClick={handleAdd}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-xl transition-colors cursor-pointer"
              >
                Add
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDecrement}
                  className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold text-lg transition-colors cursor-pointer"
                >
                  -
                </button>
                <span className="w-8 text-center font-bold text-lg">{quantity}</span>
                <button
                  onClick={handleIncrement}
                  className="w-10 h-10 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center font-bold text-lg transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>
            )}
          </div>
        </div>
        {suggestion && quantity > 0 && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-800 font-semibold mb-1">💡 Pairing Suggestion</p>
            <p className="text-sm text-blue-700">{suggestion.reason}</p>
          </div>
        )}
      </div>
    </div>
  );
}

