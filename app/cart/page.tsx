'use client';

import { useCartStore } from '@/lib/store/cart-store';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { CartUpsellSuggestions } from '@/components/cart-upsell-suggestions';

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotal, clearCart } = useCartStore();
  const router = useRouter();

  const handleCancel = () => {
    clearCart();
    router.push('/');
  };

  const handleProceed = () => {
    router.push('/payment');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <button
            onClick={() => router.push('/')}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors cursor-pointer"
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Menu</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Your Cart</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
          {items.map((item) => (
            <div
              key={item.foodItemId}
              className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow"
            >
              <div className="relative w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1">{item.name}</h3>
                <p className="text-gray-600">₹{item.price.toFixed(2)} each</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateQuantity(item.foodItemId, item.quantity - 1)}
                  className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold transition-colors cursor-pointer"
                >
                  -
                </button>
                <span className="w-12 text-center font-bold text-lg">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.foodItemId, item.quantity + 1)}
                  className="w-10 h-10 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center font-bold transition-colors cursor-pointer"
                >
                  +
                </button>
                <button
                  onClick={() => removeItem(item.foodItemId)}
                  className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">₹{(item.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        <CartUpsellSuggestions />

        <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center text-2xl font-bold mb-6">
            <span>Total:</span>
            <span className="text-orange-600">₹{getTotal().toFixed(2)}</span>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleCancel}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-4 px-6 rounded-xl transition-colors cursor-pointer"
            >
              Cancel Order
            </button>
            <button
              onClick={handleProceed}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 px-6 rounded-xl transition-colors cursor-pointer"
            >
              Proceed to Payment
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

