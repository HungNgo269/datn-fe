"use client";

import { useState, useCallback, useEffect, RefObject } from "react";

interface UseReaderPaginationProps {
  iframeRef: RefObject<HTMLIFrameElement | null>;
  storageKey: string;
  ready: boolean;
}

export function useReaderPagination({
  iframeRef,
  storageKey,
  ready,
}: UseReaderPaginationProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isPositionRestored, setIsPositionRestored] = useState(false);

  const calculateTotalPages = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentWindow) return 0;

    const doc = iframe.contentWindow.document.documentElement;
    const clientWidth = iframe.clientWidth;

    if (clientWidth > 0) {
      const rawTotal = Math.ceil(doc.scrollWidth / clientWidth);
      const calcTotal = Math.max(1, rawTotal - 1);
      setTotalPages(calcTotal);
      return calcTotal;
    }
    return 0;
  }, [iframeRef]);

  const goToPage = useCallback(
    (page: number) => {
      const iframe = iframeRef.current;
      if (!iframe || !iframe.contentWindow) return;

      const viewportWidth = iframe.clientWidth;
      iframe.contentWindow.scrollTo({
        left: (page - 1) * viewportWidth,
        behavior: "instant",
      });
      setCurrentPage(page);
    },
    [iframeRef]
  );

  const next = useCallback(() => {
    if (currentPage < totalPages) goToPage(currentPage + 1);
  }, [currentPage, totalPages, goToPage]);

  const prev = useCallback(() => {
    if (currentPage > 1) goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  useEffect(() => {
    if (ready) {
      setTimeout(() => {
        const total = calculateTotalPages();
        if (typeof window !== "undefined") {
          const savedPage = localStorage.getItem(storageKey);
          if (savedPage) {
            const pageNum = parseInt(savedPage, 10);
            if (
              !isNaN(pageNum) &&
              pageNum > 1 &&
              total > 0 &&
              pageNum <= total
            ) {
              goToPage(pageNum);
            }
          }
        }
        setIsPositionRestored(true);
      }, 300);
    }
  }, [ready, calculateTotalPages, goToPage, storageKey]);

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
