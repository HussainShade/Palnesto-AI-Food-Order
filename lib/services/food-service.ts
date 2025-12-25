/**
 * Food Service
 * Handles food item business logic and data access
 * Optimized with caching and selective field queries
 */

import { prisma } from '@/lib/prisma';
import { logger } from './logger';
import { cacheService, CacheKeys } from './cache-service';
import type { FoodItemWithIngredients } from '@/lib/types';

export class FoodService {
  /**
   * Get all food items with ingredients (cached)
   * Uses select instead of include for better performance
   */
  async getFoodItems(): Promise<FoodItemWithIngredients[]> {
    const startTime = Date.now();
    const cacheKey = CacheKeys.foodItems();

    try {
      // Try cache first
      const cached = await cacheService.get<FoodItemWithIngredients[]>(cacheKey);
      if (cached) {
        logger.debug('Food items served from cache');
        return cached;
      }

      const items = await prisma.foodItem.findMany({
        select: {
          id: true,
          name: true,
          price: true,
          description: true,
          image: true,
          createdAt: true,
          updatedAt: true,
          ingredients: {
            select: {
              id: true,
              qtyRequired: true,
              ingredient: {
                select: {
                  id: true,
                  name: true,
                  quantity: true,
                  threshold: true,
                  unit: true,
                  expiryDate: true,
                  createdAt: true,
                  updatedAt: true,
                },
              },
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });

      // Transform to match FoodItemWithIngredients type
      const result: FoodItemWithIngredients[] = items.map((item) => ({
        ...item,
        ingredients: item.ingredients.map((fi) => ({
          id: fi.id,
          qtyRequired: fi.qtyRequired,
          ingredient: fi.ingredient,
        })),
      }));

      // Cache for 10 minutes (menu items change infrequently)
      await cacheService.set(cacheKey, result, 600);

      const duration = Date.now() - startTime;
      logger.requestTiming('getFoodItems', duration, { count: result.length });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Failed to fetch food items', {
        error: error instanceof Error ? error.message : String(error),
        durationMs: duration,
      });
      throw error;
    }
  }

  /**
   * Get food item by ID with ingredients (cached)
   */
  async getFoodItemById(id: string): Promise<FoodItemWithIngredients | null> {
    const startTime = Date.now();
    const cacheKey = CacheKeys.foodItem(id);

    try {
      // Try cache first
      const cached = await cacheService.get<FoodItemWithIngredients>(cacheKey);
      if (cached) {
        logger.debug('Food item served from cache', { foodItemId: id });
        return cached;
      }

      const item = await prisma.foodItem.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          price: true,
          description: true,
          image: true,
          createdAt: true,
          updatedAt: true,
          ingredients: {
            select: {
              id: true,
              qtyRequired: true,
              ingredient: {
                select: {
                  id: true,
                  name: true,
                  quantity: true,
                  threshold: true,
                  unit: true,
                  expiryDate: true,
                  createdAt: true,
                  updatedAt: true,
                },
              },
            },
          },
        },
      });

      if (!item) {
        return null;
      }

      // Transform to match FoodItemWithIngredients type
      const result: FoodItemWithIngredients = {
        ...item,
        ingredients: item.ingredients.map((fi) => ({
          id: fi.id,
          qtyRequired: fi.qtyRequired,
          ingredient: fi.ingredient,
        })),
      };

      // Cache for 10 minutes
      await cacheService.set(cacheKey, result, 600);

      const duration = Date.now() - startTime;
      logger.requestTiming('getFoodItemById', duration, { foodItemId: id });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Failed to fetch food item', {
        error: error instanceof Error ? error.message : String(error),
        durationMs: duration,
        foodItemId: id,
      });
      return null;
    }
  }

  /**
   * Get food items by IDs (batch query, optimized)
   * Used in order creation to fetch multiple items at once
   */
  async getFoodItemsByIds(ids: string[]) {
    const startTime = Date.now();

    try {
      // Check cache first for each ID
      const cachePromises = ids.map((id) => cacheService.get<FoodItemWithIngredients>(CacheKeys.foodItem(id)));
      const cachedItems = await Promise.all(cachePromises);

      // Find which items are missing from cache
      const missingIds: string[] = [];
      const resultMap = new Map<string, FoodItemWithIngredients>();

      cachedItems.forEach((cached, index) => {
        if (cached) {
          resultMap.set(ids[index], cached);
        } else {
          missingIds.push(ids[index]);
        }
      });

      // Fetch missing items from database
      if (missingIds.length > 0) {
        const items = await prisma.foodItem.findMany({
          where: { id: { in: missingIds } },
          select: {
            id: true,
            name: true,
            price: true,
            description: true,
            image: true,
            createdAt: true,
            updatedAt: true,
            ingredients: {
              select: {
                id: true,
                qtyRequired: true,
                ingredient: {
                  select: {
                    id: true,
                    name: true,
                    quantity: true,
                    threshold: true,
                    unit: true,
                    expiryDate: true,
                    createdAt: true,
                    updatedAt: true,
                  },
                },
              },
            },
          },
        });

        // Transform and cache
        for (const item of items) {
          const transformed: FoodItemWithIngredients = {
            ...item,
            ingredients: item.ingredients.map((fi) => ({
              id: fi.id,
              qtyRequired: fi.qtyRequired,
              ingredient: fi.ingredient,
            })),
          };
          resultMap.set(item.id, transformed);
          await cacheService.set(CacheKeys.foodItem(item.id), transformed, 600);
        }
      }

      const duration = Date.now() - startTime;
      logger.requestTiming('getFoodItemsByIds', duration, {
        requested: ids.length,
        cached: cachedItems.filter(Boolean).length,
        fetched: missingIds.length,
      });

      return Array.from(resultMap.values());
    } catch (error) {
      logger.error('Failed to fetch food items by IDs', {
        error: error instanceof Error ? error.message : String(error),
        ids,
      });
      throw error;
    }
  }

  /**
   * Invalidate food item cache
   * Call this when food items are updated
   */
  async invalidateFoodCache(foodItemId?: string) {
    if (foodItemId) {
      await cacheService.del(CacheKeys.foodItem(foodItemId));
    }
    await cacheService.del(CacheKeys.foodItems());
  }
}

export const foodService = new FoodService();

