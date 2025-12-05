'use client';

import { AIInsights } from './ai-insights';
import { getOrderInsights } from '@/app/actions/admin-ai-actions';
import type { Order, OrderItem, FoodItem } from '@prisma/client';

interface OrdersAIInsightsProps {
  orders: Array<
    Order & {
      items: Array<
        OrderItem & {
          foodItem: FoodItem;
        }
      >;
    }
  >;
}

export function OrdersAIInsights({ orders }: OrdersAIInsightsProps) {
  const getInsight = async () => {
    // Prepare simplified data for AI
    const simplifiedData = orders.map((order) => ({
      total: order.total,
      itemCount: order.items.length,
      items: order.items.map((item) => ({
        name: item.foodItem.name,
        quantity: item.quantity,
        price: item.price,
      })),
      date: order.createdAt,
    }));

    return await getOrderInsights(simplifiedData);
  };

  return <AIInsights getInsight={getInsight} />;
}

