"use client";

import { create } from "zustand";

const DEFAULT_DURATION_MS = 30_000;

export interface BookAudioTrack {
  id: string;
  title: string;
  episode?: string;
  coverImage: string;
  duration: number;
}

interface BookAudioState {
  currentTrack: BookAudioTrack | null;
  isPlaying: boolean;
  isVisible: boolean;
  playRequestId: number;
  startDemoTrack: (
    payload: Omit<BookAudioTrack, "duration"> & { duration?: number }
  ) => void;
  pauseTrack: () => void;
  resumeTrack: () => void;
  stopTrack: () => void;
  hidePlayer: () => void;
}

export const useBookAudioStore = create<BookAudioState>((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  isVisible: false,
  playRequestId: 0,
  startDemoTrack: (payload) =>
    set((state) => ({
      currentTrack: {
        id: payload.id,
        title: payload.title,
        episode: payload.episode,
        coverImage: payload.coverImage,
        duration: payload.duration ?? DEFAULT_DURATION_MS,
      },
      isPlaying: true,
      isVisible: true,
      playRequestId: state.playRequestId + 1,
    })),
  pauseTrack: () => {
    if (!get().currentTrack) return;
    set({ isPlaying: false });
  },
  resumeTrack: () => {
    if (!get().currentTrack) return;
    set({ isPlaying: true });
  },
  stopTrack: () =>
    set((state) => ({
      currentTrack: null,
      isPlaying: false,
      isVisible: false,
      playRequestId: state.playRequestId + 1,
    })),
  hidePlayer: () => set({ isVisible: false }),
}));
