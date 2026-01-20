"use client";

import { useEffect, useRef, useState } from "react";
import type { NoteColor } from "@/app/types/book.types";
import { toast } from "sonner";

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
    const noteText = textareaRef.current?.value ?? "";
    if (!noteText.trim()) {
      toast.error("Hãy thêm ghi chú của bạn trước");
      return;
    }

    onSave(noteText, color);
    if (textareaRef.current) {
      textareaRef.current.value = "";
    }
    toast.success("Thêm ghi chú thành công");
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
      className="overlay-backdrop absolute inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="w-96 max-w-[90vw] rounded-lg border border-border bg-white p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="mb-4 font-semibold">Thêm ghi chú</h3>
        <div className="mb-4">
          <p className="mb-2 text-sm text-muted-foreground">
            Đoạn văn đã chọn:
          </p>
          <p className="rounded bg-muted p-2 text-sm italic">
            {selectedText.substring(0, 100)}
            {selectedText.length > 100 ? "..." : ""}
          </p>
        </div>
        <textarea
          ref={textareaRef}
          placeholder="Nhập ghi chú của bạn..."
          className="mb-4 min-h-[100px] w-full resize-none rounded-md border border-border bg-background p-2 text-foreground"
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
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-md border border-border px-4 py-2 transition-colors hover:bg-muted"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}
