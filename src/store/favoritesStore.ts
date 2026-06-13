import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FavoritesState {
  slugs: string[];
  toggle: (slug: string) => void;
  has: (slug: string) => boolean;
  clear: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      slugs: [],
      toggle: (slug) => {
        const has = get().slugs.includes(slug);
        set({ slugs: has ? get().slugs.filter((s) => s !== slug) : [...get().slugs, slug] });
      },
      has: (slug) => get().slugs.includes(slug),
      clear: () => set({ slugs: [] }),
    }),
    { name: "streamz-favorites" },
  ),
);
