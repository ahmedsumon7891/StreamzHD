import { create } from "zustand";

interface PlayerState {
  currentSlug: string | null;
  isPlaying: boolean;
  volume: number;
  quality: string;
  error: string | null;
  setCurrent: (slug: string) => void;
  setPlaying: (v: boolean) => void;
  setVolume: (v: number) => void;
  setQuality: (q: string) => void;
  setError: (e: string | null) => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  currentSlug: null,
  isPlaying: false,
  volume: 1,
  quality: "auto",
  error: null,
  setCurrent: (slug) => set({ currentSlug: slug }),
  setPlaying: (v) => set({ isPlaying: v }),
  setVolume: (v) => set({ volume: v }),
  setQuality: (q) => set({ quality: q }),
  setError: (e) => set({ error: e }),
}));
