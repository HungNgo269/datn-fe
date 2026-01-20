"use client";

import { Check, Palette, X } from "lucide-react";
import { useOutsideClick } from "@/lib/hooks/useOutsideClick";
import type { ReaderReadMode } from "@/app/types/book.types";

export const THEMES = [
  {
    id: "light",
    bgClass: "bg-reader-light",
    fgClass: "text-reader-light-fg",
    borderClass: "border-border",
    label: "Sáng",
    bgVar: "--reader-light",
    fgVar: "--reader-light-fg",
  },
  {
    id: "sepia",
    bgClass: "bg-reader-sepia",
    fgClass: "text-reader-sepia-fg",
    borderClass: "border-border",
    label: "Vàng",
    bgVar: "--reader-sepia",
    fgVar: "--reader-sepia-fg",
  },
  {
    id: "gray",
    bgClass: "bg-reader-gray",
    fgClass: "text-reader-gray-fg",
    borderClass: "border-border",
    label: "Xám",
    bgVar: "--reader-gray",
    fgVar: "--reader-gray-fg",
  },
  {
    id: "dark",
    bgClass: "bg-reader-dark",
    fgClass: "text-reader-dark-fg",
    borderClass: "border-border",
    label: "Tối",
    bgVar: "--reader-dark",
    fgVar: "--reader-dark-fg",
  },
];

export const FONTS = [
  {
    id: "sans",
    name: "Mặc định",
    value: "ui-sans-serif, system-ui, sans-serif",
  },
  { id: "serif", name: "Bookerly", value: "Bookerly, Georgia, serif" },
  { id: "arial", name: "Arial", value: "Arial, Helvetica, sans-serif" },
  {
    id: "times",
    name: "Times New Roman",
    value: "'Times New Roman', Times, serif",
  },
];

export const READ_MODES: Array<{ id: ReaderReadMode; label: string }> = [
  { id: "paged", label: "Từng trang" },
  { id: "scroll", label: "Cuộn dọc" },
];

interface ReaderSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  currentTheme: string;
  setTheme: (themeId: string) => void;
  currentFont: string;
  setFont: (fontId: string) => void;
  readMode: ReaderReadMode;
  setReadMode: (mode: ReaderReadMode) => void;
}

export default function ReaderSettings({
  isOpen,
  onClose,
  fontSize,
  setFontSize,
  currentTheme,
  setTheme,
  currentFont,
  setFont,
  readMode,
  setReadMode,
}: ReaderSettingsProps) {
  const panelRef = useOutsideClick<HTMLDivElement>({
    enabled: isOpen,
    onOutside: onClose,
  });

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className="absolute right-4 top-16 z-50 w-80 rounded-xl border border-border bg-popover p-5 text-popover-foreground animate-in fade-in zoom-in-95 duration-200"
    >
      <div className="mb-5 flex items-center justify-between border-b border-border pb-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          <Palette className="h-4 w-4" /> Cấu hình đọc
        </h3>
        <button
          onClick={onClose}
          className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="mb-6">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Màu nền
        </p>
        <div className="grid grid-cols-4 gap-3">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`
                flex aspect-square cursor-pointer items-center justify-center rounded-full border-2 shadow-sm transition-all
                ${t.bgClass}
                ${t.fgClass}
                ${t.borderClass}
                ${
                  currentTheme === t.id
                    ? "scale-105 ring-2 ring-ring ring-offset-2 ring-offset-popover"
                    : "hover:scale-105 hover:shadow-md"
                }
              `}
              title={t.label}
            >
              {currentTheme === t.id ? (
                <Check className="h-5 w-5 drop-shadow-sm" strokeWidth={3} />
              ) : (
                <span className="text-xs font-bold opacity-70">Aa</span>
              )}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-5">
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          Chế độ đọc
        </p>
        <div className="grid grid-cols-2 gap-2">
          {READ_MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setReadMode(mode.id)}
              className={`flex cursor-pointer items-center justify-center rounded px-3 py-2 text-sm transition-colors ${
                readMode === mode.id
                  ? "bg-success/10 font-medium text-success"
                  : "hover:bg-muted"
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-5">
        <p className="mb-2 text-xs font-medium text-muted-foreground">Cỡ chữ</p>
        <div className="flex items-center gap-3 rounded-lg bg-muted p-1.5">
          <button
            onClick={() => setFontSize(Math.max(12, fontSize - 2))}
            className="flex h-8 flex-1 cursor-pointer items-center justify-center rounded text-sm shadow-sm transition-colors hover:bg-background"
          >
            A-
          </button>
          <span className="w-8 text-center font-mono text-sm font-semibold">
            {fontSize}
          </span>
          <button
            onClick={() => setFontSize(Math.min(32, fontSize + 2))}
            className="flex h-8 flex-1 cursor-pointer items-center justify-center rounded text-lg shadow-sm transition-colors hover:bg-background"
          >
            A+
          </button>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          Kiểu chữ
        </p>
        <div className="flex flex-col gap-1">
          {FONTS.map((font) => (
            <button
              key={font.id}
              onClick={() => setFont(font.id)}
              className={`flex cursor-pointer items-center justify-between rounded px-3 py-2 text-sm transition-colors ${
                currentFont === font.id
                  ? "bg-success/10 font-medium text-success"
                  : "hover:bg-muted"
              }`}
            >
              <span style={{ fontFamily: font.value }}>{font.name}</span>
              {currentFont === font.id && <Check className="h-4 w-4" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
