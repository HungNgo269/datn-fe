"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { Info, LogOut, CreditCard, Edit } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOutButton } from "./logoutButton";
import { useAuthStore } from "@/app/store/useAuthStore";

export function HeaderButton() {
  const user = useAuthStore((state) => state.user);

  const initials =
    user?.username
      ?.split(" ")
      .map((s: string) => s[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "NB";

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full md:h-12 md:w-12 hover:bg-accent"
        >
          <Avatar className="h-10 w-10 md:h-12 md:w-12">
            <AvatarImage src={user?.avatar || "/jawed.jpg"} alt={user?.username || "User"} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64 md:w-72" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user?.username || "Độc giả"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email || "Chưa cập nhật email"}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="cursor-pointer" asChild>
          <Link href="/account" className="flex items-center w-full">
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Favourite Books</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="cursor-pointer">
            <Info className="mr-2 h-4 w-4" />
            <span>Learn More</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent
            sideOffset={5}
            alignOffset={0}
            avoidCollisions
            collisionPadding={8}
          >
            <DropdownMenuItem className="cursor-pointer">
              <Info className="w-4 h-4 mr-2" />
              Advertiser
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Edit className="w-4 h-4 mr-2" />
              Become Editor
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="cursor-pointer p-0">
          <div className="w-full hover:bg-destructive/10">
            <LogOutButton />
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
