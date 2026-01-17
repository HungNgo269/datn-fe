"use client";

import { create } from "zustand";

const DEFAULT_DURATION_MS = 30_000;

export interface AudioChapter {
  id: string;
  title: string;
  duration: number; // in milliseconds
  date?: string;
  isFree?: boolean;
}

export interface BookAudioTrack {
  id: string;
  title: string;
  coverImage: string;
  chapters: AudioChapter[];
}

interface BookAudioState {
  currentTrack: BookAudioTrack | null;
  currentChapterIndex: number;
  isPlaying: boolean;
  isVisible: boolean;
  playRequestId: number;
  
  // Shuffle & Repeat
  isShuffleOn: boolean;
  repeatMode: 0 | 1 | 2; // 0=off, 1=repeat all, 2=repeat one

  // Actions
  startPlayback: (track: BookAudioTrack, chapterIndex?: number) => void;
  playChapter: (index: number) => void;
  playNextChapter: () => void;
  playPreviousChapter: () => void;
  pauseTrack: () => void;
  resumeTrack: () => void;
  stopTrack: () => void;
  hidePlayer: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  getNextChapterIndex: () => number | null;

  // Legacy support
  startDemoTrack: (
    payload: { id: string; title: string; episode?: string; coverImage: string; duration?: number }
  ) => void;
}

// Mock chapters for demo
export const MOCK_CHAPTERS: AudioChapter[] = [
  { id: "1", title: "Lời tựa", duration: 202000, date: "25/12/2025", isFree: true },
  { id: "2", title: "Phần thứ nhất: Lịch sử hình thành và phát triển", duration: 693000, date: "25/12/2025", isFree: true },
  { id: "3", title: "Giai đoạn 2: Xây dựng Chủ nghĩa xã hội", duration: 987000, date: "25/12/2025", isFree: true },
  { id: "4", title: "Giai đoạn 3: Tiền Đổi mới (1975 - 1986)", duration: 1781000, date: "25/12/2025", isFree: false },
  { id: "5", title: "Giai đoạn 4: Đổi mới và hội nhập (1986 - nay)", duration: 1500000, date: "25/12/2025", isFree: false },
  { id: "6", title: "Giai đoạn 5: Kỷ nguyên mới", duration: 506000, date: "25/12/2025", isFree: false },
  { id: "7", title: "Phần thứ hai: Ngành khoa học và công nghệ", duration: 1145000, date: "25/12/2025", isFree: false },
  { id: "8", title: "Lời kết", duration: 85000, date: "25/12/2025", isFree: true },
];

export const useBookAudioStore = create<BookAudioState>((set, get) => ({
  currentTrack: null,
  currentChapterIndex: 0,
  isPlaying: false,
  isVisible: false,
  playRequestId: 0,
  isShuffleOn: false,
  repeatMode: 0,

  toggleShuffle: () => set((state) => ({ isShuffleOn: !state.isShuffleOn })),
  
  toggleRepeat: () => set((state) => ({ 
    repeatMode: ((state.repeatMode + 1) % 3) as 0 | 1 | 2 
  })),

  getNextChapterIndex: () => {
    const { currentTrack, currentChapterIndex, isShuffleOn, repeatMode } = get();
    if (!currentTrack) return null;
    
    const totalChapters = currentTrack.chapters.length;
    
    // Repeat One - stay on same chapter
    if (repeatMode === 2) {
      return currentChapterIndex;
    }
    
    // Shuffle mode - pick random different chapter
    if (isShuffleOn && totalChapters > 1) {
      let randomIndex: number;
      do {
        randomIndex = Math.floor(Math.random() * totalChapters);
      } while (randomIndex === currentChapterIndex);
      return randomIndex;
    }
    
    // Sequential
    const nextIndex = currentChapterIndex + 1;
    if (nextIndex < totalChapters) {
      return nextIndex;
    }
    
    // At end - check repeat mode
    if (repeatMode === 1) {
      return 0; // Loop back to first
    }
    
    return null; // No more chapters
  },

  startPlayback: (track, chapterIndex = 0) =>
    set((state) => ({
      currentTrack: track,
      currentChapterIndex: chapterIndex,
      isPlaying: true,
      isVisible: true,
      playRequestId: state.playRequestId + 1,
    })),

  playChapter: (index) => {
    const { currentTrack } = get();
    if (!currentTrack || index < 0 || index >= currentTrack.chapters.length) return;
    set((state) => ({
      currentChapterIndex: index,
      isPlaying: true,
      playRequestId: state.playRequestId + 1,
    }));
  },

  playNextChapter: () => {
    const { currentTrack, currentChapterIndex } = get();
    if (!currentTrack) return;
    const nextIndex = currentChapterIndex + 1;
    if (nextIndex < currentTrack.chapters.length) {
      set((state) => ({
        currentChapterIndex: nextIndex,
        isPlaying: true,
        playRequestId: state.playRequestId + 1,
      }));
    }
  },

  playPreviousChapter: () => {
    const { currentTrack, currentChapterIndex } = get();
    if (!currentTrack) return;
    const prevIndex = currentChapterIndex - 1;
    if (prevIndex >= 0) {
      set((state) => ({
        currentChapterIndex: prevIndex,
        isPlaying: true,
        playRequestId: state.playRequestId + 1,
      }));
    }
  },

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
      currentChapterIndex: 0,
      isPlaying: false,
      isVisible: false,
      playRequestId: state.playRequestId + 1,
    })),

  hidePlayer: () => set({ isVisible: false }),

  // Legacy support for old startDemoTrack API
  startDemoTrack: (payload) =>
    set((state) => ({
      currentTrack: {
        id: payload.id,
        title: payload.title,
        coverImage: payload.coverImage,
        chapters: [
          {
            id: "demo",
            title: payload.episode || "Demo preview",
            duration: payload.duration ?? DEFAULT_DURATION_MS,
          },
        ],
      },
      currentChapterIndex: 0,
      isPlaying: true,
      isVisible: true,
      playRequestId: state.playRequestId + 1,
    })),
}));

// Helper to get current chapter from store
export const getCurrentChapter = (state: BookAudioState): AudioChapter | null => {
  if (!state.currentTrack) return null;
  return state.currentTrack.chapters[state.currentChapterIndex] ?? null;
};
