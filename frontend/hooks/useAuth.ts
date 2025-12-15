import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

export function useAuth(requireAuth: boolean = true) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading) {
      // If route requires auth and user is not authenticated
      if (requireAuth && !isAuthenticated) {
        router.push('/login');
      }

      // If route doesn't require auth (login/register) and user is authenticated
      if (!requireAuth && isAuthenticated) {
        router.push('/feed');
      }
    }
  }, [isAuthenticated, isLoading, requireAuth, router, pathname]);

  return { isAuthenticated, isLoading };
}
