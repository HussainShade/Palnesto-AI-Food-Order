import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '@/lib/types';

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (foodItemId: string) => void;
  updateQuantity: (foodItemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const existingItem = get().items.find((i) => i.foodItemId === item.foodItemId);
        if (existingItem) {
          set({
            items: get().items.map((i) =>
              i.foodItemId === item.foodItemId
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          });
        } else {
          set({ items: [...get().items, { ...item, quantity: 1 }] });
        }
      },
      removeItem: (foodItemId) => {
        set({ items: get().items.filter((i) => i.foodItemId !== foodItemId) });
      },
      updateQuantity: (foodItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(foodItemId);
        } else {
          set({
            items: get().items.map((i) =>
              i.foodItemId === foodItemId ? { ...i, quantity } : i
            ),
          });
        }
      },
      clearCart: () => set({ items: [] }),
      getTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);

