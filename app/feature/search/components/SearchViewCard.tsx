"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface SearchViewCardProps {
  title: string;
  description: string;
  href: string;
  active?: boolean;
}

export function SearchViewCard({
  title,
  description,
  href,
  active = false,
}: SearchViewCardProps) {
  return (
    <Link
      href={href}
      prefetch={true}
      className={cn(
        "flex flex-col gap-1 rounded-xl border border-border/60 bg-card/70 p-4 transition hover:border-primary/60 hover:shadow-md",
        active && "border-primary/70 shadow-lg bg-card"
      )}
    >
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {description}
      </span>
      <span className="text-lg font-semibold text-foreground">{title}</span>
    </Link>
  );
}
