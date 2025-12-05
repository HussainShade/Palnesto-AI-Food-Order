'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed!</h1>
          <p className="text-gray-600">Thank you for your order</p>
          {orderId && (
            <p className="text-sm text-gray-500 mt-2">Order ID: {orderId.slice(0, 8)}</p>
          )}
        </div>

        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <p className="text-gray-700">
            Your order has been successfully placed and is being prepared. You will receive a
            notification when it&apos;s ready.
          </p>
        </div>

        <button
          onClick={() => router.push('/')}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 px-6 rounded-xl transition-colors cursor-pointer"
        >
          Order Again
        </button>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}

