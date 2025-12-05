'use client';

import { useState } from 'react';
import { useCartStore } from '@/lib/store/cart-store';
import { CartModal } from './cart-modal';
import { ShoppingCart } from 'lucide-react';

export function CartButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { getItemCount, getTotal } = useCartStore();
  const itemCount = getItemCount();

  if (itemCount === 0) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-orange-500 hover:bg-orange-600 text-white rounded-full p-4 shadow-2xl z-50 flex items-center gap-3 transition-all hover:scale-105 cursor-pointer"
      >
        <ShoppingCart className="w-6 h-6" />
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium">{itemCount} items</span>
          <span className="text-xs opacity-90">₹{getTotal().toFixed(2)}</span>
        </div>
      </button>
      <CartModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

