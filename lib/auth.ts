import { auth } from '@/app/api/auth/[...nextauth]/route';

export async function getCurrentAdmin() {
  const session = await auth();
  return session?.user;
}

export async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    throw new Error('Unauthorized');
  }
  return admin;
}

