"use client";

import { useRef, useEffect } from "react";

interface ReaderNoteDialogProps {
  isOpen: boolean;
  selectedText: string;
  onClose: () => void;
  onSave: (noteText: string) => void;
}

export default function ReaderNoteDialog({
  isOpen,
  selectedText,
  onClose,
  onSave,
}: ReaderNoteDialogProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (textareaRef.current) {
      onSave(textareaRef.current.value);
      textareaRef.current.value = "";
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
    <div className="absolute inset-0 overlay-backdrop flex items-center justify-center z-50">
      <div className="bg-popover border border-border rounded-lg p-6 w-96 max-w-[90vw] shadow-xl">
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
            Lưu (Ctrl+Enter)
          </button>
        </div>
      </div>
    </div>
  );
}
