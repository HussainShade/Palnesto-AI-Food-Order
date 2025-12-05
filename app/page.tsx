import { getFoodItems } from '@/app/actions/food-actions';
import { FoodCard } from '@/components/food-card';
import { CartButton } from '@/components/cart-button';

export default async function Home() {
  const foodItems = await getFoodItems();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-3xl font-bold text-gray-900">🍔 Palnesto - Food Order System</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Our Menu</h2>
          <p className="text-gray-600">Select your favorite items and add them to your cart</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {foodItems.map((item) => (
            <FoodCard key={item.id} foodItem={item} />
          ))}
        </div>

        {foodItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No items available. Please seed the database.</p>
          </div>
        )}
      </main>

      <CartButton />
    </div>
  );
}
