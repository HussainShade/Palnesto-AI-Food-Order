import { redirect } from 'next/navigation';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { getOrders } from '@/app/actions/order-actions';
import { OrdersTable } from '@/components/admin/orders-table';
import { AdminHeader } from '@/components/admin/admin-header';
import { OrdersAIInsights } from '@/components/admin/orders-ai-insights';

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }> | { page?: string };
}) {
  const session = await auth();
  if (!session) {
    redirect('/admin');
  }

  // Handle searchParams as either Promise or object (Next.js compatibility)
  const params = searchParams instanceof Promise ? await searchParams : searchParams;
  const page = parseInt(params.page || '1', 10);
  const { orders, pagination } = await getOrders(page, 10);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader
        title="Orders"
        description="View and manage all orders"
        currentPage="orders"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <OrdersAIInsights orders={orders} />
        <OrdersTable orders={orders} pagination={pagination} />
      </main>
    </div>
  );
}

