"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface LoginRequiredDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

export function LoginRequiredDialog({
  open,
  onOpenChange,
  title = "Yêu cầu đăng nhập",
  description = "Bạn cần đăng nhập để thực hiện tính năng này.",
}: LoginRequiredDialogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleLogin = useCallback(() => {
    const search = searchParams?.toString();
    const nextPath =
      pathname && pathname.length > 0
        ? search && search.length > 0
          ? `${pathname}?${search}`
          : pathname
        : "/";
    const callbackUrl = encodeURIComponent(nextPath);
    router.push(`/login?callbackUrl=${callbackUrl}`);
    onOpenChange(false);
  }, [pathname, router, searchParams, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[400px] gap-6 rounded-2xl border border-border/50 bg-card/80 backdrop-blur-[5px] p-6 shadow-2xl sm:max-w-[400px]">
        <DialogHeader className="flex flex-col items-center text-center gap-4 space-y-0">
          {/* Warning Icon */}
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/20">
            <AlertTriangle className="h-10 w-10 text-amber-500" />
          </div>
          
          <DialogTitle className="text-xl font-bold text-card-foreground">
            {title}
          </DialogTitle>
          
          <DialogDescription className="text-muted-foreground text-center text-base">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex flex-row gap-3 sm:justify-center">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
            className="flex-1 h-11 rounded-xl border border-border/50 bg-secondary/50 hover:bg-secondary/80 text-secondary-foreground font-medium"
          >
            Hủy bỏ
          </Button>
          <Button
            type="button"
            onClick={handleLogin}
            className="flex-1 h-11 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 font-medium"
          >
            Đăng nhập
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

