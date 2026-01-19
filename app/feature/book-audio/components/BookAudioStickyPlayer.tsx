"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  X,
  ListMusic,
  Loader2,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  useBookAudioStore,
  getCurrentChapter,
} from "@/app/store/useBookAudioStore";
import Image from "next/image";
import { BookAudioChapterList } from "./BookAudioChapterList";
import { getChapterAudio } from "../api/audio.api";

export default function BookAudioStickyPlayer() {
  const currentTrack = useBookAudioStore((state) => state.currentTrack);
  const currentChapterIndex = useBookAudioStore(
    (state) => state.currentChapterIndex
  );
  const isPlaying = useBookAudioStore((state) => state.isPlaying);
  const isVisible = useBookAudioStore((state) => state.isVisible);
  const playRequestId = useBookAudioStore((state) => state.playRequestId);
  const pauseTrack = useBookAudioStore((state) => state.pauseTrack);
  const resumeTrack = useBookAudioStore((state) => state.resumeTrack);
  const stopTrack = useBookAudioStore((state) => state.stopTrack);
  const playNextChapter = useBookAudioStore((state) => state.playNextChapter);
  const playPreviousChapter = useBookAudioStore(
    (state) => state.playPreviousChapter
  );
  const playChapter = useBookAudioStore((state) => state.playChapter);
  const getNextChapterIndex = useBookAudioStore((state) => state.getNextChapterIndex);
  const isShuffleOn = useBookAudioStore((state) => state.isShuffleOn);
  const repeatMode = useBookAudioStore((state) => state.repeatMode);
  const toggleShuffle = useBookAudioStore((state) => state.toggleShuffle);
  const toggleRepeat = useBookAudioStore((state) => state.toggleRepeat);

  const [elapsed, setElapsed] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(80);
  const [isChapterListOpen, setIsChapterListOpen] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isSpeedPopoverOpen, setIsSpeedPopoverOpen] = useState<boolean>(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState<boolean>(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  const playbackSpeeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  // Combined play mode: 0 = sequential, 1 = repeat all, 2 = repeat one, 3 = shuffle
  const playMode = isShuffleOn ? 3 : repeatMode;

  const cyclePlayMode = useCallback(() => {
    // Current: 0 (sequential) -> 1 (repeat all) -> 2 (repeat one) -> 3 (shuffle) -> 0
    if (playMode === 0) {
      // sequential -> repeat all
      toggleRepeat(); // 0 -> 1
    } else if (playMode === 1) {
      // repeat all -> repeat one
      toggleRepeat(); // 1 -> 2
    } else if (playMode === 2) {
      // repeat one -> shuffle
      toggleRepeat(); // 2 -> 0
      toggleShuffle(); // turn on shuffle
    } else {
      // shuffle -> sequential
      toggleShuffle(); // turn off shuffle
    }
  }, [playMode, toggleRepeat, toggleShuffle]);

  // Replace oscillator refs with HTMLAudioElement
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  // Get current chapter
  const currentChapter = useMemo(() => {
    if (!currentTrack) return null;
    return currentTrack.chapters[currentChapterIndex] ?? null;
  }, [currentTrack, currentChapterIndex]);

  // Initialize duration from chapter info, but allow updates from metadata
  useEffect(() => {
    // FIX: Hardcode 10 minutes (600000ms) if duration is 0, per user request for testing seeking
    const chapterDuration = currentChapter?.duration || 0;
    setDuration(chapterDuration > 0 ? chapterDuration : 600000);
  }, [currentChapter]);

  // Check if can navigate
  const canGoNext = useMemo(() => {
    if (!currentTrack) return false;
    return currentChapterIndex < currentTrack.chapters.length - 1;
  }, [currentTrack, currentChapterIndex]);

  const canGoPrevious = useMemo(() => {
    return currentChapterIndex > 0;
  }, [currentChapterIndex]);

  // Fetch and load audio from backend API
  useEffect(() => {
    if (!currentChapter?.id || !currentTrack) {
      setElapsed(0);
      setIsLoadingAudio(false);
      setAudioError(null);
      isSeeking.current = false; // Reset seeking state
      return;
    }

    setIsLoadingAudio(true);
    setAudioError(null);
    setElapsed(0);
    isSeeking.current = false; // Reset seeking state

    getChapterAudio(currentChapter.id)
      .then((response) => {
        if (audioRef.current) {
          audioRef.current.src = response.url;
          audioRef.current.playbackRate = playbackSpeed;
          audioRef.current.volume = volume / 100;
          audioUrlRef.current = response.url;
          
          // Auto-play if isPlaying is true
          if (isPlaying) {
            audioRef.current.play().catch((err) => {
              console.error("Auto-play error:", err);
              pauseTrack();
            });
          }
        }
      })
      .catch((error) => {
        setAudioError("Không thể tải audio");
        console.error("Audio fetch error:", error);
        pauseTrack();
      })
      .finally(() => {
        setIsLoadingAudio(false);
      });
  }, [currentChapter?.id, playRequestId]);

  // Handle play/pause state changes
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;

    if (isPlaying) {
      audioRef.current.play().catch((err) => {
        console.error("Play error:", err);
        pauseTrack();
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrack, pauseTrack]);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // Update playback speed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Ref to track if user is currently seeking (dragging the slider)
  const isSeeking = useRef<boolean>(false);

  // Setup audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      // Only update state if NOT seeking, to prevent slider jitter/fighting
      if (!isSeeking.current) {
         setElapsed((audio.currentTime || 0) * 1000);
      }
    };

    const handleEnded = () => {
      const nextIndex = getNextChapterIndex();
      if (nextIndex !== null) {
        playChapter(nextIndex);
      } else {
        stopTrack();
      }
    };

    const handleError = () => {
      setAudioError("Lỗi khi phát audio");
      pauseTrack();
    };

    const handleMetadata = () => {
        if (audio.duration && !isNaN(audio.duration) && audio.duration !== Infinity) {
            setDuration(audio.duration * 1000);
        }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadedmetadata', handleMetadata);
    audio.addEventListener('durationchange', handleMetadata);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadedmetadata', handleMetadata);
      audio.removeEventListener('durationchange', handleMetadata);
    };
  }, [getNextChapterIndex, playChapter, stopTrack, pauseTrack]);


  const progressPercent = useMemo(() => {
    if (!duration) return 0;
    return Math.min((elapsed / duration) * 100, 100);
  }, [duration, elapsed]);

  const formatTime = (timeMs: number): string => {
    const totalSeconds = Math.max(0, Math.floor(timeMs / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  };

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      pauseTrack();
    } else {
      resumeTrack();
    }
  }, [isPlaying, pauseTrack, resumeTrack]);

  const handleClose = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    stopTrack();
    setIsChapterListOpen(false);
  }, [stopTrack]);

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setVolume(Number(e.target.value));
    },
    []
  );

  const toggleChapterList = useCallback(() => {
    setIsChapterListOpen((prev) => !prev);
  }, []);

  const handleNextChapter = useCallback(() => {
    if (canGoNext) {
      playNextChapter();
    }
  }, [canGoNext, playNextChapter]);

  const handlePreviousChapter = useCallback(() => {
    if (canGoPrevious) {
      playPreviousChapter();
    }
  }, [canGoPrevious, playPreviousChapter]);

  const handleSeekStart = useCallback((e: React.PointerEvent<HTMLInputElement>) => {
     e.currentTarget.setPointerCapture(e.pointerId);
     isSeeking.current = true;
  }, []);

  const handleSeekEnd = useCallback((e: React.PointerEvent<HTMLInputElement>) => {
     isSeeking.current = false;
     e.currentTarget.releasePointerCapture(e.pointerId);
  }, []);

  const handleSeek = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!audioRef.current) return;
      
      const newPercent = Number(e.target.value);
      // Use state 'duration' (which includes fallback) instead of audio.duration
      // This ensures we can seek even if audio hasn't fully loaded duration metadata
      const validDuration = duration > 0 ? duration : 600000;
      
      const newTimeSec = (newPercent / 100) * (validDuration / 1000); 
      
      // Update visual immediately
      setElapsed(newTimeSec * 1000);
      
      // Update audio
      // Check for finite to avoid errors
      if (Number.isFinite(newTimeSec)) {
          audioRef.current.currentTime = newTimeSec;
      }
    },
    [duration]
  );

  if (!currentTrack || !currentChapter || (!isVisible && !isPlaying)) {
    return null;
  }

  return (
    <>
      {/* Hidden Audio Element */}
      <audio ref={audioRef} preload="auto" />

      {/* Chapter List Panel */}
      <BookAudioChapterList
        isOpen={isChapterListOpen}
        onClose={() => setIsChapterListOpen(false)}
      />

      {/* Sticky Player */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-card/80 backdrop-blur-[5px] py-2 md:py-3 lg:py-4 xl:py-5 shadow-2xl">
        <div className="relative mx-auto flex h-16 sm:h-[72px] xl:h-20 items-center px-2 sm:px-4 xl:px-6">
          {/* Left Section - Track Info */}
          <div className="flex w-[140px] sm:w-[200px] lg:w-[280px] xl:w-[320px] shrink-0 items-center gap-2 sm:gap-3">
            <div className="relative h-10 w-10 sm:h-14 sm:w-14 xl:h-16 xl:w-16 flex-shrink-0 overflow-hidden rounded-lg bg-muted shadow-md">
              <Image
                src={currentTrack.coverImage}
                alt={currentTrack.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="min-w-0 max-w-[80px] sm:max-w-[120px] lg:max-w-[200px] xl:max-w-[220px]">
              <p className="truncate text-xs sm:text-sm xl:text-base font-medium text-foreground hover:underline cursor-pointer">
                {currentTrack.title}
              </p>
              <p className="truncate text-[10px] sm:text-xs xl:text-sm text-muted-foreground">
                {isLoadingAudio ? (
                  <span className="flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Đang tải...
                  </span>
                ) : audioError ? (
                  <span className="text-rose-500">{audioError}</span>
                ) : (
                  <>Chương {currentChapterIndex + 1}: {currentChapter.title}</>
                )}
              </p>
            </div>
          </div>

          {/* Center Section - Player Controls (Absolutely Centered) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex w-[280px] sm:w-[400px] md:w-[500px] lg:w-[600px] xl:w-[700px] flex-col items-center gap-0.5 sm:gap-1">
            {/* Control Buttons */}
            <div className="flex items-center gap-2 sm:gap-4 xl:gap-5">
              {/* Playback Speed Button with Popover */}
              <Popover open={isSpeedPopoverOpen} onOpenChange={setIsSpeedPopoverOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={`hidden sm:flex h-7 w-7 sm:h-8 sm:w-8 xl:h-9 xl:w-9 items-center justify-center rounded-full transition-colors cursor-pointer ${
                      playbackSpeed !== 1
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    aria-label="Playback speed"
                  >
                    <span className="text-[10px] sm:text-xs xl:text-sm font-semibold">
                      {playbackSpeed}x
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-auto p-2" 
                  side="top" 
                  align="center"
                  sideOffset={12}
                >
                  <div className="flex flex-col gap-1">
                    <p className="text-xs text-muted-foreground font-medium px-2 pb-1 border-b border-border">
                      Tốc độ phát
                    </p>
                    {playbackSpeeds.map((speed) => (
                      <button
                        key={speed}
                        type="button"
                        onClick={() => {
                          setPlaybackSpeed(speed);
                          setIsSpeedPopoverOpen(false);
                        }}
                        className={`px-3 py-1.5 text-sm rounded-md transition-colors cursor-pointer ${
                          playbackSpeed === speed
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted text-foreground"
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Previous Button */}
              <button
                type="button"
                onClick={handlePreviousChapter}
                disabled={!canGoPrevious}
                className={`flex h-7 w-7 sm:h-8 sm:w-8 xl:h-9 xl:w-9 items-center justify-center transition-colors ${
                  canGoPrevious
                    ? "text-muted-foreground hover:text-foreground cursor-pointer"
                    : "text-muted-foreground/40 cursor-not-allowed"
                }`}
                aria-label="Previous chapter"
              >
                <SkipBack className="h-4 w-4 sm:h-5 sm:w-5 xl:h-6 xl:w-6 fill-current" />
              </button>

              {/* Play/Pause Button */}
              <button
                type="button"
                onClick={handlePlayPause}
                className="flex h-8 w-8 sm:h-9 sm:w-9 xl:h-11 xl:w-11 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105 shadow-md cursor-pointer"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="h-3.5 w-3.5 sm:h-4 sm:w-4 xl:h-5 xl:w-5 fill-current" />
                ) : (
                  <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4 xl:h-5 xl:w-5 translate-x-[1px] fill-current" />
                )}
              </button>

              {/* Next Button */}
              <button
                type="button"
                onClick={handleNextChapter}
                disabled={!canGoNext}
                className={`flex h-7 w-7 sm:h-8 sm:w-8 xl:h-9 xl:w-9 items-center justify-center transition-colors ${
                  canGoNext
                    ? "text-muted-foreground hover:text-foreground cursor-pointer"
                    : "text-muted-foreground/40 cursor-not-allowed"
                }`}
                aria-label="Next chapter"
              >
                <SkipForward className="h-4 w-4 sm:h-5 sm:w-5 xl:h-6 xl:w-6 fill-current" />
              </button>

              {/* Combined Play Mode Button: Sequential -> Repeat All -> Repeat One -> Shuffle */}
              <button
                type="button"
                onClick={cyclePlayMode}
                className={`hidden sm:flex relative h-7 w-7 sm:h-8 sm:w-8 xl:h-9 xl:w-9 items-center justify-center rounded-full transition-colors cursor-pointer ${
                  playMode > 0
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                aria-label={
                  playMode === 0 ? "Sequential" : 
                  playMode === 1 ? "Repeat all" : 
                  playMode === 2 ? "Repeat one" : "Shuffle"
                }
                title={
                  playMode === 0 ? "Phát tuần tự" : 
                  playMode === 1 ? "Lặp tất cả" : 
                  playMode === 2 ? "Lặp một" : "Phát ngẫu nhiên"
                }
              >
                {playMode === 3 ? (
                  <Shuffle className="h-3.5 w-3.5 sm:h-4 sm:w-4 xl:h-5 xl:w-5" />
                ) : playMode === 2 ? (
                  <Repeat1 className="h-3.5 w-3.5 sm:h-4 sm:w-4 xl:h-5 xl:w-5" />
                ) : (
                  <Repeat className="h-3.5 w-3.5 sm:h-4 sm:w-4 xl:h-5 xl:w-5" />
                )}
              </button>
            </div>

            {/* Progress Bar */}
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
          </div>

          {/* Right Section - Additional Controls */}
          <div className="ml-auto flex w-[100px] sm:w-[200px] lg:w-[280px] xl:w-[320px] shrink-0 items-center justify-end gap-1 sm:gap-2">
            {/* Chapter List Button */}
            <button
              type="button"
              onClick={toggleChapterList}
              className={`flex h-7 w-7 sm:h-8 sm:w-8 xl:h-9 xl:w-9 items-center justify-center transition-colors cursor-pointer ${
                isChapterListOpen
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label="Chapter list"
            >
              <ListMusic className="h-3.5 w-3.5 sm:h-4 sm:w-4 xl:h-5 xl:w-5" />
            </button>

            {/* Volume Control */}
            <div className="hidden sm:flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                className="flex h-7 w-7 sm:h-8 sm:w-8 xl:h-9 xl:w-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
                aria-label="Volume"
              >
                <Volume2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 xl:h-5 xl:w-5" />
              </button>
              <div className="relative hidden w-24 h-4 sm:flex items-center">
                {/* Visual track background */}
                <div className="absolute left-0 right-0 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-600">
                  {/* Filled portion */}
                  <div 
                    className="absolute left-0 top-0 h-full rounded-full bg-primary"
                    style={{ width: `${volume}%` }}
                  />
                </div>
                {/* Invisible range input on top */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="absolute inset-0 w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
                />
              </div>
            </div>

            {/* Close Button */}
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 sm:h-8 sm:w-8 xl:h-9 xl:w-9 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={handleClose}
              aria-label="Close player"
            >
              <X className="h-3.5 w-3.5 sm:h-4 sm:w-4 xl:h-5 xl:w-5" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
