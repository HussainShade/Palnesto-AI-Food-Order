'use client';

import { AIInsights } from './ai-insights';
import { getInventoryInsights } from '@/app/actions/admin-ai-actions';
import type { Ingredient } from '@prisma/client';

interface InventoryAIInsightsProps {
  ingredients: Ingredient[];
}

export function InventoryAIInsights({ ingredients }: InventoryAIInsightsProps) {
  const getInsight = async () => {
    // Prepare simplified data for AI
    const simplifiedData = ingredients.map((ing) => ({
      name: ing.name,
      quantity: ing.quantity,
      threshold: ing.threshold,
      unit: ing.unit,
      expiryDate: ing.expiryDate,
      stockStatus: ing.quantity < ing.threshold ? 'low' : 'ok',
    }));

    return await getInventoryInsights(simplifiedData);
  };

  return <AIInsights getInsight={getInsight} />;
}

