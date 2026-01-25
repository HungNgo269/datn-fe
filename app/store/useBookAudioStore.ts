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
  accessType?: string;
  isPurchased?: boolean;
  isSubscribed?: boolean;
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

  // Purchase Required Dialog
  isPurchaseDialogOpen: boolean;
  purchaseDialogAccessType: "purchase" | "membership";

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
  showPurchaseDialog: (accessType: "purchase" | "membership") => void;
  hidePurchaseDialog: () => void;

  // Legacy support
  startDemoTrack: (
    payload: { id: string; title: string; episode?: string; coverImage: string; duration?: number }
  ) => void;
  updateChapterDuration: (chapterId: string, duration: number) => void;
  
  // Loading State
  isLoading: boolean;
  loadingMessage: string;
  setLoading: (isLoading: boolean, message?: string) => void;
}

export const useBookAudioStore = create<BookAudioState>((set, get) => ({
  currentTrack: null,
  currentChapterIndex: 0,
  isPlaying: false,
  isVisible: false,
  playRequestId: 0,
  isShuffleOn: false,
  repeatMode: 0,
  isPurchaseDialogOpen: false,
  purchaseDialogAccessType: "purchase",
  
  isLoading: false,
  loadingMessage: "Đang tải...",

  setLoading: (isLoading, message = "Đang tải...") => set({ isLoading, loadingMessage: message }),

  toggleShuffle: () => set((state) => ({ isShuffleOn: !state.isShuffleOn })),
  
  toggleRepeat: () => set((state) => ({ 
    repeatMode: ((state.repeatMode + 1) % 3) as 0 | 1 | 2 
  })),

  showPurchaseDialog: (accessType) => set({ 
    isPurchaseDialogOpen: true, 
    purchaseDialogAccessType: accessType 
  }),

  hidePurchaseDialog: () => set({ isPurchaseDialogOpen: false }),

  getNextChapterIndex: () => {
    const { currentTrack, currentChapterIndex, isShuffleOn, repeatMode } = get();
    if (!currentTrack) return null;
    
    // Safety check for empty chapters
    if (!currentTrack.chapters || currentTrack.chapters.length === 0) return null;
    
    const totalChapters = currentTrack.chapters.length;
    
    // Repeat One - return SAME index (handled in component to replay)
    // But for the purpose of "Next" button in UI, typically "Next" means "Next Track"
    // However, if the player auto-calls this on ended, we want it to replay.
    // The player component handles the logic: if nextIndex === currentIndex, it replay.
    if (repeatMode === 2) {
      return currentChapterIndex;
    }
    
    // Shuffle mode
    if (isShuffleOn && totalChapters > 1) {
      // Simple random for now. For better shuffle, we'd need a played history.
      let randomIndex: number;
      // Try to find a different chapter
      let attempts = 0;
      do {
        randomIndex = Math.floor(Math.random() * totalChapters);
        attempts++;
      } while (randomIndex === currentChapterIndex && attempts < 5);
      
      return randomIndex;
    }
    
    // Sequential
    const nextIndex = currentChapterIndex + 1;
    if (nextIndex < totalChapters) {
      return nextIndex;
    }
    
    // At end - check repeat all
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
    
    // Validate access to the chapter
    const chapter = currentTrack.chapters[index];
    const isFree = chapter.isFree ?? false;
    const isPurchased = currentTrack.isPurchased ?? false;
    const isSubscribed = currentTrack.isSubscribed ?? false;
    const accessType = currentTrack.accessType;
    
    const isUnlocked = isFree || isPurchased || (isSubscribed && accessType === 'membership');
    
    if (!isUnlocked) {
      const dialogAccessType = accessType === 'membership' ? 'membership' : 'purchase';
      get().showPurchaseDialog(dialogAccessType);
      return;
    }
    
    set((state) => ({
      currentChapterIndex: index,
      isPlaying: true,
      playRequestId: state.playRequestId + 1,
    }));
  },

  playNextChapter: () => {
    const { currentTrack, currentChapterIndex } = get();
    if (!currentTrack) return;
    
    const isPurchased = currentTrack.isPurchased ?? false;
    const isSubscribed = currentTrack.isSubscribed ?? false;
    const accessType = currentTrack.accessType;
    
    // Find next unlocked chapter
    let nextIndex = currentChapterIndex + 1;
    while (nextIndex < currentTrack.chapters.length) {
      const chapter = currentTrack.chapters[nextIndex];
      const isFree = chapter.isFree ?? false;
      const isUnlocked = isFree || isPurchased || (isSubscribed && accessType === 'membership');
      
      if (isUnlocked) {
        set((state) => ({
          currentChapterIndex: nextIndex,
          isPlaying: true,
          playRequestId: state.playRequestId + 1,
        }));
        return;
      }
      nextIndex++;
    }
    
    // All remaining chapters are locked
    const dialogAccessType = accessType === 'membership' ? 'membership' : 'purchase';
    get().showPurchaseDialog(dialogAccessType);
  },

  playPreviousChapter: () => {
    const { currentTrack, currentChapterIndex } = get();
    if (!currentTrack) return;
    
    const isPurchased = currentTrack.isPurchased ?? false;
    const isSubscribed = currentTrack.isSubscribed ?? false;
    const accessType = currentTrack.accessType;
    
    // Find previous unlocked chapter
    let prevIndex = currentChapterIndex - 1;
    while (prevIndex >= 0) {
      const chapter = currentTrack.chapters[prevIndex];
      const isFree = chapter.isFree ?? false;
      const isUnlocked = isFree || isPurchased || (isSubscribed && accessType === 'membership');
      
      if (isUnlocked) {
        set((state) => ({
          currentChapterIndex: prevIndex,
          isPlaying: true,
          playRequestId: state.playRequestId + 1,
        }));
        return;
      }
      prevIndex--;
    }
    
    // All previous chapters are locked (shouldn't happen often, but handle it)
    const dialogAccessType = accessType === 'membership' ? 'membership' : 'purchase';
    get().showPurchaseDialog(dialogAccessType);
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
    
  updateChapterDuration: (chapterId: string, duration: number) =>
    set((state) => {
      if (!state.currentTrack) return {};
      const chapters = state.currentTrack.chapters.map((c) =>
        c.id === chapterId ? { ...c, duration } : c
      );
      return { 
        currentTrack: { ...state.currentTrack, chapters } 
      };
    }),
}));

// Helper to get current chapter from store
export const getCurrentChapter = (state: BookAudioState): AudioChapter | null => {
  if (!state.currentTrack) return null;
  return state.currentTrack.chapters[state.currentChapterIndex] ?? null;
};
