"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Info, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function HeaderClientColor() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const effectiveTheme = theme === "system" ? resolvedTheme : theme;
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" title="Theme" className="w-10 h-10">
          {effectiveTheme === "dark" ? (
            <Moon className="w-5 h-5" />
          ) : (
            <Sun className="w-5 h-5" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="bottom"
        sideOffset={5}
        alignOffset={0}
        avoidCollisions={true}
        collisionPadding={8}
      >
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="cursor-pointer"
          title="Sáng"
        >
          <Sun className="w-4 h-4 mr-2" />
          Sáng
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          title="Tối"
          className="cursor-pointer"
        >
          <Moon className="w-4 h-4 mr-2" />
          Tối
        </DropdownMenuItem>
        <DropdownMenuItem
          title="Hệ Thống"
          onClick={() => setTheme("system")}
          className="cursor-pointer"
        >
          <Info className="w-4 h-4 mr-2" />
          Hệ thống
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
