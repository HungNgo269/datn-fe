"use client";

import { useEffect, useState } from "react";

export default function HeaderBackground() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let rafId = 0;
    const handleScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        const nextValue = window.scrollY > 10;
        setIsScrolled((prev) => (prev !== nextValue ? nextValue : prev));
      });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);

  return (
    <div
      className={`
        absolute inset-0 w-full transition-all duration-500 ease-in-out
        ${
          isScrolled
            ? "backdrop-blur-none header-solid-overlay"
            : "   mask-[linear-gradient(#000_15%,#000000e0_50%,#0000)] backdrop-blur-2xl bg-[linear-gradient(#dde2ee66,#dde2ee00)]"
        }
      `}
    />
  );
}
