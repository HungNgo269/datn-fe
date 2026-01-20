import { cn } from "@/lib/utils";

interface LoadingBarProps {
  progress: number;
  className?: string;
}

export function LoadingBar({ progress, className }: LoadingBarProps) {
  return (
    <div
      className={cn(
        "h-1 w-full bg-slate-100 overflow-hidden",
        className
      )}
    >
      <div
        className="h-full bg-primary transition-all duration-300 ease-out"
        style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
      />
    </div>
  );
}
