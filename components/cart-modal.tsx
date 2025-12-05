'use client';

import { useCartStore } from '@/lib/store/cart-store';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';

export function CartModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { items, updateQuantity, getTotal } = useCartStore();
  const router = useRouter();

  if (!isOpen) return null;

  const handleGoToCart = () => {
    onClose();
    router.push('/cart');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-4 pointer-events-none">
      <div className="absolute inset-0 bg-black/20 pointer-events-auto" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col pointer-events-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">Cart</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.foodItemId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-gray-600">₹{item.price.toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.foodItemId, item.quantity - 1)}
                      className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold transition-colors cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.foodItemId, item.quantity + 1)}
                      className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold transition-colors cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t p-4 space-y-3">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Subtotal:</span>
              <span>₹{getTotal().toFixed(2)}</span>
            </div>
            <button
              onClick={handleGoToCart}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors cursor-pointer"
            >
              Go to Cart
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

