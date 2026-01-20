"use client";

import { Input } from "@/components/ui/input";
import clsx from "clsx";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import {
  ReadonlyURLSearchParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { PaginationMeta } from "@/app/types/api.types";
import { generatePagination } from "./generatePagination";

interface PaginationProps {
  meta: PaginationMeta;
  hashUrl?: string;
  pageParamKey?: string;
}

function PaginationContent({
  meta,
  hashUrl,
  pageParamKey = "page",
}: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = meta.page;
  const totalPages = meta.totalPages;

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set(pageParamKey, pageNumber.toString());
    return `${pathname}?${params.toString()}${hashUrl ? `#${hashUrl}` : ""}`;
  };

  const allPages = generatePagination(currentPage, totalPages);

  return (
    <div className="inline-flex w-full justify-center">
      <PaginationArrow
        direction="left"
        href={createPageURL(currentPage - 1)}
        isDisabled={!meta.hasPreviousPage}
      />

      <div className="flex gap-1">
        {allPages.map((page, index) => {
          let position: "first" | "last" | "single" | "middle" | undefined;

          if (index === 0) position = "first";
          if (index === allPages.length - 1) position = "last";
          if (allPages.length === 1) position = "single";
          if (page === "...") position = "middle";

          return (
            <PaginationNumber
              key={`${page}-${index}`}
              href={createPageURL(page)}
              totalPages={totalPages}
              page={page}
              pathname={pathname}
              searchParams={searchParams}
              position={position}
              isActive={currentPage === page}
              hashUrl={hashUrl}
              pageParamKey={pageParamKey}
            />
          );
        })}
      </div>

      <PaginationArrow
        direction="right"
        href={createPageURL(currentPage + 1)}
        isDisabled={!meta.hasNextPage}
      />
    </div>
  );
}

export function Pagination(props: PaginationProps) {
  return (
    <Suspense fallback={<div className="h-10 w-full" />}>
      <PaginationContent {...props} />
    </Suspense>
  );
}

function PaginationNumber({
  page,
  href,
  isActive,
  position,
  totalPages,
  searchParams,
  pathname,
  hashUrl,
  pageParamKey,
}: {
  page: number | string;
  href: string;
  position?: "first" | "last" | "middle" | "single";
  isActive: boolean;
  totalPages: number;
  searchParams: ReadonlyURLSearchParams;
  pathname: string;
  hashUrl?: string;
  pageParamKey: string;
}) {
  const [openInput, setOpenInput] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleNavigate = () => {
    const pageNum = parseInt(ref.current?.value || "");
    if (pageNum >= 1 && pageNum <= totalPages) {
      const params = new URLSearchParams(searchParams);
      params.set(pageParamKey, pageNum.toString());
      router.push(
        `${pathname}?${params.toString()}${hashUrl ? `#${hashUrl}` : ""}`
      );
    }
    setOpenInput(false);
  };

  const handleBlur = () => {
    handleNavigate();
  };

  useEffect(() => {
    const focus = () => {
      ref?.current?.focus();
    };
    if (openInput) {
      focus();
    }
  }, [openInput]);

  const className = clsx(
    "flex h-10 w-10 items-center justify-center font-semibold text-sm rounded-md transition-colors",
    {
      "bg-primary text-primary-foreground hover:bg-primary/90": isActive,
      "hover:bg-muted bg-background border border-border": !isActive,
    }
  );

  if (position === "middle" && !isActive) {
    return (
      <>
        {openInput === true ? (
          <div className="h-10 w-20">
            <Input
              className="w-full h-full"
              id="pageNumber"
              name="pageNumber"
              ref={ref}
              onBlur={handleBlur}
              type="number"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleNavigate();
                }
                if (e.key === "Escape") {
                  setOpenInput(false);
                }
              }}
            />
          </div>
        ) : (
          <div
            onClick={() => {
              setOpenInput(true);
            }}
            className={className}
          >
            {page}
          </div>
        )}
      </>
    );
  }

  if (isActive || position === "middle") {
    return <div className={className}>{page}</div>;
  }

  if (!isActive) {
    return (
      <Link prefetch={true} href={href} className={className}>
        {page}
      </Link>
    );
  }
}

function PaginationArrow({
  href,
  direction,
  isDisabled,
}: {
  href: string;
  direction: "left" | "right";
  isDisabled?: boolean;
}) {
  const className = clsx(
    "flex h-10 w-10 items-center justify-center rounded-md transition-colors border border-border",
    {
      "pointer-events-none text-muted-foreground opacity-50": isDisabled,
      "hover:bg-muted": !isDisabled,
      "mr-2 md:mr-4": direction === "left",
      "ml-2 md:ml-4": direction === "right",
    }
  );

  const icon =
    direction === "left" ? (
      <ArrowLeftIcon className="w-4" />
    ) : (
      <ArrowRightIcon className="w-4" />
    );

  return isDisabled ? (
    <div className={className}>{icon}</div>
  ) : (
    <Link prefetch={true} className={className} href={href}>
      {icon}
    </Link>
  );
}
