import { redirect } from 'next/navigation';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { getFoodItems } from '@/app/actions/food-actions';
import { FoodTable } from '@/components/admin/food-table';
import { AdminHeader } from '@/components/admin/admin-header';
import { FoodAIInsights } from '@/components/admin/food-ai-insights';

export default async function FoodPage() {
  const session = await auth();
  if (!session) {
    redirect('/admin');
  }

  const foodItems = await getFoodItems();

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader
        title="Food Management"
        description="View all foods and their ingredients"
        currentPage="food"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FoodAIInsights foodItems={foodItems} />
        <FoodTable foodItems={foodItems} />
      </main>
    </div>
  );
}

