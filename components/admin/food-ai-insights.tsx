'use client';

import { AIInsights } from './ai-insights';
import { getFoodInsights } from '@/app/actions/admin-ai-actions';
import type { FoodItemWithIngredients } from '@/lib/types';

interface FoodAIInsightsProps {
  foodItems: FoodItemWithIngredients[];
}

export function FoodAIInsights({ foodItems }: FoodAIInsightsProps) {
  const getInsight = async () => {
    // Prepare simplified data for AI
    const simplifiedData = foodItems.map((item) => ({
      name: item.name,
      price: item.price,
      description: item.description,
      ingredientCount: item.ingredients.length,
    }));

    return await getFoodInsights(simplifiedData);
  };

  return <AIInsights getInsight={getInsight} />;
}

