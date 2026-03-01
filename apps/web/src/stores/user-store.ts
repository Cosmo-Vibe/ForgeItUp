import { create } from 'zustand';
import type { User, SubscriptionTier } from '@forgeitup/shared';

interface UserState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User) => void;
  updateUser: (updates: Partial<User>) => void;
  setSubscriptionTier: (tier: SubscriptionTier) => void;
  incrementGenerationCount: () => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoading: true,

  setUser: (user) => set({ user, isLoading: false }),
  updateUser: (updates) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),
  setSubscriptionTier: (tier) =>
    set((state) => ({
      user: state.user ? { ...state.user, subscriptionTier: tier } : null,
    })),
  incrementGenerationCount: () =>
    set((state) => ({
      user: state.user
        ? { ...state.user, generationsThisMonth: state.user.generationsThisMonth + 1 }
        : null,
    })),
  clearUser: () => set({ user: null }),
  setLoading: (isLoading) => set({ isLoading }),
}));
