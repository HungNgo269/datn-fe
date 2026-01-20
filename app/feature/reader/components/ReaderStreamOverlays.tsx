"use client";

import React from "react";

interface ReaderStreamProgressProps {
  progress: number;
}

export function ReaderStreamProgress({ progress }: ReaderStreamProgressProps) {
  return (
    <div className="absolute left-0 right-0 top-0 z-30">
      <div
        className="h-1 bg-green-500 transition-all duration-150"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export function ReaderStreamSkeleton() {
  return (
    <div className="absolute inset-0 z-20 flex items-start justify-center bg-background/70 px-6 py-12">
      <div className="w-full max-w-3xl space-y-3 animate-pulse">
        <div className="h-4 w-11/12 rounded bg-muted" />
        <div className="h-4 w-5/6 rounded bg-muted" />
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-10/12 rounded bg-muted" />
      </div>
    </div>
  );
}

interface ReaderStreamErrorProps {
  onRetry: () => void;
}

export function ReaderStreamError({ onRetry }: ReaderStreamErrorProps) {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="rounded-lg border bg-card p-4 text-center shadow-sm">
        <p className="text-sm text-muted-foreground">
          Không thể tải chương này.
        </p>
        <button
          type="button"
          className="mt-3 inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          onClick={onRetry}
        >
          Thử lại
        </button>
      </div>
    </div>
  );
}

export function ReaderBlockingOverlay() {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-green-500" />
    </div>
  );
}
