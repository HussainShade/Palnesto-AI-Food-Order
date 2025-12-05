'use server';

import { analyzeFoodInsights, analyzeInventoryInsights, analyzeOrderInsights } from '@/lib/ai/admin-ai-service';
import { requireAdmin } from '@/lib/auth';

export async function getFoodInsights(foodItems: unknown[]) {
  await requireAdmin();
  try {
    return await analyzeFoodInsights(foodItems);
  } catch (error) {
    console.error('Error getting food insights:', error);
    return null;
  }
}

export async function getInventoryInsights(ingredients: unknown[]) {
  await requireAdmin();
  try {
    return await analyzeInventoryInsights(ingredients);
  } catch (error) {
    console.error('Error getting inventory insights:', error);
    return null;
  }
}

export async function getOrderInsights(orders: unknown[]) {
  await requireAdmin();
  try {
    return await analyzeOrderInsights(orders);
  } catch (error) {
    console.error('Error getting order insights:', error);
    return null;
  }
}

