"use client";

import { FormEvent, Suspense, useCallback, useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface HeaderSearchProps {
  compact?: boolean;
}

function HeaderSearchContent({ compact = false }: HeaderSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramQuery = useMemo(() => searchParams?.get("q") ?? "", [searchParams]);
  const queryRef = useRef(paramQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    queryRef.current = paramQuery;
  }, [paramQuery]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const navigateToResults = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      const target = trimmed
        ? `/search?q=${encodeURIComponent(trimmed)}`
        : "/search";
      router.push(target);
    },
    [router]
  );

  const scheduleNavigation = useCallback(
    (value: string) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        navigateToResults(value);
      }, 500);
    },
    [navigateToResults]
  );

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      navigateToResults(queryRef.current);
    },
    [navigateToResults]
  );

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "relative flex items-center",
        compact ? "max-w-[200px]" : "w-full"
      )}
    >
      <Search className="absolute left-3 h-4 w-4 text-primary z-10" />
      <Input
        key={paramQuery}
        defaultValue={paramQuery}
        onChange={(event) => {
          const nextValue = event.target.value;
          queryRef.current = nextValue;
          scheduleNavigation(nextValue);
        }}
        placeholder="Tìm kiếm sách / tác giả"
        className={cn(
          "pl-9 pr-3 h-9 bg-background/80 backdrop-blur-sm text-sm",
          compact ? "text-xs" : "text-sm"
        )}
        aria-label="Tìm kiếm sách / tác giả"
      />
    </form>
  );
}

export default function HeaderSearch(props: HeaderSearchProps) {
  return (
    <Suspense fallback={<div className="h-9 w-full" />}>
      <HeaderSearchContent {...props} />
    </Suspense>
  );
}
