'use server';

import { prisma } from '@/lib/prisma';
import { postOrderScreening } from '@/lib/ai/ai-service';
import type { CartItem } from '@/lib/types';

export async function createOrder(items: CartItem[]): Promise<{ orderId: string; success: boolean }> {
  try {
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Fetch all food items with ingredients BEFORE transaction
    const foodItemIds = items.map((item) => item.foodItemId);
    const foodItems = await prisma.foodItem.findMany({
      where: { id: { in: foodItemIds } },
      include: {
        ingredients: {
          include: {
            ingredient: true,
          },
        },
      },
    });

    // Create a map for quick lookup
    const foodItemMap = new Map(foodItems.map((item) => [item.id, item]));

    // Calculate ingredient deductions
    const ingredientDeductions = new Map<string, number>();
    const alertsToCreate: Array<{
      ingredientId: string;
      type: 'LOW_STOCK';
      severity: 'CRITICAL' | 'HIGH';
      title: string;
      message: string;
    }> = [];

    for (const cartItem of items) {
      const foodItem = foodItemMap.get(cartItem.foodItemId);
      if (!foodItem) continue;

      for (const foodIngredient of foodItem.ingredients) {
        const totalRequired = foodIngredient.qtyRequired * cartItem.quantity;
        const currentDeduction = ingredientDeductions.get(foodIngredient.ingredientId) || 0;
        ingredientDeductions.set(
          foodIngredient.ingredientId,
          currentDeduction + totalRequired
        );
      }
    }

    // Transaction to create order and deduct ingredients
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          total,
          status: 'COMPLETED',
          items: {
            create: items.map((item) => ({
              foodItemId: item.foodItemId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      });

      // Deduct ingredients in batch
      for (const [ingredientId, deduction] of ingredientDeductions.entries()) {
        const updatedIngredient = await tx.ingredient.update({
          where: { id: ingredientId },
          data: {
            quantity: {
              decrement: deduction,
            },
          },
        });

        // Check for low stock and prepare alert
        if (updatedIngredient.quantity < updatedIngredient.threshold) {
          alertsToCreate.push({
            ingredientId: updatedIngredient.id,
            type: 'LOW_STOCK',
            severity: updatedIngredient.quantity <= 0 ? 'CRITICAL' : 'HIGH',
            title: `Low Stock: ${updatedIngredient.name}`,
            message: `${updatedIngredient.name} is below threshold (${updatedIngredient.quantity}${updatedIngredient.unit} remaining, threshold: ${updatedIngredient.threshold}${updatedIngredient.unit})`,
          });
        }
      }

      // Create alerts in batch
      if (alertsToCreate.length > 0) {
        await tx.aIAlert.createMany({
          data: alertsToCreate,
        });
      }

      return newOrder;
    }, {
      timeout: 10000, // 10 second timeout
    });

    // Trigger AI post-order screening
    await postOrderScreening(order.id).catch((error) => {
      console.error('AI screening error (non-blocking):', error);
    });

    return { orderId: order.id, success: true };
  } catch (error) {
    console.error('Error creating order:', error);
    throw new Error('Failed to create order');
  }
}

export async function getOrders(page: number = 1, pageSize: number = 10) {
  try {
    const skip = (page - 1) * pageSize;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        skip,
        take: pageSize,
        include: {
          items: {
            include: {
              foodItem: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.order.count(),
    ]);

    return {
      orders,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw new Error('Failed to fetch orders');
  }
}

