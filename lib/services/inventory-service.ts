/**
 * Inventory Service
 * Handles inventory business logic, calculations, and data access
 * Optimized for performance with caching and batch operations
 */

import { prisma } from '@/lib/prisma';
import { logger } from './logger';
import { cacheService, CacheKeys } from './cache-service';
import { Prisma, type AlertType, type AlertSeverity } from '@prisma/client';

export class InventoryService {
  /**
   * Get all ingredients (cached)
   */
  async getIngredients(): Promise<Array<{
    id: string;
    name: string;
    quantity: number;
    expiryDate: Date | null;
    threshold: number;
    unit: string;
    createdAt: Date;
    updatedAt: Date;
  }>> {
    const startTime = Date.now();
    const cacheKey = CacheKeys.ingredients();

    try {
      // Try cache first
      const cached = await cacheService.get<Awaited<ReturnType<typeof this.getIngredients>>>(cacheKey);
      if (cached) {
        logger.debug('Ingredients served from cache');
        return cached;
      }

      const ingredients = await prisma.ingredient.findMany({
        select: {
          id: true,
          name: true,
          quantity: true,
          expiryDate: true,
          threshold: true,
          unit: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          name: 'asc',
        },
      });

      // Cache for 5 minutes
      await cacheService.set(cacheKey, ingredients, 300);

      const duration = Date.now() - startTime;
      logger.requestTiming('getIngredients', duration, { count: ingredients.length });

      return ingredients;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Failed to fetch ingredients', {
        error: error instanceof Error ? error.message : String(error),
        durationMs: duration,
      });
      throw error;
    }
  }

  /**
   * Get ingredient by ID (cached)
   */
  async getIngredientById(id: string): Promise<{
    id: string;
    name: string;
    quantity: number;
    expiryDate: Date | null;
    threshold: number;
    unit: string;
    createdAt: Date;
    updatedAt: Date;
  } | null> {
    const cacheKey = CacheKeys.ingredient(id);

    try {
      const cached = await cacheService.get<Awaited<ReturnType<typeof this.getIngredientById>>>(cacheKey);
      if (cached) {
        return cached;
      }

      const ingredient = await prisma.ingredient.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          quantity: true,
          expiryDate: true,
          threshold: true,
          unit: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (ingredient) {
        await cacheService.set(cacheKey, ingredient, 300);
      }

      return ingredient;
    } catch (error) {
      logger.error('Failed to fetch ingredient', {
        error: error instanceof Error ? error.message : String(error),
        ingredientId: id,
      });
      throw error;
    }
  }

  /**
   * Get AI alerts (optimized query with select)
   */
  async getAIAlerts(isRead: boolean = false): Promise<Array<{
    id: string;
    type: AlertType;
    severity: AlertSeverity;
    title: string;
    message: string;
    ingredientId: string | null;
    isRead: boolean;
    metadata: Prisma.JsonValue;
    createdAt: Date;
    ingredient: {
      id: string;
      name: string;
      quantity: number;
      threshold: number;
      unit: string;
      expiryDate: Date | null;
      createdAt: Date;
      updatedAt: Date;
    } | null;
  }>> {
    const startTime = Date.now();
    const cacheKey = CacheKeys.aiAlerts(isRead);

    try {
      // Try cache first (shorter TTL for alerts - 1 minute)
      const cached = await cacheService.get<Awaited<ReturnType<typeof this.getAIAlerts>>>(cacheKey);
      if (cached) {
        logger.debug('AI alerts served from cache', { isRead });
        return cached;
      }

      const alerts = await prisma.aIAlert.findMany({
        where: {
          isRead,
        },
        select: {
          id: true,
          type: true,
          severity: true,
          title: true,
          message: true,
          ingredientId: true,
          isRead: true,
          metadata: true,
          createdAt: true,
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
        orderBy: {
          createdAt: 'desc',
        },
        take: 50,
      });

      // Cache for 1 minute (alerts change frequently)
      await cacheService.set(cacheKey, alerts, 60);

      const duration = Date.now() - startTime;
      logger.requestTiming('getAIAlerts', duration, { isRead, count: alerts.length });

      return alerts;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Failed to fetch AI alerts', {
        error: error instanceof Error ? error.message : String(error),
        durationMs: duration,
        isRead,
      });
      throw error;
    }
  }

  /**
   * Mark alert as read
   */
  async markAlertAsRead(alertId: string) {
    const startTime = Date.now();

    try {
      await prisma.aIAlert.update({
        where: { id: alertId },
        data: { isRead: true },
      });

      // Invalidate alerts cache
      await cacheService.del(CacheKeys.aiAlerts(false));
      await cacheService.del(CacheKeys.aiAlerts(true));

      const duration = Date.now() - startTime;
      logger.requestTiming('markAlertAsRead', duration, { alertId });

      return { success: true };
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Failed to mark alert as read', {
        error: error instanceof Error ? error.message : String(error),
        durationMs: duration,
        alertId,
      });
      throw error;
    }
  }

  /**
   * Get inventory dashboard data (precomputed aggregates)
   * Optimized to avoid recalculating on every request
   */
  async getInventoryDashboard(): Promise<{
    ingredients: Array<{
      id: string;
      name: string;
      quantity: number;
      threshold: number;
      expiryDate: Date | null;
      unit: string;
    }>;
    stats: {
      total: number;
      lowStock: number;
      nearExpiry: number;
      totalQuantity: number | null;
    };
  }> {
    const startTime = Date.now();
    const cacheKey = CacheKeys.inventoryDashboard();

    try {
      // Try cache first
      const cached = await cacheService.get<Awaited<ReturnType<typeof this.getInventoryDashboard>>>(cacheKey);
      if (cached) {
        logger.debug('Inventory dashboard served from cache');
        return cached;
      }

      // Use single query with aggregation instead of multiple queries
      const [ingredients, totalQuantity] = await Promise.all([
        prisma.ingredient.findMany({
          select: {
            id: true,
            name: true,
            quantity: true,
            threshold: true,
            expiryDate: true,
            unit: true,
          },
          orderBy: {
            name: 'asc',
          },
        }),
        prisma.ingredient.aggregate({
          _sum: {
            quantity: true,
          },
        }),
      ]);

      // Calculate stats from fetched ingredients (more efficient than separate queries)
      const lowStockCount = ingredients.filter((ing) => ing.quantity < ing.threshold).length;
      const nearExpiryCount = ingredients.filter((ing) => {
        if (!ing.expiryDate) return false;
        const daysUntilExpiry = (ing.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
        return daysUntilExpiry <= 7 && daysUntilExpiry >= 0;
      }).length;

      const result = {
        ingredients,
        stats: {
          total: ingredients.length,
          lowStock: lowStockCount,
          nearExpiry: nearExpiryCount,
          totalQuantity: totalQuantity._sum.quantity || 0,
        },
      };

      // Cache for 2 minutes
      await cacheService.set(cacheKey, result, 120);

      const duration = Date.now() - startTime;
      logger.requestTiming('getInventoryDashboard', duration, {
        ingredientCount: ingredients.length,
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Failed to fetch inventory dashboard', {
        error: error instanceof Error ? error.message : String(error),
        durationMs: duration,
      });
      throw error;
    }
  }

  /**
   * Update ingredient quantity
   * Invalidates relevant caches
   */
  async updateIngredientQuantity(ingredientId: string, quantity: number) {
    const startTime = Date.now();

    try {
      const ingredient = await prisma.ingredient.update({
        where: { id: ingredientId },
        data: { quantity },
        select: {
          id: true,
          name: true,
          quantity: true,
          threshold: true,
        },
      });

      // Invalidate caches
      await cacheService.del(CacheKeys.ingredient(ingredientId));
      await cacheService.del(CacheKeys.ingredients());
      await cacheService.del(CacheKeys.inventoryDashboard());

      const duration = Date.now() - startTime;
      logger.requestTiming('updateIngredientQuantity', duration, {
        ingredientId,
        newQuantity: quantity,
      });

      return ingredient;
    } catch (error) {
      logger.error('Failed to update ingredient quantity', {
        error: error instanceof Error ? error.message : String(error),
        ingredientId,
        quantity,
      });
      throw error;
    }
  }

  /**
   * Batch update ingredients (optimized for multiple updates)
   */
  async batchUpdateIngredients(
    updates: Array<{ id: string; quantity: number }>
  ) {
    const startTime = Date.now();

    try {
      // Use transaction for atomicity
      const result = await prisma.$transaction(
        async (tx) => {
          const updatePromises = updates.map((update) =>
            tx.ingredient.update({
              where: { id: update.id },
              data: { quantity: update.quantity },
              select: {
                id: true,
                name: true,
                quantity: true,
              },
            })
          );

          return Promise.all(updatePromises);
        },
        {
          timeout: 5000,
        }
      );

      // Invalidate all ingredient-related caches
      await cacheService.del(CacheKeys.ingredients());
      await cacheService.del(CacheKeys.inventoryDashboard());
      for (const update of updates) {
        await cacheService.del(CacheKeys.ingredient(update.id));
      }

      const duration = Date.now() - startTime;
      logger.requestTiming('batchUpdateIngredients', duration, {
        count: updates.length,
      });

      return result;
    } catch (error) {
      logger.error('Failed to batch update ingredients', {
        error: error instanceof Error ? error.message : String(error),
        updateCount: updates.length,
      });
      throw error;
    }
  }

  /**
   * Get ingredients near expiry (indexed query)
   */
  async getIngredientsNearExpiry(days: number = 7) {
    const startTime = Date.now();
    const cutoffDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    try {
      const ingredients = await prisma.ingredient.findMany({
        where: {
          expiryDate: {
            lte: cutoffDate,
            gte: new Date(),
          },
        },
        select: {
          id: true,
          name: true,
          quantity: true,
          expiryDate: true,
          threshold: true,
          unit: true,
        },
        orderBy: {
          expiryDate: 'asc',
        },
      });

      const duration = Date.now() - startTime;
      logger.requestTiming('getIngredientsNearExpiry', duration, {
        days,
        count: ingredients.length,
      });

      return ingredients;
    } catch (error) {
      logger.error('Failed to fetch ingredients near expiry', {
        error: error instanceof Error ? error.message : String(error),
        days,
      });
      throw error;
    }
  }
}

export const inventoryService = new InventoryService();

