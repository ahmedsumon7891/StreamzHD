import { create } from "zustand";
import type { Channel } from "@/types";

interface SearchState {
  query: string;
  results: Channel[];
  isLoading: boolean;
  setQuery: (q: string) => void;
  setResults: (r: Channel[]) => void;
  setLoading: (v: boolean) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  query: "",
  results: [],
  isLoading: false,
  setQuery: (q) => set({ query: q }),
  setResults: (r) => set({ results: r }),
  setLoading: (v) => set({ isLoading: v }),
}));
