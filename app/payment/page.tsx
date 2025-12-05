'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCartStore } from '@/lib/store/cart-store';
import { createOrder } from '@/app/actions/order-actions';
import toast from 'react-hot-toast';
import { ArrowLeft, CheckCircle } from 'lucide-react';

export default function PaymentPage() {
  const { items, getTotal, clearCart } = useCartStore();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await createOrder(items);
      if (result.success) {
        clearCart();
        toast.success('Order placed successfully!');
        router.push(`/order/success?orderId=${result.orderId}`);
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to process order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.push('/cart')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Cart</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Payment</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-3 mb-6">
              {items.map((item) => (
                <div key={item.foodItemId} className="flex justify-between text-gray-700">
                  <span>
                    {item.quantity}x {item.name}
                  </span>
                  <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-2xl font-bold">
                <span>Total:</span>
                <span className="text-orange-600">₹{getTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Scan to Pay</h2>
            <div className="bg-gray-100 rounded-xl p-8 flex items-center justify-center mb-6">
              <div className="w-64 h-64 bg-white rounded-lg flex items-center justify-center border-2 border-gray-300 p-4">
                <Image
                  src="/payment-qr.jpg"
                  alt="Payment QR Code"
                  width={256}
                  height={256}
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            <button
              onClick={handlePayment}
              disabled={isProcessing || items.length === 0}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Done
                </>
              )}
            </button>
            <p className="text-xs text-gray-500 text-center mt-4">
              Click &quot;Done&quot; after completing payment
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

