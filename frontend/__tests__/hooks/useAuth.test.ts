import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/useAuthStore';

// Mock Next.js navigation
const mockPush = vi.fn();
const mockPathname = '/';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => mockPathname,
}));

// Mock Zustand store
vi.mock('@/store/useAuthStore', () => ({
  useAuthStore: vi.fn(),
}));

describe('useAuth Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Protected Routes (requireAuth = true)', () => {
    it('should redirect to login when not authenticated', async () => {
      (useAuthStore as any).mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
      });

      renderHook(() => useAuth(true));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });

    it('should not redirect when authenticated', async () => {
      (useAuthStore as any).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
      });

      renderHook(() => useAuth(true));

      await waitFor(() => {
        expect(mockPush).not.toHaveBeenCalled();
      });
    });

    it('should not redirect while loading', async () => {
      (useAuthStore as any).mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
      });

      renderHook(() => useAuth(true));

      // Should not redirect while loading
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should return authentication status', () => {
      (useAuthStore as any).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
      });

      const { result } = renderHook(() => useAuth(true));

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Public Routes (requireAuth = false)', () => {
    it('should redirect to feed when authenticated on public route', async () => {
      (useAuthStore as any).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
      });

      renderHook(() => useAuth(false));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/feed');
      });
    });

    it('should not redirect when not authenticated on public route', async () => {
      (useAuthStore as any).mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
      });

      renderHook(() => useAuth(false));

      await waitFor(() => {
        expect(mockPush).not.toHaveBeenCalled();
      });
    });

    it('should not redirect while loading on public route', async () => {
      (useAuthStore as any).mockReturnValue({
        isAuthenticated: true,
        isLoading: true,
      });

      renderHook(() => useAuth(false));

      // Should not redirect while loading
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('Default Behavior', () => {
    it('should require auth by default', async () => {
      (useAuthStore as any).mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
      });

      // Call without parameter (defaults to true)
      renderHook(() => useAuth());

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });
  });

  describe('State Changes', () => {
    it('should react to authentication state changes', async () => {
      let authState = {
        isAuthenticated: false,
        isLoading: true,
      };

      (useAuthStore as any).mockImplementation(() => authState);

      const { rerender } = renderHook(() => useAuth(true));

      // Initially loading, no redirect
      expect(mockPush).not.toHaveBeenCalled();

      // Simulate loading complete, user not authenticated
      authState = {
        isAuthenticated: false,
        isLoading: false,
      };

      rerender();

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });

    it('should handle authentication on public route after loading', async () => {
      let authState = {
        isAuthenticated: true,
        isLoading: true,
      };

      (useAuthStore as any).mockImplementation(() => authState);

      const { rerender } = renderHook(() => useAuth(false));

      // Initially loading, no redirect
      expect(mockPush).not.toHaveBeenCalled();

      // Simulate loading complete, user authenticated
      authState = {
        isAuthenticated: true,
        isLoading: false,
      };

      rerender();

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/feed');
      });
    });
  });

  describe('Return Values', () => {
    it('should return isLoading true when store is loading', () => {
      (useAuthStore as any).mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
      });

      const { result } = renderHook(() => useAuth(true));

      expect(result.current.isLoading).toBe(true);
    });

    it('should return isAuthenticated true when user is authenticated', () => {
      (useAuthStore as any).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
      });

      const { result } = renderHook(() => useAuth(true));

      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should return both values correctly', () => {
      (useAuthStore as any).mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
      });

      const { result } = renderHook(() => useAuth(false));

      expect(result.current).toEqual({
        isAuthenticated: false,
        isLoading: false,
      });
    });
  });
});
