"use client";

import { useEffect, useState, useRef, useCallback, memo } from "react";
import { useBookAudioStore } from "@/app/store/useBookAudioStore";

interface PlayerProgressBarProps {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  duration: number; // passed from parent or store
}

export const PlayerProgressBar = memo(({ audioRef, duration }: PlayerProgressBarProps) => {
  const [elapsed, setElapsed] = useState(0);
  const isSeeking = useRef(false);
  const isPlaying = useBookAudioStore((state) => state.isPlaying);

  // Sync with audio element time updates
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (!isSeeking.current) {
        setElapsed((audio.currentTime || 0) * 1000);
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [audioRef]); // Empty dependency array might be enough if audioRef is stable, but checking on mount is safer

  // Seek handlers
  const handleSeekStart = useCallback((e: React.PointerEvent<HTMLInputElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    isSeeking.current = true;
  }, []);

  const handleSeekEnd = useCallback((e: React.PointerEvent<HTMLInputElement>) => {
    isSeeking.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
    
    if (audioRef.current) {
      setElapsed((audioRef.current.currentTime || 0) * 1000);
    }
  }, [audioRef]);

  const handleSeek = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!audioRef.current) return;
      
      const audio = audioRef.current;
      const newPercent = Number(e.target.value);
      const validDuration = duration > 0 ? duration : 0;
      const newTimeSec = (newPercent / 100) * (validDuration / 1000); 
      
      setElapsed(newTimeSec * 1000);
      
      if (Number.isFinite(newTimeSec)) {
          audio.currentTime = newTimeSec;
          if (isPlaying && audio.paused && !audio.ended) {
            audio.play().catch(console.error);
          }
      }
    },
    [duration, isPlaying, audioRef]
  );

  const progressPercent = duration > 0 ? Math.min((elapsed / duration) * 100, 100) : 0;

  const formatTime = (timeMs: number): string => {
    const totalSeconds = Math.max(0, Math.floor(timeMs / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  };

  return (
    <div className="flex w-full items-center gap-1 sm:gap-2">
      <span className="min-w-[32px] sm:min-w-[40px] text-right text-[10px] sm:text-xs xl:text-sm tabular-nums text-muted-foreground">
        {formatTime(elapsed)}
      </span>
      <div className="group relative h-4 flex-1 flex items-center cursor-pointer">
        {/* Visual track background */}
        <div className="absolute left-0 right-0 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700">
          {/* Filled portion */}
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-primary transition-colors"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        {/* Thumb */}
        <div
          className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-primary shadow-md pointer-events-none"
          style={{ left: `${progressPercent}%`, marginLeft: "-7px" }}
        />
        {/* Invisible range input on top */}
          <input
            type="range"
            min="0"
            max="100"
            value={progressPercent}
            onChange={handleSeek}
            onPointerDown={handleSeekStart}
            onPointerUp={handleSeekEnd}
            onPointerCancel={handleSeekEnd}
            className="absolute inset-0 w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-transparent [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-transparent [&::-moz-range-thumb]:cursor-pointer"
          />
      </div>
      <span className="min-w-[32px] sm:min-w-[40px] text-[10px] sm:text-xs xl:text-sm tabular-nums text-muted-foreground">
        {formatTime(duration)}
      </span>
    </div>
  );
});

PlayerProgressBar.displayName = "PlayerProgressBar";
