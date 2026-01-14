"use client";

import { useState, useCallback, useEffect, RefObject } from "react";

interface UseReaderPaginationProps {
  iframeRef: RefObject<HTMLIFrameElement | null>;
  storageKey: string;
  ready: boolean;
  readMode: "paged" | "scroll";
}

export function useReaderPagination({
  iframeRef,
  storageKey,
  ready,
  readMode,
}: UseReaderPaginationProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [restoredKey, setRestoredKey] = useState<string | null>(null);
  const restoreKey = `${storageKey}-${readMode}`;
  const isPositionRestored = restoredKey === restoreKey;

  const calculateTotalPages = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentWindow) return 0;

    const doc = iframe.contentWindow.document.documentElement;
    const clientWidth = iframe.clientWidth;
    const clientHeight = iframe.clientHeight;

    if (readMode === "scroll") {
      if (clientHeight > 0) {
        const rawTotal = Math.ceil(doc.scrollHeight / clientHeight);
        const calcTotal = Math.max(1, rawTotal);
        setTotalPages(calcTotal);
        return calcTotal;
      }
      return 0;
    }

    if (clientWidth > 0) {
      const rawTotal = Math.ceil(doc.scrollWidth / clientWidth);
      const calcTotal = Math.max(1, rawTotal - 1);
      setTotalPages(calcTotal);
      return calcTotal;
    }
    return 0;
  }, [iframeRef, readMode]);

  const goToPage = useCallback(
    (page: number) => {
      const iframe = iframeRef.current;
      if (!iframe || !iframe.contentWindow) return;

      if (readMode === "scroll") {
        const viewportHeight = iframe.clientHeight;
        iframe.contentWindow.scrollTo({
          top: (page - 1) * viewportHeight,
          behavior: "instant",
        });
      } else {
        const viewportWidth = iframe.clientWidth;
        iframe.contentWindow.scrollTo({
          left: (page - 1) * viewportWidth,
          behavior: "instant",
        });
      }
      setCurrentPage(page);
    },
    [iframeRef, readMode]
  );

  const next = useCallback(() => {
    if (currentPage < totalPages) goToPage(currentPage + 1);
  }, [currentPage, totalPages, goToPage]);

  const prev = useCallback(() => {
    if (currentPage > 1) goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  useEffect(() => {
    if (!ready) return;
    const timer = setTimeout(() => {
      const total = calculateTotalPages();
      setCurrentPage(1);
      if (typeof window !== "undefined") {
        const savedPage = localStorage.getItem(storageKey);
        if (savedPage) {
          const pageNum = parseInt(savedPage, 10);
          if (!isNaN(pageNum) && pageNum > 1 && total > 0 && pageNum <= total) {
            goToPage(pageNum);
          }
        }
      }
      setRestoredKey(restoreKey);
    }, 300);
    return () => clearTimeout(timer);
  }, [ready, calculateTotalPages, goToPage, restoreKey, storageKey]);

  useEffect(() => {
    if (ready && isPositionRestored && currentPage > 0) {
      localStorage.setItem(storageKey, currentPage.toString());
    }
  }, [currentPage, ready, isPositionRestored, storageKey]);

  useEffect(() => {
    const handleResize = () => {
      calculateTotalPages();
      goToPage(currentPage);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [calculateTotalPages, goToPage, currentPage]);

  useEffect(() => {
    if (!ready || readMode !== "scroll") return;
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;

    const handleScroll = () => {
      const viewportHeight = iframe.clientHeight;
      if (viewportHeight <= 0) return;
      const scrollTop =
        iframe.contentWindow?.scrollY ??
        iframe.contentWindow?.pageYOffset ??
        0;
      const nextPage = Math.max(1, Math.floor(scrollTop / viewportHeight) + 1);
      setCurrentPage((prev) => (prev === nextPage ? prev : nextPage));
    };

    handleScroll();
    iframe.contentWindow.addEventListener("scroll", handleScroll);
    return () =>
      iframe.contentWindow?.removeEventListener("scroll", handleScroll);
  }, [iframeRef, readMode, ready]);

  return {
    currentPage,
    totalPages,
    isPositionRestored,
    next,
    prev,
    goToPage,
    calculateTotalPages,
  };
}
