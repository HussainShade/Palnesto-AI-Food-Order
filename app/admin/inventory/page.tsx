import { redirect } from 'next/navigation';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { getIngredients, getAIAlerts } from '@/app/actions/inventory-actions';
import { InventoryTable } from '@/components/admin/inventory-table';
import { AlertPanel } from '@/components/admin/alert-panel';
import { AdminHeader } from '@/components/admin/admin-header';
import { InventoryAIInsights } from '@/components/admin/inventory-ai-insights';

export default async function InventoryPage() {
  const session = await auth();
  if (!session) {
    redirect('/admin');
  }

  const [ingredients, alerts] = await Promise.all([getIngredients(), getAIAlerts()]);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader
        title="Inventory Management"
        description="Monitor ingredients and AI alerts"
        currentPage="inventory"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <InventoryAIInsights ingredients={ingredients} />
        <AlertPanel alerts={alerts} />
        <InventoryTable ingredients={ingredients} />
      </main>
    </div>
  );
}

