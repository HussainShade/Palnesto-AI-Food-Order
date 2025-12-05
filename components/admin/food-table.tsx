'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Search } from 'lucide-react';
import type { FoodItemWithIngredients } from '@/lib/types';

interface FoodTableProps {
  foodItems: FoodItemWithIngredients[];
}

export function FoodTable({ foodItems }: FoodTableProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFoods = useMemo(() => {
    if (!searchQuery.trim()) {
      return foodItems;
    }

    const query = searchQuery.toLowerCase();
    return foodItems.filter((food) => {
      const matchesName = food.name.toLowerCase().includes(query);
      const matchesDescription = food.description.toLowerCase().includes(query);
      const matchesIngredient = food.ingredients.some((ing) =>
        ing.ingredient.name.toLowerCase().includes(query)
      );
      return matchesName || matchesDescription || matchesIngredient;
    });
  }, [foodItems, searchQuery]);

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">All Foods</h2>
          <div className="text-sm text-gray-600">
            Showing {filteredFoods.length} of {foodItems.length} foods
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, description, or ingredient..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        {filteredFoods.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 text-lg">No foods found matching your search.</p>
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFoods.map((food) => (
              <div
                key={food.id}
                className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={food.image}
                      alt={food.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">
                      {food.name}
                    </h3>
                    <p className="text-orange-600 font-semibold mb-1">
                      ₹{food.price.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600 line-clamp-2">{food.description}</p>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Ingredients ({food.ingredients.length}):
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {food.ingredients.map((foodIngredient) => {
                      const ingredient = foodIngredient.ingredient;
                      const stockStatus =
                        ingredient.quantity < ingredient.threshold
                          ? ingredient.quantity <= 0
                            ? 'text-red-600'
                            : 'text-orange-600'
                          : 'text-green-600';

                      return (
                        <div
                          key={foodIngredient.id}
                          className="flex items-center justify-between text-xs bg-white p-2 rounded border border-gray-200"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {ingredient.name}
                            </p>
                            <p className="text-gray-500">
                              Required: {Number(foodIngredient.qtyRequired).toFixed(2)} {ingredient.unit}
                            </p>
                          </div>
                          <div className="text-right ml-2">
                            <p className={`font-semibold ${stockStatus}`}>
                              {Number(ingredient.quantity).toFixed(2)} {ingredient.unit}
                            </p>
                            <p className="text-gray-400 text-xs">
                              Threshold: {Number(ingredient.threshold).toFixed(2)} {ingredient.unit}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

