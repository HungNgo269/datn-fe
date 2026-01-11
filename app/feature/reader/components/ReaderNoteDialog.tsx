"use client";

import { useRef, useEffect, useState } from "react";
import type { NoteColor } from "@/app/store/useReaderDataStore";
import { toast, Toaster } from "sonner";

interface ReaderNoteDialogProps {
  isOpen: boolean;
  selectedText: string;
  onClose: () => void;
  onSave: (noteText: string, color: NoteColor) => void;
}

const NOTE_COLORS: { value: NoteColor; label: string; className: string }[] = [
  { value: "yellow", label: "Yellow", className: "bg-yellow-300" },
  { value: "green", label: "Green", className: "bg-green-300" },
  { value: "blue", label: "Blue", className: "bg-blue-300" },
  { value: "pink", label: "Pink", className: "bg-pink-300" },
  { value: "purple", label: "Purple", className: "bg-purple-300" },
];

export default function ReaderNoteDialog({
  isOpen,
  selectedText,
  onClose,
  onSave,
}: ReaderNoteDialogProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [color, setColor] = useState<NoteColor>("yellow");

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    toast.error("Hãy thêm ghi chú của bạn trước");

    if (textareaRef.current) {
      onSave(textareaRef.current.value, color);
      textareaRef.current.value = "";
      toast.success("Thêm ghi chú thành công");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleSave();
    }
    if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div
      className="absolute inset-0 overlay-backdrop flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white border border-border rounded-lg p-6 w-96 max-w-[90vw] "
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="font-semibold mb-4">Thêm ghi chú</h3>
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">
            Đoạn văn đã chọn:
          </p>
          <p className="text-sm bg-muted p-2 rounded italic">
            {selectedText.substring(0, 100)}
            {selectedText.length > 100 ? "..." : ""}
          </p>
        </div>
        <textarea
          ref={textareaRef}
          placeholder="Nhập ghi chú của bạn..."
          className="w-full p-2 border border-border rounded-md bg-background text-foreground mb-4 min-h-[100px] resize-none"
          onKeyDown={handleKeyDown}
        />
        <div className="mb-4">
          <div className="flex items-center gap-2">
            {NOTE_COLORS.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-label={option.label}
                onClick={() => setColor(option.value)}
                className={`h-7 w-7 rounded-full border border-border ${
                  option.className
                } ${color === option.value ? "ring-2 ring-primary" : ""}`}
              />
            ))}
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-border hover:bg-muted transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}
