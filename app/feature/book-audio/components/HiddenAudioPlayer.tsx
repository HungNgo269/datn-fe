"use client";

import { useRef, useEffect, useState, memo } from "react";
import { useBookAudioStore, getCurrentChapter } from "@/app/store/useBookAudioStore";

interface HiddenAudioPlayerProps {
    audioRef: React.RefObject<HTMLAudioElement | null>;
    onEnded: () => void;
    onError: (e: React.SyntheticEvent<HTMLAudioElement>) => void;
    onPlay: () => void;
}

export const HiddenAudioPlayer = memo(({ 
    audioRef, 
    onEnded, 
    onError, 
    onPlay 
}: HiddenAudioPlayerProps) => {
    const updateChapterDuration = useBookAudioStore((state) => state.updateChapterDuration);
    
    // We don't use React state for elapsed here to avoid re-renders.
    // Instead we attach listeners directly in the parent or a sibling component if needed.
    // However, the original code used 'onTimeUpdate' prop on the <audio> tag.
    // To prevent re-renders, we should NOT pass a handler that calls 'setState' in the parent.
    // But we DO need to update 'elapsed' for the Slider.
    
    const handleMetadata = (e: React.SyntheticEvent<HTMLAudioElement>) => {
        const audio = e.currentTarget;
        if (audio.duration && !isNaN(audio.duration) && audio.duration !== Infinity) {
            const durationMs = audio.duration * 1000;
            const state = useBookAudioStore.getState();
            const currentChapter = getCurrentChapter(state);
            if (currentChapter) {
                state.updateChapterDuration(currentChapter.id, durationMs);
            }
        }
    };

    return (
        <audio 
            ref={audioRef} 
            preload="auto"
            // Remove onTimeUpdate from here to avoid parent re-renders if we were passing a state setter
            // We will handle time updates in the Progress component
            onEnded={onEnded}
            onError={onError}
            onLoadedMetadata={handleMetadata}
            onDurationChange={handleMetadata}
            onPlay={onPlay} // Needed to sync store state
        />
    );
});

HiddenAudioPlayer.displayName = "HiddenAudioPlayer";
