import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "../feature/users/types/user.type";

type State = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};

type Action = {
  setUser: (user: User) => void;
  setSubscriptionPlan: (plan: string) => void;
  clearUser: () => void;
};

export const useAuthStore = create<Action & State>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user: User) => {
        set({
          user: user,
          isAuthenticated: true,
        });
      },
      setSubscriptionPlan: (plan: string) => {
        set((state) => {
          if (!state.user) return state;
          return {
            ...state,
            user: { ...state.user, subscriptionPlan: plan },
          };
        });
      },
      clearUser: () => {
        set({
          user: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
