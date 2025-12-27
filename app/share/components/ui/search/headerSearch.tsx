"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface HeaderSearchProps {
  compact?: boolean;
}

export default function HeaderSearch({ compact = false }: HeaderSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(() => searchParams?.get("q") ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setQuery(searchParams?.get("q") ?? "");
  }, [searchParams]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const navigateToResults = (value: string) => {
    const trimmed = value.trim();
    const target = trimmed
      ? `/search?q=${encodeURIComponent(trimmed)}`
      : "/search";
    router.push(target);
  };

  const scheduleNavigation = (value: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      navigateToResults(value);
    }, 500);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    navigateToResults(query);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "relative flex items-center",
        compact ? "max-w-[200px]" : "w-full"
      )}
    >
      <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
      <Input
        value={query}
        onChange={(event) => {
          const nextValue = event.target.value;
          setQuery(nextValue);
          scheduleNavigation(nextValue);
        }}
        placeholder="Search books or authors"
        className={cn(
          "pl-9 pr-3 h-9 bg-background/80 backdrop-blur-sm text-sm",
          compact ? "text-xs" : "text-sm"
        )}
        aria-label="Search books or authors"
      />
    </form>
  );
}

