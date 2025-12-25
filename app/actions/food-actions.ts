'use server';

import { foodService } from '@/lib/services/food-service';
import { logger } from '@/lib/services/logger';
import type { FoodItemWithIngredients } from '@/lib/types';

/**
 * Get all food items (server action)
 * Delegates to FoodService for business logic and caching
 */
export async function getFoodItems(): Promise<FoodItemWithIngredients[]> {
  try {
    return await foodService.getFoodItems();
  } catch (error) {
    logger.error('Failed to fetch food items in action', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw new Error('Failed to fetch food items');
  }
}

/**
 * Get food item by ID (server action)
 * Delegates to FoodService for business logic and caching
 */
export async function getFoodItemById(id: string): Promise<FoodItemWithIngredients | null> {
  try {
    return await foodService.getFoodItemById(id);
  } catch (error) {
    logger.error('Failed to fetch food item in action', {
      error: error instanceof Error ? error.message : String(error),
      foodItemId: id,
    });
    return null;
  }
}

