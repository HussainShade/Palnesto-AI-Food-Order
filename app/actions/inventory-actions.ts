'use server';

import { prisma } from '@/lib/prisma';
import { analyzeInventoryIntelligence } from '@/lib/ai/ai-service';
import { requireAdmin } from '@/lib/auth';
import { inventoryService } from '@/lib/services/inventory-service';
import { logger } from '@/lib/services/logger';
import { cacheService, CacheKeys } from '@/lib/services/cache-service';
import type { AlertType, AlertSeverity } from '@prisma/client';

type InventoryAlert = {
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  ingredientName?: string | null;
};

/**
 * Get all ingredients (server action)
 * Delegates to InventoryService for business logic and caching
 */
export async function getIngredients() {
  await requireAdmin();

  try {
    return await inventoryService.getIngredients();
  } catch (error) {
    logger.error('Failed to fetch ingredients in action', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw new Error('Failed to fetch ingredients');
  }
}

/**
 * Get AI alerts (server action)
 * Delegates to InventoryService for business logic and caching
 */
export async function getAIAlerts() {
  await requireAdmin();

  try {
    return await inventoryService.getAIAlerts(false);
  } catch (error) {
    logger.error('Failed to fetch AI alerts in action', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw new Error('Failed to fetch alerts');
  }
}

/**
 * Mark alert as read (server action)
 * Delegates to InventoryService for business logic
 */
export async function markAlertAsRead(alertId: string) {
  await requireAdmin();

  try {
    return await inventoryService.markAlertAsRead(alertId);
  } catch (error) {
    logger.error('Failed to mark alert as read in action', {
      error: error instanceof Error ? error.message : String(error),
      alertId,
    });
    throw new Error('Failed to update alert');
  }
}

/**
 * Trigger inventory analysis (server action)
 * Optimized to batch create alerts instead of N+1 queries
 */
export async function triggerInventoryAnalysis() {
  await requireAdmin();

  const startTime = Date.now();

  try {
    const alerts = await analyzeInventoryIntelligence() as InventoryAlert[];

    if (alerts.length === 0) {
      return { success: true, alertsCreated: 0 };
    }

    // Batch fetch all ingredients by name (single query instead of N+1)
    const ingredientNames = alerts
      .map((alert: InventoryAlert) => alert.ingredientName)
      .filter((name): name is string => Boolean(name));

    const ingredients = await prisma.ingredient.findMany({
      where: {
        name: {
          in: ingredientNames,
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    // Create lookup map
    const ingredientMap = new Map(ingredients.map((ing) => [ing.name, ing.id]));

    // Batch create all alerts
    const alertsToCreate = alerts.map((alert: InventoryAlert) => ({
      type: alert.type,
      severity: alert.severity,
      title: alert.title,
      message: alert.message,
      ingredientId: alert.ingredientName ? ingredientMap.get(alert.ingredientName) : null,
    }));

    await prisma.aIAlert.createMany({
      data: alertsToCreate,
      skipDuplicates: true,
    });

    // Invalidate alerts cache
    await cacheService.del(CacheKeys.aiAlerts(false));
    await cacheService.del(CacheKeys.aiAlerts(true));

    const duration = Date.now() - startTime;
    logger.requestTiming('triggerInventoryAnalysis', duration, {
      alertsCreated: alerts.length,
    });

    return { success: true, alertsCreated: alerts.length };
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Failed to analyze inventory in action', {
      error: error instanceof Error ? error.message : String(error),
      durationMs: duration,
    });
    throw new Error('Failed to analyze inventory');
  }
}

