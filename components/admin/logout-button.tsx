'use client';

import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    toast.success('Logged out successfully');
    router.push('/admin');
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer"
    >
      Logout
    </button>
  );
}

