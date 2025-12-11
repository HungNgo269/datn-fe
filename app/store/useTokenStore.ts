import { create } from "zustand";
import { persist } from "zustand/middleware";

type State = {
  token: string | null;
};

type Action = {
  setToken: (token: string) => void;
  clearToken: () => void;
};

export const useTokenStore = create<Action & State>()(
  persist(
    (set) => ({
      token: null,

      setToken: (token: string) => {
        set({ token });
      },
      clearToken: () => {
        set({ token: null });
      },
    }),
    {
      name: "token-storage",
    }
  )
);
