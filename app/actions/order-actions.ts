'use server';

import { postOrderScreening } from '@/lib/ai/ai-service';
import { logger } from '@/lib/services/logger';
import { orderService } from '@/lib/services/order-service';
import type { CartItem } from '@/lib/types';

/**
 * Create order (server action)
 * Delegates to OrderService for business logic
 */
export async function createOrder(items: CartItem[]): Promise<{ orderId: string; success: boolean }> {
  try {
    // Delegate to service layer
    const result = await orderService.createOrder(items);

    // Trigger AI post-order screening (non-blocking, outside transaction)
    postOrderScreening(result.orderId).catch((error) => {
      logger.error('AI screening error (non-blocking)', {
        error: error instanceof Error ? error.message : String(error),
        orderId: result.orderId,
      });
    });

    return result;
  } catch (error) {
    logger.error('Order creation failed in action', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Get orders with pagination (server action)
 * Delegates to OrderService for business logic
 */
export async function getOrders(page: number = 1, pageSize: number = 10) {
  try {
    return await orderService.getOrders(page, pageSize);
  } catch (error) {
    logger.error('Failed to fetch orders in action', {
      error: error instanceof Error ? error.message : String(error),
      page,
      pageSize,
    });
    throw error;
  }
}

