"use client";

import { useEffect, useState } from "react";

export default function HeaderBackground() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`
        absolute inset-0 w-full transition-all duration-500 ease-in-out
        ${
          isScrolled
            ? "backdrop-blur-none bg-black opacity-60"
            : "   mask-[linear-gradient(#000_15%,#000000e0_50%,#0000)] backdrop-blur-2xl bg-[linear-gradient(#dde2ee66,#dde2ee00)]"
        }
      `}
    />
  );
}
