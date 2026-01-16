"use client";

import { Button } from "@/components/ui/button";
import { Loader2, Share } from "lucide-react";

export default function ShareButton() {
  const isLoading = false;

  return (
    <Button
      className="h-full w-full rounded-sm border border-border px-14 text-lg hover:cursor-pointer"
      disabled={isLoading}
      onClick={() => {
        // handleClick();
      }}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      ) : (
        <Share className="mr-1.5 h-5 w-5" strokeWidth={2.5} />
      )}
      Chia sẻ cuốn sách
    </Button>
  );
}
