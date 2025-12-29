"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, Volume2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBookAudioStore } from "@/app/store/useBookAudioStore";

export default function BookAudioStickyPlayer() {
  const currentTrack = useBookAudioStore((state) => state.currentTrack);
  const isPlaying = useBookAudioStore((state) => state.isPlaying);
  const isVisible = useBookAudioStore((state) => state.isVisible);
  const playRequestId = useBookAudioStore((state) => state.playRequestId);
  const pauseTrack = useBookAudioStore((state) => state.pauseTrack);
  const resumeTrack = useBookAudioStore((state) => state.resumeTrack);
  const stopTrack = useBookAudioStore((state) => state.stopTrack);
  const [elapsed, setElapsed] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedElapsedRef = useRef<number>(0);
  const latestElapsedRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(isPlaying);

  const cleanupAudio = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    oscillatorRef.current?.stop();
    oscillatorRef.current?.disconnect();
    oscillatorRef.current = null;
    gainRef.current?.disconnect();
    gainRef.current = null;
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    pausedElapsedRef.current = 0;
  }, []);

  const durationMs = currentTrack?.duration ?? 0;

  const tick = useCallback(() => {
    if (!durationMs || !isPlayingRef.current) return;
    const elapsedMs = Math.min(
      performance.now() - startTimeRef.current,
      durationMs
    );
    latestElapsedRef.current = elapsedMs;
    setElapsed(elapsedMs);

    if (elapsedMs >= durationMs) {
      stopTrack();
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [durationMs, setElapsed, stopTrack]);

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
          ((
            window as typeof window & {
              webkitAudioContext?: typeof AudioContext;
            }
          ).webkitAudioContext as typeof AudioContext | undefined)
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
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cleanupAudio();
    };
  }, [
    cleanupAudio,
    currentTrack?.id,
    playRequestId,
    setElapsed,
    stopTrack,
    tick,
  ]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
    if (!isPlaying) {
      latestElapsedRef.current = elapsed;
    }
  }, [elapsed, isPlaying]);

  useEffect(() => {
    const context = audioContextRef.current;
    if (!context || !currentTrack || !durationMs) return;

    if (isPlaying) {
      context.resume().catch(() => {});
      startTimeRef.current = performance.now() - pausedElapsedRef.current;
      pausedElapsedRef.current = 0;
      rafRef.current = requestAnimationFrame(tick);
    } else {
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

  const remainingSeconds = useMemo(() => {
    if (!currentTrack) return 0;
    return Math.max(0, Math.ceil((currentTrack.duration - elapsed) / 1000));
  }, [currentTrack, elapsed]);

  const progressWidth = useMemo(() => {
    if (!currentTrack || currentTrack.duration === 0) return 0;
    return Math.min((elapsed / currentTrack.duration) * 100, 100);
  }, [currentTrack, elapsed]);

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
    <div className="fixed bottom-3 left-1/2 z-50 w-full -translate-x-1/2 rounded-2xl border border-border bg-background/95">
      <div className="flex items-center gap-3 px-4 py-3">
        <Button
          size="icon"
          variant="default"
          className="h-10 w-10 rounded-full"
          onClick={handlePlayPause}
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5" />
          )}
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Volume2 className="h-4 w-4" />
            <span className="line-clamp-1">{currentTrack.title}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {currentTrack.episode || "Demo tone"} · {remainingSeconds}s left
          </p>
          <div className="mt-2 h-1.5 w-full rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-[width]"
              style={{ width: `${progressWidth}%` }}
            />
          </div>
        </div>
        <button
          type="button"
          onClick={handleClose}
          className="text-muted-foreground transition hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
