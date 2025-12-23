import { useRef } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface FileUploadButtonProps {
  label: string;
  accept: string;
  buttonText: string;
  required?: boolean;
  onChange: (file: File) => void;
  selectedFile?: File;
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onChange(file);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          className="w-full"
        >
          <Upload className="mr-2 h-4 w-4" />
          {buttonText}
        </Button>
        <input
          ref={inputRef}
          type="file"
          onChange={handleChange}
          accept={accept}
          className="hidden"
        />
      </div>
      {selectedFile && (
        <p className="text-sm text-success">✓ Đã chọn: {selectedFile.name}</p>
      )}
      {error && <p className="text-sm text-warning-foreground">{error}</p>}
    </div>
  );
}
