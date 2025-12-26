"use client";

import React from "react";
import { Check, Palette, X } from "lucide-react";

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

interface ReaderSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  currentTheme: string;
  setTheme: (themeId: string) => void;
  currentFont: string;
  setFont: (fontId: string) => void;
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
}: ReaderSettingsProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute top-16 right-4 z-50 w-80 p-5 rounded-xl  border border-border bg-popover text-popover-foreground animate-in fade-in zoom-in-95 duration-200">
      <div className="flex justify-between items-center mb-5 pb-3 border-b border-border">
        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Palette className="w-4 h-4" /> Cấu hình đọc
        </h3>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-full p-1 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="mb-6">
        <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
          Màu nền
        </p>
        <div className="grid grid-cols-4 gap-3">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`
                aspect-square rounded-full border-2 flex items-center justify-center transition-all shadow-sm
                ${t.bgClass} 
                ${t.fgClass}
                ${t.borderClass}
                ${
                  currentTheme === t.id
                    ? "ring-2 ring-ring ring-offset-2 ring-offset-popover scale-105"
                    : "hover:scale-105 hover:shadow-md"
                }
              `}
              title={t.label}
            >
              {currentTheme === t.id && (
                <Check className="w-5 h-5 drop-shadow-sm" strokeWidth={3} />
              )}
              {currentTheme !== t.id && (
                <span className="text-xs font-bold opacity-70">Aa</span>
              )}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-5">
        <p className="text-xs font-medium text-muted-foreground mb-2">Cỡ chữ</p>
        <div className="flex items-center gap-3 bg-muted p-1.5 rounded-lg">
          <button
            onClick={() => setFontSize(Math.max(12, fontSize - 2))}
            className="flex-1 h-8 flex items-center justify-center hover:bg-background rounded shadow-sm text-sm transition-colors"
          >
            A-
          </button>
          <span className="font-mono w-8 text-center text-sm font-semibold">
            {fontSize}
          </span>
          <button
            onClick={() => setFontSize(Math.min(32, fontSize + 2))}
            className="flex-1 h-8 flex items-center justify-center hover:bg-background rounded shadow-sm text-lg transition-colors"
          >
            A+
          </button>
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">
          Kiểu chữ
        </p>
        <div className="flex flex-col gap-1">
          {FONTS.map((font) => (
            <button
              key={font.id}
              onClick={() => setFont(font.id)}
              className={`flex items-center justify-between px-3 py-2 rounded text-sm transition-colors ${
                currentFont === font.id
                  ? "bg-success/10 text-success font-medium"
                  : "hover:bg-muted"
              }`}
            >
              <span style={{ fontFamily: font.value }}>{font.name}</span>
              {currentFont === font.id && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
