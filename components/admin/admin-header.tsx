import Link from 'next/link';
import { LogoutButton } from './logout-button';

interface AdminHeaderProps {
  title: string;
  description: string;
  currentPage: 'inventory' | 'food' | 'orders';
}

export function AdminHeader({ title, description, currentPage }: AdminHeaderProps) {
  const navLinks = [
    { href: '/admin/inventory', label: 'Inventory', page: 'inventory' as const },
    { href: '/admin/food', label: 'Foods', page: 'food' as const },
    { href: '/admin/orders', label: 'Orders', page: 'orders' as const },
  ];

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            <p className="text-gray-600 mt-1">{description}</p>
          </div>
          <div className="flex items-center gap-4">
            {navLinks.map((link) => {
              const isActive = link.page === currentPage;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`font-medium transition-colors ${
                    isActive
                      ? 'text-orange-600 border-b-2 border-orange-600 pb-1'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <LogoutButton />
          </div>
        </div>
      </div>
    </header>
  );
}

