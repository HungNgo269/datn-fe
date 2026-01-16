import { useCallback, useRef } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface FileUploadButtonProps {
  label: string;
  accept: string;
  buttonText: string;
  required?: boolean;
  onChange: (file: File) => void;
  selectedFile?: File | string;
  error?: string;
}

export function UploadBookButton({
  label,
  accept,
  buttonText,
  required = false,
  onChange,
  selectedFile,
  error,
}: FileUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onChange(file);
    },
    [onChange]
  );

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-row gap-1"
        >
          <Upload className="mr-2 h-4 w-4" />
          <span className="w-full max-w-[300px] truncate">{buttonText}</span>
        </Button>
        <input
          ref={inputRef}
          type="file"
          onChange={handleChange}
          accept={accept}
          required={required}
          className="hidden"
        />
      </div>
      {selectedFile && (
        <div className="mt-1 text-sm text-muted-foreground">
          Đã chọn: {selectedFile instanceof File ? selectedFile.name : selectedFile}
        </div>
      )}
      {error && <p className="text-sm text-destructive-foreground">{error}</p>}
    </div>
  );
}
