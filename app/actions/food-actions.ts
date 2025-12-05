'use server';

import { prisma } from '@/lib/prisma';
import type { FoodItemWithIngredients } from '@/lib/types';

export async function getFoodItems(): Promise<FoodItemWithIngredients[]> {
  try {
    const items = await prisma.foodItem.findMany({
      include: {
        ingredients: {
          include: {
            ingredient: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return items.map((item) => ({
      ...item,
      ingredients: item.ingredients.map((fi) => ({
        id: fi.id,
        qtyRequired: fi.qtyRequired,
        ingredient: fi.ingredient,
      })),
    }));
  } catch (error) {
    console.error('Error fetching food items:', error);
    throw new Error('Failed to fetch food items');
  }
}

export async function getFoodItemById(id: string): Promise<FoodItemWithIngredients | null> {
  try {
    const item = await prisma.foodItem.findUnique({
      where: { id },
      include: {
        ingredients: {
          include: {
            ingredient: true,
          },
        },
      },
    });

    if (!item) return null;

    return {
      ...item,
      ingredients: item.ingredients.map((fi) => ({
        id: fi.id,
        qtyRequired: fi.qtyRequired,
        ingredient: fi.ingredient,
      })),
    };
  } catch (error) {
    console.error('Error fetching food item:', error);
    return null;
  }
}

