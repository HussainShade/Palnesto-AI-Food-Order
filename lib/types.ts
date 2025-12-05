import { FoodItem, Ingredient, Order, AIAlert } from '@prisma/client';

export type FoodItemWithIngredients = FoodItem & {
  ingredients: Array<{
    id: string;
    qtyRequired: number;
    ingredient: Ingredient;
  }>;
};

export type CartItem = {
  foodItemId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

export type OrderWithItems = Order & {
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    foodItem: FoodItem;
  }>;
};

export type AISuggestion = {
  foodId: string;
  name: string;
  reason: string;
  image: string;
  price: number;
};

export type InventoryAlert = AIAlert & {
  ingredient?: Ingredient | null;
};

