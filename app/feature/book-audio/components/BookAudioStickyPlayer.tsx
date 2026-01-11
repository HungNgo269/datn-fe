"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBookAudioStore } from "@/app/store/useBookAudioStore";
import Image from "next/image";

export default function BookAudioStickyPlayer() {
  const currentTrack = useBookAudioStore((state) => state.currentTrack);
  const isPlaying = useBookAudioStore((state) => state.isPlaying);
  const isVisible = useBookAudioStore((state) => state.isVisible);
  const playRequestId = useBookAudioStore((state) => state.playRequestId);
  const pauseTrack = useBookAudioStore((state) => state.pauseTrack);
  const resumeTrack = useBookAudioStore((state) => state.resumeTrack);
  const stopTrack = useBookAudioStore((state) => state.stopTrack);
  const [elapsed, setElapsed] = useState<number>(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedElapsedRef = useRef<number>(0);
  const latestElapsedRef = useRef<number>(0);
  const isActiveRef = useRef<boolean>(false);

  const cleanupAudio = useCallback(() => {
    isActiveRef.current = false;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      } catch (e) {
        // Ignore errors during cleanup
      }
      oscillatorRef.current = null;
    }
    if (gainRef.current) {
      try {
        gainRef.current.disconnect();
      } catch (e) {
        // Ignore errors during cleanup
      }
      gainRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    pausedElapsedRef.current = 0;
  }, []);

  const durationMs = currentTrack?.duration ?? 0;

  const tick = useCallback(() => {
    if (!durationMs || !isActiveRef.current) return;
    const elapsedMs = Math.min(
      performance.now() - startTimeRef.current,
      durationMs
    );
    latestElapsedRef.current = elapsedMs;
    setElapsed(elapsedMs);

    if (elapsedMs >= durationMs) {
      isActiveRef.current = false;
      stopTrack();
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [durationMs, stopTrack]);

  useEffect(() => {
    if (!currentTrack) {
      setElapsed(0);
      cleanupAudio();
      return;
    }

    cleanupAudio();
    pausedElapsedRef.current = 0;

    const AudioContextCtor =
      typeof window !== "undefined"
        ? window.AudioContext ||
          (
            window as typeof window & {
              webkitAudioContext?: typeof AudioContext;
            }
          ).webkitAudioContext
        : undefined;

    if (!AudioContextCtor) {
      stopTrack();
      return;
    }

    const context = new AudioContextCtor();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = 420;
    gain.gain.value = 0.15;
    oscillator.connect(gain).connect(context.destination);

    audioContextRef.current = context;
    oscillatorRef.current = oscillator;
    gainRef.current = gain;

    oscillator.start();
    startTimeRef.current = performance.now();
    setElapsed(0);
    isActiveRef.current = true;
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cleanupAudio();
    };
  }, [cleanupAudio, currentTrack?.id, playRequestId, stopTrack, tick]);

  useEffect(() => {
    const context = audioContextRef.current;
    if (!context || !currentTrack || !durationMs) return;

    if (isPlaying) {
      context.resume().catch(() => {});
      startTimeRef.current = performance.now() - pausedElapsedRef.current;
      pausedElapsedRef.current = 0;
      isActiveRef.current = true;
      rafRef.current = requestAnimationFrame(tick);
    } else {
      isActiveRef.current = false;
      context.suspend().catch(() => {});
      pausedElapsedRef.current = latestElapsedRef.current;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    }
  }, [currentTrack?.id, durationMs, isPlaying, tick]);

  useEffect(
    () => () => {
      cleanupAudio();
    },
    [cleanupAudio]
  );

  const progressWidth = useMemo(() => {
    if (!currentTrack || currentTrack.duration === 0) return 0;
    return Math.min((elapsed / currentTrack.duration) * 100, 100);
  }, [currentTrack, elapsed]);

  const formatTime = (timeMs: number): string => {
    const totalSeconds = Math.max(0, Math.floor(timeMs / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  };

  if (!currentTrack || (!isVisible && !isPlaying)) {
    return null;
  }

  const handlePlayPause = () => {
    if (isPlaying) {
      pauseTrack();
    } else {
      resumeTrack();
    }
  };

  const handleClose = () => {
    cleanupAudio();
    stopTrack();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background p-4 ">
      <div className="mx-auto flex max-w-4xl items-center gap-4">
        {/* Album Cover */}
        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-800 shadow-lg">
          <Image src={currentTrack.coverImage} alt="currentTrack.title"></Image>
        </div>

        {/* Track Info & Progress */}
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <h3 className="truncate text-base font-semibold text-foreground">
              {currentTrack.title}
            </h3>
          </div>
          <p className="mb-3 text-sm text-neutral-400">
            {currentTrack.episode || "Demo tone"}
          </p>

          <div className="flex items-center gap-3">
            <span className="min-w-[35px] text-xs font-medium tabular-nums text-neutral-400">
              {formatTime(elapsed)}
            </span>
            <div className="relative h-1 flex-1 rounded-full bg-muted-foreground">
              <div
                className="absolute left-0 top-0 h-full rounded-full bg-primary/70 transition-all duration-100 ease-linear"
                style={{ width: `${progressWidth}%` }}
              />
              {/* Play/Pause button in center */}
            </div>
            <button
              type="button"
              onClick={handlePlayPause}
              className="absolute p-1.5 left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground "
            >
              {isPlaying ? (
                <Pause className="h-3.5 w-3.5 fill-current" />
              ) : (
                <Play className="ml-0.5 h-3.5 w-3.5 fill-current" />
              )}
            </button>
            <span className="min-w-[35px] text-xs font-medium tabular-nums text-neutral-400">
              {formatTime(currentTrack.duration)}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-shrink-0 items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            className="h-9 w-9 rounded-full text-neutral-400 hover:bg-neutral-800 hover:text-white"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
